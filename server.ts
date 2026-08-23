import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fetchTracks } from './src/api';
import { Track } from './src/types';

// Fallback for __dirname in ESM or CJS
const dir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // PVP Game State
  const queue: string[] = [];
  const activeGames = new Map<string, {
    players: string[];
    scores: Record<string, number>;
    currentRound: number;
    tracks: Track[];
    roundStartTime: number;
    correctGuessers: string[];
    roundTimeout: NodeJS.Timeout | null;
  }>();

  function endRound(roomId: string) {
    const game = activeGames.get(roomId);
    if (!game) return;

    io.to(roomId).emit('pvp_round_end', {
      scores: game.scores,
      correctGuessers: game.correctGuessers
    });

    setTimeout(() => {
      const currentParams = activeGames.get(roomId);
      if (!currentParams) return;
      currentParams.currentRound += 1;
      currentParams.correctGuessers = [];
      currentParams.roundTimeout = null;

      if (currentParams.currentRound >= 5) {
        io.to(roomId).emit('pvp_game_over', { scores: currentParams.scores });
        activeGames.delete(roomId);
      } else {
        currentParams.roundStartTime = Date.now();
        io.to(roomId).emit('pvp_next_round', { roundIndex: currentParams.currentRound });
      }
    }, 4000);
  }

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_pvp', async (difficulty: string) => {
      // Very simple matchmaking for demonstration: just match any two players
      queue.push(socket.id);
      socket.emit('pvp_queue_joined');

      if (queue.length >= 2) {
        const player1 = queue.shift()!;
        const player2 = queue.shift()!;
        const roomId = `room_${Date.now()}`;
        
        // Fetch tracks for the game
        try {
          // Defaulting to "medium" if difficulty is not passed properly, or whatever they requested
          const tracks = await fetchTracks((difficulty || 'medium') as any);
          
          activeGames.set(roomId, {
            players: [player1, player2],
            scores: { [player1]: 0, [player2]: 0 },
            currentRound: 0,
            tracks: tracks.slice(0, 5), // 5 rounds
            roundStartTime: Date.now(),
            correctGuessers: [],
            roundTimeout: null
          });

          // Join socket rooms
          const p1Socket = io.sockets.sockets.get(player1);
          const p2Socket = io.sockets.sockets.get(player2);
          
          if (p1Socket && p2Socket) {
            p1Socket.join(roomId);
            p2Socket.join(roomId);

            io.to(roomId).emit('pvp_game_start', {
              roomId,
              tracks: tracks.slice(0, 5),
              players: [player1, player2]
            });
          }
        } catch (e) {
          console.error("Failed to start PVP game", e);
        }
      }
    });

    socket.on('pvp_guess', ({ roomId, guess, isCorrect }) => {
      const game = activeGames.get(roomId);
      if (!game) return;

      if (isCorrect && !game.correctGuessers.includes(socket.id)) {
        game.correctGuessers.push(socket.id);
        game.scores[socket.id] += 1;
        
        io.to(roomId).emit('pvp_score_update', game.scores);

        if (game.correctGuessers.length === 1) {
          io.to(roomId).emit('pvp_countdown_start', { firstGuesser: socket.id, seconds: 10 });
          game.roundTimeout = setTimeout(() => {
            endRound(roomId);
          }, 10000);
        } else if (game.correctGuessers.length === 2) {
          if (game.roundTimeout) clearTimeout(game.roundTimeout);
          endRound(roomId);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      const qIndex = queue.indexOf(socket.id);
      if (qIndex > -1) queue.splice(qIndex, 1);
      
      // Handle forfeit
      for (const [roomId, game] of activeGames.entries()) {
        if (game.players.includes(socket.id)) {
          if (game.roundTimeout) clearTimeout(game.roundTimeout);
          io.to(roomId).emit('pvp_opponent_disconnected');
          activeGames.delete(roomId);
        }
      }
    });
  });

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
