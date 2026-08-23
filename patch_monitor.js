import fs from 'fs';

let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

// I will overwrite the heartbeat logic again.

const newHeartbeatLogic = `  const latestDbData = useRef<any>(null);
  useEffect(() => {
    latestDbData.current = dbData;
  }, [dbData]);

  // Heartbeat ping
  useEffect(() => {
    if (!roomId || !db) return;
    const pingInterval = setInterval(async () => {
      if (latestDbData.current?.status === 'finished') return;
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
    if (!roomId) return;
    const checkInterval = setInterval(() => {
      const data = latestDbData.current;
      if (!data || data.status === 'finished' || data.status === 'waiting') return;
      
      const now = Date.now();
      const opponentPing = isPlayer1 ? data.player2LastPing : data.player1LastPing;
      
      if (opponentPing && (now - opponentPing > 15000)) {
        updateDoc(doc(db, 'pvp_rooms', roomId), {
          [isPlayer1 ? 'player2Left' : 'player1Left']: true
        }).catch(console.error);
      }
    }, 3000);
    return () => clearInterval(checkInterval);
  }, [roomId, isPlayer1]);`;

content = content.replace(/  \/\/ Heartbeat ping[\s\S]*? \/\/ Sync with Firebase/, newHeartbeatLogic + "\n\n  // Sync with Firebase");

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
