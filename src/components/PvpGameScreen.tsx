import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track } from '../types';
import { Play, Pause, Search, Check, X, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface PvpGameScreenProps {
  roomId: string;
  playerId: string;
  isPlayer1: boolean;
  tracks: Track[];
  onFinish: (myScore: number, opponentScore: number) => void;
}

export const PvpGameScreen: React.FC<PvpGameScreenProps> = ({ roomId, playerId, isPlayer1, tracks, onFinish }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [roundState, setRoundState] = useState<'playing' | 'waiting_opponent' | 'ended'>('playing');
  const [roundResult, setRoundResult] = useState<'won' | 'lost' | 'both_correct' | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [guessHistory, setGuessHistory] = useState<string[]>([]);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [roundEndsAt, setRoundEndsAt] = useState<number | null>(null);
  const [dbData, setDbData] = useState<any>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = tracks[currentRound];

  const options = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const queryParts = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return tracks
      .map(t => `${t.artistName} - ${t.trackName}`)
      .filter(name => {
        const nameLower = name.toLowerCase();
        return queryParts.every(part => nameLower.includes(part));
      })
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 5);
  }, [tracks, searchQuery]);

  // Load and play track
  useEffect(() => {
    if (currentTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = currentTrack.previewUrl;
        audioRef.current.load();
      } else {
        audioRef.current = new Audio(currentTrack.previewUrl);
      }
      audioRef.current.volume = isMuted ? 0 : volume;
      setRoundState('playing');
      setRoundResult(null);
      setCountdown(null);
      setSearchQuery('');
      setGuessHistory([]);
      setRoundWinner(null);
      setRoundEndsAt(null);
      
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Auto-play failed", err);
        setIsPlaying(false);
      });
    }
  }, [currentRound, currentTrack, volume, isMuted]);

  // Sync with Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'pvp_rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbData(data);
        
        setMyScore(isPlayer1 ? data.player1Score : data.player2Score);
        setOpponentScore(isPlayer1 ? data.player2Score : data.player1Score);
        
        if (data.status === 'finished') {
           if (audioRef.current) audioRef.current.pause();
           onFinish(isPlayer1 ? data.player1Score : data.player2Score, isPlayer1 ? data.player2Score : data.player1Score);
           return;
        }

        if (data.currentRound !== currentRound) {
           setCurrentRound(data.currentRound);
        }

        setRoundEndsAt(data.roundEndsAt || null);

        const myGuess = isPlayer1 ? data.player1GuessedCorrectly : data.player2GuessedCorrectly;
        const oppGuess = isPlayer1 ? data.player2GuessedCorrectly : data.player1GuessedCorrectly;

        if (data.roundEndsAt && data.roundEndsAt > Date.now()) {
          if (myGuess && !oppGuess) {
            setRoundState('waiting_opponent');
            setRoundWinner('Venter på motstander...');
          } else if (!myGuess && oppGuess) {
            setRoundWinner('Motstander gjettet riktig! Du har 10 sekunder på deg!');
          }
        }
      }
    });
    return () => unsubscribe();
  }, [roomId, isPlayer1, currentRound, onFinish]);

  // Timer loop for countdown and resolving rounds
  useEffect(() => {
    let timer = setInterval(() => {
      if (roundEndsAt && dbData) {
        const now = Date.now();
        const left = Math.max(0, Math.ceil((roundEndsAt - now) / 1000));
        setCountdown(left);

        const myGuess = isPlayer1 ? dbData.player1GuessedCorrectly : dbData.player2GuessedCorrectly;
        const oppGuess = isPlayer1 ? dbData.player2GuessedCorrectly : dbData.player1GuessedCorrectly;

        // If time is up, or both guessed correctly, resolve the round locally for UI
        if (left <= 0 || (myGuess && oppGuess)) {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setRoundState('ended');
          
          if (myGuess && oppGuess) {
            setRoundResult('both_correct');
            setRoundWinner('Begge gjettet riktig!');
          } else if (myGuess && !oppGuess) {
            setRoundResult('won');
            setRoundWinner('Du vant runden!');
          } else if (!myGuess && oppGuess) {
            setRoundResult('lost');
            setRoundWinner('Motstanderen vant runden!');
          } else {
            setRoundResult('lost');
            setRoundWinner('Ingen gjettet riktig!');
          }

          // Player 1 is responsible for advancing the game state in Firebase
          if (isPlayer1) {
            setTimeout(async () => {
              // Ensure we don't advance multiple times
              const docRef = doc(db, 'pvp_rooms', roomId);
              const nextRound = dbData.currentRound + 1;
              const isFinished = nextRound >= 5;
              
              await updateDoc(docRef, {
                player1Score: dbData.player1Score + (dbData.player1GuessedCorrectly ? 1 : 0),
                player2Score: dbData.player2Score + (dbData.player2GuessedCorrectly ? 1 : 0),
                currentRound: isFinished ? dbData.currentRound : nextRound,
                status: isFinished ? 'finished' : 'playing',
                player1GuessedCorrectly: false,
                player2GuessedCorrectly: false,
                firstGuesserId: null,
                roundEndsAt: null
              });
            }, 3000);
          }
          setRoundEndsAt(null); // Stop timer loop for this round
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [roundEndsAt, dbData, isPlayer1, roomId]);

  const handleGuessSubmit = async (submitGuess: string) => {
    if (roundState !== 'playing') return;

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9æøå]/g, '');
    const targetName = normalize(currentTrack.trackName);
    const targetArtist = normalize(currentTrack.artistName);
    const guessNorm = normalize(submitGuess);

    const isCorrect = 
      guessNorm === targetName ||
      guessNorm === `${targetArtist}${targetName}` ||
      (targetName.includes(guessNorm) && guessNorm.length > 3) ||
      submitGuess.toLowerCase() === `${currentTrack.artistName.toLowerCase()} - ${currentTrack.trackName.toLowerCase()}`;

    if (isCorrect && dbData) {
      const docRef = doc(db, 'pvp_rooms', roomId);
      const isFirst = !dbData.firstGuesserId;
      
      const updateData: any = {};
      if (isPlayer1) {
        updateData.player1GuessedCorrectly = true;
      } else {
        updateData.player2GuessedCorrectly = true;
      }

      if (isFirst) {
        updateData.firstGuesserId = playerId;
        updateData.roundEndsAt = Date.now() + 10000; // 10 seconds countdown
      } else {
        updateData.roundEndsAt = Date.now(); // End immediately
      }

      await updateDoc(docRef, updateData);
    } else {
      setGuessHistory(prev => [submitGuess, ...prev]);
      setSearchQuery('');
    }
  };

  const handlePlay = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-10 text-[10px] uppercase tracking-[0.1em] text-neutral-500 font-bold">
          <div className="flex flex-col">
            <span className="text-emerald-400">Du: {myScore}</span>
            <span className="text-red-400">Motstander: {opponentScore}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="hover:text-emerald-400 transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input 
              type="range" 
              min="0" max="1" step="0.01" 
              value={isMuted ? 0 : volume} 
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                setIsMuted(val === 0);
              }}
              className="w-16 sm:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full focus:outline-none"
            />
          </div>

          <span className="text-right">Runde {currentRound + 1} / {tracks.length}</span>
        </div>

        {/* Game Area */}
        <div className="w-full flex flex-col items-center space-y-8">
          
          {/* Visualizer / Artwork */}
          <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center border border-neutral-800 mb-2">
            {roundState !== 'ended' ? (
               <div className="flex space-x-2">
                 <div className={`w-3 h-12 bg-emerald-500 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite]' : ''}`}></div>
                 <div className={`w-3 h-16 bg-emerald-500 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_100ms]' : ''}`}></div>
                 <div className={`w-3 h-8 bg-emerald-500 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_200ms]' : ''}`}></div>
                 <div className={`w-3 h-14 bg-emerald-500 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_300ms]' : ''}`}></div>
               </div>
            ) : (
               <img src={currentTrack.artworkUrl100.replace('100x100', '400x400')} alt="Artwork" className="w-full h-full object-cover" />
            )}
            
            {roundState === 'ended' && (roundResult === 'won' || roundResult === 'both_correct') && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-emerald-500 rounded-full p-3">
                  <Check className="w-10 h-10 text-neutral-950" />
                </div>
              </div>
            )}
            {roundState === 'ended' && roundResult === 'lost' && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-red-500 rounded-full p-3">
                  <X className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Answer Reveal */}
          {roundState === 'ended' && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mb-4">
              <h2 className={`text-xl font-bold mb-3 tracking-[0.05em] uppercase ${(roundResult === 'won' || roundResult === 'both_correct') ? 'text-emerald-400' : 'text-red-400'}`}>
                {roundWinner}
              </h2>
              <h2 className="text-2xl font-bold text-neutral-100 mb-2 font-display">{currentTrack.trackName}</h2>
              <p className="text-sm tracking-[0.1em] uppercase text-neutral-400">{currentTrack.artistName}</p>
            </div>
          )}

          {/* Controls */}
          {roundState !== 'ended' ? (
            <div className="w-full flex flex-col items-center">
              {!isPlaying && (
                <button
                  onClick={handlePlay}
                  className="mb-6 px-8 py-4 bg-emerald-500 text-neutral-950 rounded-xl font-bold uppercase tracking-[0.1em] transition-transform active:scale-95"
                >
                  Start musikken
                </button>
              )}

              {/* Countdown Alert */}
              {countdown !== null && countdown > 0 && roundState === 'playing' && (
                <div className="mb-6 px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-xl animate-pulse">
                  <p className="text-red-400 font-bold tracking-[0.1em] uppercase">{roundWinner} {countdown}s igjen!</p>
                </div>
              )}

              {roundState === 'waiting_opponent' ? (
                <div className="w-full text-center p-10 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl max-w-lg">
                  <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-emerald-400 font-bold text-xl mb-2 font-display">Riktig!</p>
                  <p className="text-neutral-400 tracking-wider">Venter på motstander... {countdown !== null ? `${countdown}s` : ''}</p>
                </div>
              ) : (
                <div className="relative group w-full max-w-lg">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowOptions(true);
                    }}
                    onFocus={() => setShowOptions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleGuessSubmit(searchQuery);
                      }
                    }}
                    placeholder="Skriv artist eller sangnavn..."
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl py-5 pl-14 pr-32 text-lg outline-none transition-all placeholder:text-neutral-600 text-neutral-100"
                  />
                  <button 
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleGuessSubmit(searchQuery);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg text-sm font-bold uppercase tracking-[0.1em] transition-colors"
                  >
                    Gjett
                  </button>
                  
                  {/* Autocomplete Dropdown */}
                  {showOptions && searchQuery.trim() !== '' && options.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(opt);
                            setShowOptions(false);
                            handleGuessSubmit(opt);
                          }}
                          className="w-full text-left px-5 py-4 hover:bg-neutral-900 transition-colors text-neutral-200 border-b border-neutral-800 last:border-0"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Guess History */}
                  {guessHistory.length > 0 && (
                    <div className="w-full mt-6 space-y-2">
                      {guessHistory.map((pastGuess, i) => (
                        <div key={i} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3">
                          <span className="text-sm italic truncate text-neutral-400">{pastGuess}</span>
                          <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-neutral-600 flex-shrink-0 ml-4">Feil</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full text-center py-8">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
              <p className="text-neutral-400 text-sm font-bold tracking-[0.1em] uppercase">Gjør klar neste runde...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
