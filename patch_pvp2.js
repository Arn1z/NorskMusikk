import fs from 'fs';

let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

const snapshotLogic = `        if (data.roundEndsAt && data.roundEndsAt > Date.now()) {
          if (myGuess && !oppGuess) {
            setRoundState('waiting_opponent');
            setRoundWinner('Venter på motstander...');
          } else if (!myGuess && oppGuess) {
            setRoundWinner('Motstander gjettet riktig! Du har 10 sekunder på deg!');
          }
        }

        // Handle skip
        if (data.player1Skip && data.player2Skip && data.status === 'playing') {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setRoundState('ended');
          setRoundResult('lost');
          setRoundWinner(t('skipped', uiLanguage) as string);
          
          if (isPlayer1) {
            setTimeout(async () => {
              await updateDoc(doc(db, 'pvp_rooms', roomId), {
                trackIndex: (data.trackIndex || 0) + 1,
                player1Skip: false,
                player2Skip: false,
                player1Guesses: 0,
                player2Guesses: 0,
                firstGuesserId: null,
                roundEndsAt: null,
                player1GuessedCorrectly: false,
                player2GuessedCorrectly: false
              });
            }, 3000);
          }
        }`;

content = content.replace(
  `        if (data.roundEndsAt && data.roundEndsAt > Date.now()) {
          if (myGuess && !oppGuess) {
            setRoundState('waiting_opponent');
            setRoundWinner('Venter på motstander...');
          } else if (!myGuess && oppGuess) {
            setRoundWinner('Motstander gjettet riktig! Du har 10 sekunder på deg!');
          }
        }`,
  snapshotLogic
);

const handleSkipCode = `
  const handleSkip = async () => {
    if (roundState !== 'playing' || !dbData) return;
    await updateDoc(doc(db, 'pvp_rooms', roomId), {
      [isPlayer1 ? 'player1Skip' : 'player2Skip']: true
    });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !dbData) return;
    const newChat = [...(dbData.chat || []), { sender: isPlayer1 ? 'p1' : 'p2', msg: chatMsg.trim(), id: Date.now() }];
    await updateDoc(doc(db, 'pvp_rooms', roomId), { chat: newChat.slice(-5) });
    setChatMsg('');
  };
`;

content = content.replace(
  "const handlePlay = () => {",
  handleSkipCode + "\n  const handlePlay = () => {"
);

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
