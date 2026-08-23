import fs from 'fs';

let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

// I will overwrite the heartbeat logic added previously.
// Let's find exactly what was added.

const newHeartbeatLogic = `  // Heartbeat ping
  useEffect(() => {
    if (!roomId || !db || !dbData || dbData.status === 'finished') return;
    const pingInterval = setInterval(async () => {
      try {
        await updateDoc(doc(db, 'pvp_rooms', roomId), {
          [isPlayer1 ? 'player1LastPing' : 'player2LastPing']: Date.now()
        });
      } catch (err) {
        console.error("Ping error", err);
      }
    }, 5000);
    return () => clearInterval(pingInterval);
  }, [roomId, isPlayer1, dbData?.status]);

  // Monitor opponent ping
  useEffect(() => {
    if (!dbData || dbData.status === 'finished' || dbData.status === 'waiting') return;
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const opponentPing = isPlayer1 ? dbData.player2LastPing : dbData.player1LastPing;
      
      // If we are playing, the opponent's ping should be updated at least every 5-10s.
      // We give a 15-second grace period.
      if (opponentPing && (now - opponentPing > 15000)) {
        updateDoc(doc(db, 'pvp_rooms', roomId), {
          [isPlayer1 ? 'player2Left' : 'player1Left']: true
        }).catch(console.error);
      }
    }, 3000);
    return () => clearInterval(checkInterval);
  }, [dbData, isPlayer1, roomId]);`;

content = content.replace(/  \/\/ Heartbeat ping[\s\S]*? \/\/ Sync with Firebase/, newHeartbeatLogic + "\n\n  // Sync with Firebase");

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
