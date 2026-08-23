import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track, Region, Language } from '../types';
import { Play, Pause, SkipForward, Check, X, Search, Volume2, VolumeX } from 'lucide-react';
import { t } from '../i18n';

interface GameScreenProps {
  tracks: Track[];
  onFinish: (score: number, total: number) => void;
  region: Region;
  uiLanguage: Language;
}

const INTERVALS = [0.1, 0.5, 2.0, 8.0, 15.0];
const ROUNDS = 5;

export const GameScreen: React.FC<GameScreenProps> = ({ tracks, onFinish, region, uiLanguage }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [step, setStep] = useState(0); // 0 to 4
  const [isPlaying, setIsPlaying] = useState(false);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [roundState, setRoundState] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [guessHistory, setGuessHistory] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimeoutRef = useRef<number | null>(null);

  const currentTrack = tracks[currentRound];
  const maxStep = INTERVALS.length - 1;

  // Options for autocomplete (all tracks fetched to avoid giving away the answer too easily)
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

  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());

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
      setStep(0);
      setRoundState('playing');
      setGuess('');
      setSearchQuery('');
      setGuessHistory([]);
      setRoundStartTime(Date.now());
    }
  }, [currentRound, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlay = () => {
    if (!audioRef.current || isPlaying) return;
    
    setIsPlaying(true);
    audioRef.current.currentTime = 0;
    
    // Attempt to play
    audioRef.current.play().then(() => {
      const duration = INTERVALS[step] * 1000;
      playTimeoutRef.current = window.setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }, duration);
    }).catch((err) => {
      console.error("Audio play failed:", err);
      setIsPlaying(false);
    });
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const handleSkip = () => {
    stopPlayback();
    if (step < maxStep) {
      setStep(prev => prev + 1);
    } else {
      // Failed
      setRoundState('wrong');
    }
  };

  const handleGuessSubmit = (submitGuess: string) => {
    stopPlayback();
    // Simple check: does the guess include the artist or track name? Or does the track name include the guess?
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9æøå]/g, '');
    
    const targetName = normalize(currentTrack.trackName);
    const targetArtist = normalize(currentTrack.artistName);
    const guessNorm = normalize(submitGuess);

    const isCorrect = 
      guessNorm === targetName ||
      guessNorm === `${targetArtist}${targetName}` ||
      targetName.includes(guessNorm) && guessNorm.length > 3 ||
      submitGuess.toLowerCase() === `${currentTrack.artistName.toLowerCase()} - ${currentTrack.trackName.toLowerCase()}`;

    if (isCorrect) {
      const timeTakenMs = Date.now() - roundStartTime;
      const timeTakenSec = Math.floor(timeTakenMs / 1000);
      
      // Calculate points based on step (interval length) and time taken
      const maxStepPoints = [1000, 800, 600, 400, 200][step] || 200;
      // Lose 5 points per second elapsed
      const timeDeduction = timeTakenSec * 5;
      
      const earnedPoints = Math.max(10, maxStepPoints - timeDeduction);
      
      setScore(prev => prev + earnedPoints);
      setRoundState('correct');
    } else {
      setGuessHistory(prev => [submitGuess, ...prev]);
      if (step < maxStep) {
        setStep(prev => prev + 1);
        setSearchQuery('');
        setGuess('');
      } else {
        setRoundState('wrong');
      }
    }
  };

  const handleNextRound = () => {
    if (currentRound < Math.min(ROUNDS, tracks.length) - 1) {
      setCurrentRound(prev => prev + 1);
    } else {
      onFinish(score, Math.min(ROUNDS, tracks.length) * 1000); // 1000 max per round
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-10 text-[10px] uppercase tracking-[0.1em] text-neutral-500 font-bold">
          <span className="w-24">{t('round', uiLanguage)} {currentRound + 1} / {Math.min(ROUNDS, tracks.length)}</span>
          
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

          <span className="text-emerald-400 text-sm text-right w-24">Score: {score}</span>
        </div>

        {/* Game Area */}
        <div className="w-full flex flex-col items-center space-y-8">
          
          {/* Visualizer / Artwork */}
          <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center border border-neutral-800 mb-2">
            {roundState === 'playing' ? (
               <div className="flex space-x-2">
                 <div className={`w-3 h-12 bg-emerald-500 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite]' : ''}`}></div>
                 <div className={`w-3 h-16 bg-emerald-500 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_100ms]' : ''}`}></div>
                 <div className={`w-3 h-8 bg-emerald-500 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_200ms]' : ''}`}></div>
                 <div className={`w-3 h-14 bg-emerald-500 rounded-full ${isPlaying ? 'animate-[bounce_1s_infinite_300ms]' : ''}`}></div>
               </div>
            ) : (
               <img src={currentTrack.artworkUrl100.replace('100x100', '400x400')} alt="Artwork" className="w-full h-full object-cover" />
            )}
            
            {roundState === 'correct' && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-emerald-500 rounded-full p-3">
                  <Check className="w-10 h-10 text-neutral-950" />
                </div>
              </div>
            )}
            {roundState === 'wrong' && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-red-500 rounded-full p-3">
                  <X className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Answer Reveal */}
          {roundState !== 'playing' && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mb-4">
              <h2 className="text-2xl font-bold text-neutral-100 mb-2 font-display">{currentTrack.trackName}</h2>
              <p className="text-sm tracking-[0.1em] uppercase text-neutral-400">{currentTrack.artistName}</p>
            </div>
          )}

          {/* Controls */}
          {roundState === 'playing' ? (
            <div className="w-full flex flex-col items-center">
              {/* Progress Steps */}
              <div className="w-full mb-10">
                <div className="flex gap-1.5 h-3 mb-4">
                  {INTERVALS.map((int, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full relative overflow-hidden transition-all ${i < step ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : i === step ? 'bg-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/10'}`} 
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono tracking-tighter">
                  {INTERVALS.map((int, i) => (
                    <span key={i} className={i === step ? 'text-emerald-400 font-bold' : ''}>{int}s</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center items-center gap-8 mb-12">
                <button
                  onClick={handlePlay}
                  disabled={isPlaying}
                  className="w-20 h-20 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                </button>
                <button
                  onClick={handleSkip}
                  className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-colors"
                  title="Skip til neste lydklipp"
                >
                  {t('skip', uiLanguage)} (+{step < maxStep ? INTERVALS[step + 1] - INTERVALS[step] : 0}s)
                </button>
              </div>

              {/* Guess Input */}
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
                  placeholder={t('placeholder', uiLanguage)}
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
                  {t('guessBtn', uiLanguage)}
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
                        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-600 flex-shrink-0 ml-4">{t('wrong', uiLanguage)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={handleNextRound}
              className="w-full max-w-lg py-5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-transform active:scale-95"
            >
              {currentRound < Math.min(ROUNDS, tracks.length) - 1 ? t('nextSong', uiLanguage) : t('seeResult', uiLanguage)}
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
