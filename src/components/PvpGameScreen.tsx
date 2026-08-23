import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track, Region, Language } from '../types';
import { Play, Pause, Search, Check, X, Volume2, VolumeX, Loader2, MessageSquare, FastForward } from 'lucide-react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { t } from '../i18n';

interface PvpGameScreenProps {
  roomId: string;
  playerId: string;
  isPlayer1: boolean;
  tracks: Track[];
  onFinish: (myScore: number, opponentScore: number) => void;
  region: Region;
  uiLanguage: Language;
}

export const PvpGameScreen: React.FC<PvpGameScreenProps> = ({ roomId, playerId, isPlayer1, tracks, onFinish, region, uiLanguage }) => {
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
  const [chatMsg, setChatMsg] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackIndex = dbData?.trackIndex ?? 0;
  const currentTrack = tracks[trackIndex];

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
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (roomId && db) {
        updateDoc(doc(db, 'pvp_rooms', roomId), {
          [isPlayer1 ? 'player1Left' : 'player2Left']: true,
          status: 'finished'
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomId, isPlayer1]);

  useEffect(() => {

    if (currentTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = currentTrack.previewUrl;
        audioRef.current.load();
        audioRef.current.loop = true;
      } else {
        audioRef.current = new Audio(currentTrack.previewUrl);
        audioRef.current.loop = true;
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
        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
          console.error("Auto-play failed", err);
        }
        setIsPlaying(false);
      });
    }
  }, [currentRound, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const latestDbData = useRef<any>(null);
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
          [isPlayer1 ? 'player2Left' : 'player1Left']: true,
          status: 'finished'
        }).catch(console.error);
      }
    }, 3000);
    return () => clearInterval(checkInterval);
  }, [roomId, isPlayer1]);

  // Sync with Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'pvp_rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbData(data);
        
        setMyScore(isPlayer1 ? data.player1Score : data.player2Score);
        setOpponentScore(isPlayer1 ? data.player2Score : data.player1Score);
        

        if (data.player1Left || data.player2Left) {
           if (audioRef.current) audioRef.current.pause();
           const iLeft = isPlayer1 ? data.player1Left : data.player2Left;
           onFinish(iLeft ? 0 : 99, iLeft ? 99 : 0);
           return;
        }

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
            setRoundWinner(t('waiting', uiLanguage) as string);
          } else if (!myGuess && oppGuess) {
            setRoundWinner(t('opponentGuessed10s', uiLanguage) as string);
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
            setRoundWinner(t('bothCorrect', uiLanguage) as string);
          } else if (myGuess && !oppGuess) {
            setRoundResult('won');
            setRoundWinner(t('youWonRound', uiLanguage) as string);
          } else if (!myGuess && oppGuess) {
            setRoundResult('lost');
            setRoundWinner(t('opponentWonRound', uiLanguage) as string);
          } else {
            setRoundResult('lost');
            setRoundWinner(t('nobodyCorrect', uiLanguage) as string);
          }

          // Player 1 is responsible for advancing the game state in Firebase
          if (isPlayer1) {
            setTimeout(async () => {
              // Ensure we don't advance multiple times
              const docRef = doc(db, 'pvp_rooms', roomId);
              const nextRound = dbData.currentRound + 1;
              const isFinished = nextRound >= 3;
              
              await updateDoc(docRef, {
                player1Score: dbData.player1Score + (dbData.player1GuessedCorrectly ? 1 : 0),
                player2Score: dbData.player2Score + (dbData.player2GuessedCorrectly ? 1 : 0),
                currentRound: isFinished ? dbData.currentRound : nextRound,
                trackIndex: (dbData.trackIndex || 0) + 1,
                status: isFinished ? 'finished' : 'playing',
                player1GuessedCorrectly: false,
                player2GuessedCorrectly: false,
                player1Guesses: 0,
                player2Guesses: 0,
                player1Skip: false,
                player2Skip: false,
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
    const myGuesses = isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses;
    if (myGuesses >= 3 || roundState !== 'playing' || !dbData) return;
    

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
      await updateDoc(doc(db, 'pvp_rooms', roomId), {
        [isPlayer1 ? 'player1Guesses' : 'player2Guesses']: (myGuesses || 0) + 1
      });
      setSearchQuery('');
    }
  };

  
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

  const handlePlay = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
            console.error("Auto-play failed", err);
          }
          setIsPlaying(false);
        });
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">

      <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-2">
        <button 
          onClick={async () => {
             if (roomId) {
               await updateDoc(doc(db, 'pvp_rooms', roomId), {
                 [isPlayer1 ? 'player1Left' : 'player2Left']: true,
                 status: 'finished'
               });
               onFinish(0, 99);
             }
          }}
          className="text-xs text-neutral-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" /> {t('leaveMatch', uiLanguage)}
        </button>
      </div>
      <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 flex flex-col items-center">
        {/* Header - VS Layout */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between w-full gap-3 sm:gap-6">
            {/* You */}
            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
              <span className="text-[10px] sm:text-xs text-emerald-400 font-bold tracking-[0.2em] uppercase mb-1 sm:mb-2 truncate w-full text-center">{t('you', uiLanguage)}</span>
              <span className="text-5xl sm:text-7xl font-display text-white drop-shadow-lg">{myScore}</span>
            </div>
            
            {/* VS & Round */}
            <div className="flex flex-col items-center justify-center shrink-0 px-2 space-y-3">
              <span className="text-3xl sm:text-4xl font-display italic text-neutral-600">VS</span>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-bold tracking-widest uppercase bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
                {t('round', uiLanguage)} {currentRound + 1}/3
              </span>
            </div>

            {/* Opponent */}
            <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-3xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
              <span className="text-[10px] sm:text-xs text-red-400 font-bold tracking-[0.2em] uppercase mb-1 sm:mb-2 truncate w-full text-center">
                {isPlayer1 ? (dbData?.player2Name || t('opponent', uiLanguage)) : (dbData?.player1Name || t('opponent', uiLanguage))}
              </span>
              <span className="text-5xl sm:text-7xl font-display text-white drop-shadow-lg">{opponentScore}</span>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-3 bg-neutral-950/80 backdrop-blur-sm px-4 py-2 rounded-full border border-neutral-800">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="hover:text-emerald-400 transition-colors text-neutral-400"
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
                className="w-24 h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full focus:outline-none"
              />
            </div>
          </div>
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
                  {t('startMusic', uiLanguage)}
                </button>
              )}

              {/* Steal Countdown Alert */}
              {countdown !== null && countdown > 0 && roundState === 'playing' && (
                <div className="w-full max-w-lg mb-8 flex flex-col items-center gap-2 p-6 bg-red-500/10 border border-red-500/30 rounded-3xl animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                  <div className="text-red-400 font-bold tracking-[0.2em] uppercase text-xs text-center">
                    {roundWinner}
                  </div>
                  <div className="text-6xl font-display text-white drop-shadow-md">{countdown}</div>
                  <div className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">{t('secondsToSteal', uiLanguage)}</div>
                </div>
              )}

              {roundState === 'waiting_opponent' ? (
                <div className="w-full text-center p-10 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl max-w-lg">
                  <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-emerald-400 font-bold text-xl mb-2 font-display">{t('correct', uiLanguage)}</p>
                  <p className="text-neutral-400 tracking-wider">{t('waiting', uiLanguage)} {countdown !== null ? `${countdown}s` : ''}</p>
                </div>
              ) : (

                  <div className="relative group w-full max-w-lg mb-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                      {3 - (isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses) || 0} {t('guessesLeft', uiLanguage)}
                    </span>
                    <span className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
                      {t('opponent', uiLanguage)}: {(isPlayer1 ? dbData?.player2Guesses : dbData?.player1Guesses) || 0}/3
                    </span>
                  </div>
                  <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    disabled={(isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses) >= 3}
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
                    placeholder={
                      (isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses) >= 3 
                        ? (t('outOfGuesses', uiLanguage) as string) 
                        : (t('placeholder', uiLanguage) as string)
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl py-5 pl-14 pr-32 text-lg outline-none transition-all placeholder:text-neutral-600 text-neutral-100"
                  />
                  <button 
                    disabled={(isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses) >= 3}
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleGuessSubmit(searchQuery);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 text-neutral-100 rounded-lg text-sm font-bold uppercase tracking-[0.1em] transition-colors"
                  >
                    {t('guessBtn', uiLanguage)}
                  </button>
                  </div>

                  {/* Skip Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleSkip}
                      disabled={isPlayer1 ? dbData?.player1Skip : dbData?.player2Skip}
                      className="px-6 py-2.5 bg-neutral-800/50 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-400 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center gap-2"
                    >
                      <FastForward className="w-3 h-3" />
                      {(isPlayer1 ? dbData?.player1Skip : dbData?.player2Skip) 
                        ? (t('waitingSkip', uiLanguage) as string) 
                        : (t('skipBoth', uiLanguage) as string)}
                    </button>
                  </div>

                  
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
                          <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-neutral-600 flex-shrink-0 ml-4">{t('wrong', uiLanguage)}</span>
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
              <p className="text-neutral-400 text-sm font-bold tracking-[0.1em] uppercase">{t('preparing', uiLanguage)}</p>
            </div>
          )}


        </div>
        
        {/* Chat Section */}
        <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 mt-4">
          <div className="flex flex-col space-y-2 mb-4 h-32 overflow-y-auto custom-scrollbar">
            {dbData?.chat?.map((c: any) => (
              <div key={c.id} className={`flex ${c.sender === (isPlayer1 ? 'p1' : 'p2') ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${c.sender === (isPlayer1 ? 'p1' : 'p2') ? 'bg-emerald-500/20 text-emerald-100 rounded-br-sm' : 'bg-neutral-800 text-neutral-100 rounded-bl-sm'}`}>
                  {c.msg}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="relative">
            <input
              type="text"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder={t('chatPlaceholder', uiLanguage) as string}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500/50 rounded-xl py-3 pl-4 pr-12 text-sm outline-none transition-colors text-neutral-100"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-emerald-400 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

