import fs from 'fs';

let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

const heartbeatLogic = `  // Heartbeat ping
  useEffect(() => {
    if (!roomId || !db) return;
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
  }, [roomId, isPlayer1]);

  // Monitor opponent ping
  useEffect(() => {
    if (!dbData || dbData.status === 'finished') return;
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const opponentPing = isPlayer1 ? dbData.player2LastPing : dbData.player1LastPing;
      if (opponentPing && (now - opponentPing > 15000)) {
        updateDoc(doc(db, 'pvp_rooms', roomId), {
          [isPlayer1 ? 'player2Left' : 'player1Left']: true
        }).catch(console.error);
      }
    }, 3000);
    return () => clearInterval(checkInterval);
  }, [dbData, isPlayer1, roomId]);

  // Sync with Firebase`;

content = content.replace("  // Sync with Firebase", heartbeatLogic);

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
