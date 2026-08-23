import fs from 'fs';

let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

// Set loop=true
content = content.replace(
  "audioRef.current.load();",
  "audioRef.current.load();\n        audioRef.current.loop = true;"
);
content = content.replace(
  "audioRef.current = new Audio(currentTrack.previewUrl);",
  "audioRef.current = new Audio(currentTrack.previewUrl);\n        audioRef.current.loop = true;"
);

// Add unload listener
const unloadLogic = `
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (roomId && db) {
        updateDoc(doc(db, 'pvp_rooms', roomId), {
          [isPlayer1 ? 'player1Left' : 'player2Left']: true
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomId, isPlayer1]);

  useEffect(() => {
`;
content = content.replace("  useEffect(() => {", unloadLogic);

// Add player left check
const playerLeftLogic = `
        if (data.player1Left || data.player2Left) {
           if (audioRef.current) audioRef.current.pause();
           const iLeft = isPlayer1 ? data.player1Left : data.player2Left;
           onFinish(iLeft ? 0 : 99, iLeft ? 99 : 0);
           return;
        }

        if (data.status === 'finished') {`;
content = content.replace("        if (data.status === 'finished') {", playerLeftLogic);

// Add Leave Match button
const leaveBtn = `
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-2">
        <button 
          onClick={async () => {
             if (roomId) {
               await updateDoc(doc(db, 'pvp_rooms', roomId), {
                 [isPlayer1 ? 'player1Left' : 'player2Left']: true
               });
               onFinish(0, 99);
             }
          }}
          className="text-xs text-neutral-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Forlat
        </button>
      </div>
      <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 flex flex-col items-center">`;
content = content.replace('      <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 flex flex-col items-center">', leaveBtn);

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
