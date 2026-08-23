import fs from 'fs';

let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

// 1. Imports
content = content.replace(
  "import { Play, Pause, Search, Check, X, Volume2, VolumeX, Loader2 } from 'lucide-react';",
  "import { Play, Pause, Search, Check, X, Volume2, VolumeX, Loader2, MessageSquare, FastForward } from 'lucide-react';"
);

// 2. Track index
content = content.replace(
  "const currentTrack = tracks[currentRound];",
  "const trackIndex = dbData?.trackIndex ?? 0;\n  const currentTrack = tracks[trackIndex];"
);
content = content.replace(
  "currentRound + 1} / {tracks.length",
  "currentRound + 1} / 3"
);

// 3. Skip logic and chat state
content = content.replace(
  "const [dbData, setDbData] = useState<any>(null);",
  "const [dbData, setDbData] = useState<any>(null);\n  const [chatMsg, setChatMsg] = useState('');"
);

// 4. Update max rounds and resets
content = content.replace(
  "const isFinished = nextRound >= 5;",
  "const isFinished = nextRound >= 3;"
);
content = content.replace(
  "player2GuessedCorrectly: false,",
  "player2GuessedCorrectly: false,\n                player1Guesses: 0,\n                player2Guesses: 0,\n                player1Skip: false,\n                player2Skip: false,"
);

// 5. Guess submit logic
content = content.replace(
  "const handleGuessSubmit = async (submitGuess: string) => {",
  `const handleGuessSubmit = async (submitGuess: string) => {
    const myGuesses = isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses;
    if (myGuesses >= 3 || roundState !== 'playing' || !dbData) return;`
);

content = content.replace(
  "setGuessHistory(prev => [submitGuess, ...prev]);",
  `setGuessHistory(prev => [submitGuess, ...prev]);
      await updateDoc(doc(db, 'pvp_rooms', roomId), {
        [isPlayer1 ? 'player1Guesses' : 'player2Guesses']: (myGuesses || 0) + 1
      });`
);

content = content.replace(
  "if (roundState !== 'playing') return;",
  "" // Removed since handled above
);

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
