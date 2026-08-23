import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const cleanupLogic = `  // Cleanup waiting room if user closes tab while in queue
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameState === 'pvp_queue' && roomId && isPlayer1) {
        updateDoc(doc(db, 'pvp_rooms', roomId), {
          status: 'finished'
        }).catch(console.error);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, roomId, isPlayer1]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {`;

content = content.replace("  useEffect(() => {\n    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {", cleanupLogic);

fs.writeFileSync('src/App.tsx', content, 'utf8');
