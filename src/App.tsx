/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, Difficulty, Track } from './types';
import { fetchTracks } from './api';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { PvpGameScreen } from './components/PvpGameScreen';
import { io, Socket } from 'socket.io-client';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('lett');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => {
    // Initialize socket
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('pvp_queue_joined', () => {
      setGameState('pvp_queue');
    });

    newSocket.on('pvp_game_start', ({ roomId: rId, tracks: pvpTracks }) => {
      setRoomId(rId);
      setTracks(pvpTracks);
      setGameState('pvp_playing');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleStart = async (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState('loading');
    try {
      const fetchedTracks = await fetchTracks(selectedDifficulty);
      if (fetchedTracks.length === 0) {
        alert('Kunne ikke hente sanger. Prøv igjen.');
        setGameState('start');
        return;
      }
      setTracks(fetchedTracks);
      setGameState('playing');
    } catch (error) {
      console.error(error);
      alert('En feil oppstod.');
      setGameState('start');
    }
  };

  const handleJoinPvp = () => {
    if (socket) {
      socket.emit('join_pvp', difficulty);
    }
  };

  const handleFinish = (finalScore: number, total: number) => {
    setScore(finalScore);
    setTotalRounds(total);
    setGameState('result');
  };

  const handlePvpFinish = (myScore: number, oppScore: number) => {
    setScore(myScore);
    setOpponentScore(oppScore);
    setTotalRounds(tracks.length);
    setGameState('pvp_result');
  };

  const handleRestart = () => {
    setGameState('start');
    setTracks([]);
    setScore(0);
    setOpponentScore(0);
  };

  return (
    <div 
      className="min-h-screen text-white font-sans flex flex-col overflow-x-hidden relative selection:bg-emerald-500/30 bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: 'url(/background.jpg)' }}
    >
      <div className="fixed inset-0 bg-[#020617]/70 pointer-events-none"></div>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>
      
      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 py-8 md:px-12 gap-6 md:gap-0">
        <div className="flex items-center cursor-pointer" onClick={handleRestart}>
          <img src="/MUSIKKLOGO.png" alt="NorskMusikk" className="w-40 md:w-48 h-auto object-contain drop-shadow-xl" />
        </div>
        
        <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10 flex-wrap justify-center">
          {(['lett', 'medium', 'vanskelig', 'umulig'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => handleStart(d)}
              disabled={gameState === 'loading'}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize disabled:opacity-50 disabled:cursor-not-allowed ${
                difficulty === d && gameState !== 'start'
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-12">
        {gameState === 'start' && <StartScreen onSelectDifficulty={handleStart} onJoinPvp={handleJoinPvp} />}
        {gameState === 'loading' && <StartScreen onSelectDifficulty={() => {}} isLoading={true} />}
        {gameState === 'pvp_queue' && (
          <div className="flex flex-col items-center text-center">
             <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm">Leter etter motstander...</p>
             <p className="text-white/40 text-xs mt-2">Dette kan ta litt tid. Gjør deg klar!</p>
          </div>
        )}
        {gameState === 'playing' && <GameScreen tracks={tracks} onFinish={handleFinish} />}
        {gameState === 'pvp_playing' && socket && (
          <PvpGameScreen socket={socket} roomId={roomId} tracks={tracks} onFinish={handlePvpFinish} />
        )}
        {gameState === 'result' && <ResultScreen score={score} total={totalRounds} onRestart={handleRestart} difficulty={difficulty} />}
        {gameState === 'pvp_result' && (
          <ResultScreen score={score} total={totalRounds} onRestart={handleRestart} isPvp={true} opponentScore={opponentScore} difficulty={difficulty} />
        )}
      </div>
    </div>
  );
}
