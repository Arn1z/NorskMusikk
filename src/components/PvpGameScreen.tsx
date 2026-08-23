import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track } from '../types';
import { Play, Pause, Search, Check, X, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface PvpGameScreenProps {
  socket: Socket;
  roomId: string;
  tracks: Track[];
  onFinish: (myScore: number, opponentScore: number) => void;
}

export const PvpGameScreen: React.FC<PvpGameScreenProps> = ({ socket, roomId, tracks, onFinish }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guess, setGuess] = useState('');
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
      
      // Auto-play for PVP
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Auto-play failed (browser restriction), waiting for interaction", err);
        setIsPlaying(false);
      });
    }
  }, [currentRound, currentTrack, volume, isMuted]);

  useEffect(() => {
    let timer: number;
    if (countdown !== null && countdown > 0 && roundState !== 'ended') {
      timer = window.setTimeout(() => setCountdown(prev => (prev ? prev - 1 : null)), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, roundState]);

  useEffect(() => {
    socket.on('pvp_score_update', (scores) => {
      setMyScore(scores[socket.id]);
      const oppId = Object.keys(scores).find(id => id !== socket.id);
      if (oppId) setOpponentScore(scores[oppId]);
    });

    socket.on('pvp_countdown_start', ({ firstGuesser, seconds }) => {
      setCountdown(seconds);
      if (firstGuesser === socket.id) {
        setRoundState('waiting_opponent');
        setRoundWinner('Venter på motstander...');
      } else {
        setRoundWinner('Motstander gjettet riktig! Du har 10 sekunder på deg!');
      }
    });

    socket.on('pvp_round_end', ({ scores, correctGuessers }) => {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setRoundState('ended');
      setCountdown(null);
      
      setMyScore(scores[socket.id]);
      const oppId = Object.keys(scores).find(id => id !== socket.id);
      if (oppId) setOpponentScore(scores[oppId]);

      const iGuessed = correctGuessers.includes(socket.id);
      const oppGuessed = oppId && correctGuessers.includes(oppId);

      if (iGuessed && oppGuessed) {
        setRoundResult('both_correct');
        setRoundWinner('Begge gjettet riktig!');
      } else if (iGuessed && !oppGuessed) {
        setRoundResult('won');
        setRoundWinner('Du vant runden!');
      } else if (!iGuessed && oppGuessed) {
        setRoundResult('lost');
        setRoundWinner('Motstanderen vant runden!');
      } else {
        setRoundResult('lost');
        setRoundWinner('Ingen gjettet riktig!');
      }
    });

    socket.on('pvp_next_round', ({ roundIndex }) => {
      setCurrentRound(roundIndex);
    });

    socket.on('pvp_game_over', ({ scores }) => {
      setMyScore(scores[socket.id]);
      const oppId = Object.keys(scores).find(id => id !== socket.id);
      if (oppId) setOpponentScore(scores[oppId]);
      
      setTimeout(() => {
        onFinish(scores[socket.id], oppId ? scores[oppId] : 0);
      }, 3000);
    });

    socket.on('pvp_opponent_disconnected', () => {
      alert("Motstanderen forlot spillet. Du vinner på walkover!");
      onFinish(myScore, opponentScore);
    });

    return () => {
      socket.off('pvp_score_update');
      socket.off('pvp_countdown_start');
      socket.off('pvp_round_end');
      socket.off('pvp_next_round');
      socket.off('pvp_game_over');
      socket.off('pvp_opponent_disconnected');
      if (audioRef.current) audioRef.current.pause();
    };
  }, [socket, myScore, opponentScore, onFinish]);

  const handleGuessSubmit = (submitGuess: string) => {
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

    if (isCorrect) {
      socket.emit('pvp_guess', { roomId, guess: submitGuess, isCorrect: true });
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
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-10 text-[10px] uppercase tracking-widest text-white/40 font-bold">
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
          <div className="relative w-48 h-48 rounded-[32px] shadow-2xl overflow-hidden bg-white/5 flex items-center justify-center border border-white/10 mb-2">
            {roundState !== 'ended' ? (
               <div className="flex space-x-2">
                 <div className={`w-3 h-12 bg-emerald-400 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite]' : ''}`}></div>
                 <div className={`w-3 h-16 bg-emerald-400 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_100ms]' : ''}`}></div>
                 <div className={`w-3 h-8 bg-emerald-400 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_200ms]' : ''}`}></div>
                 <div className={`w-3 h-14 bg-emerald-400 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_300ms]' : ''}`}></div>
               </div>
            ) : (
               <img src={currentTrack.artworkUrl100.replace('100x100', '400x400')} alt="Artwork" className="w-full h-full object-cover" />
            )}
            
            {roundState === 'ended' && (roundResult === 'won' || roundResult === 'both_correct') && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                <div className="bg-emerald-500 rounded-full p-2 shadow-xl shadow-emerald-500/50">
                  <Check className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
            {roundState === 'ended' && roundResult === 'lost' && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <div className="bg-red-500 rounded-full p-2 shadow-xl shadow-red-500/50">
                  <X className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Answer Reveal */}
          {roundState === 'ended' && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mb-4">
              <h2 className={`text-2xl font-bold mb-2 ${(roundResult === 'won' || roundResult === 'both_correct') ? 'text-emerald-400' : 'text-red-400'}`}>
                {roundWinner}
              </h2>
              <h2 className="text-xl font-bold text-white mb-1">{currentTrack.trackName}</h2>
              <p className="text-sm tracking-widest uppercase text-white/40">{currentTrack.artistName}</p>
            </div>
          )}

          {/* Controls */}
          {roundState !== 'ended' ? (
            <div className="w-full flex flex-col items-center">
              {!isPlaying && (
                <button
                  onClick={handlePlay}
                  className="mb-6 px-6 py-3 bg-emerald-500 text-black rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                >
                  Start musikken
                </button>
              )}

              {/* Countdown Alert */}
              {countdown !== null && roundState === 'playing' && (
                <div className="mb-6 px-6 py-2 bg-red-500/20 border border-red-500/50 rounded-full animate-pulse">
                  <p className="text-red-400 font-bold tracking-widest uppercase">{roundWinner} {countdown}s igjen!</p>
                </div>
              )}

              {roundState === 'waiting_opponent' ? (
                <div className="w-full text-center p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl max-w-lg">
                  <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-emerald-400 font-bold text-lg mb-2">Riktig!</p>
                  <p className="text-white/60">Venter på motstander... {countdown}s</p>
                </div>
              ) : (
                <div className="relative group w-full max-w-lg">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
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
                    className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-2xl py-5 pl-14 pr-32 text-lg outline-none transition-all placeholder:text-white/20 text-white"
                  />
                  <button 
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleGuessSubmit(searchQuery);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-colors"
                  >
                    Gjett
                  </button>
                  
                  {/* Autocomplete Dropdown */}
                  {showOptions && searchQuery.trim() !== '' && options.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(opt);
                            setShowOptions(false);
                            handleGuessSubmit(opt);
                          }}
                          className="w-full text-left px-5 py-4 hover:bg-white/10 transition-colors text-white border-b border-white/5 last:border-0"
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
                        <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-5 py-3 opacity-60">
                          <span className="text-sm italic truncate text-white">{pastGuess}</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex-shrink-0 ml-4">Feil</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full text-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
              <p className="text-white/60 text-sm font-bold tracking-widest uppercase">Venter på neste runde...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
