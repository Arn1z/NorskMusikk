import React, { useState, useRef, useEffect } from 'react';
import { Difficulty, Region, Language, Genre } from '../types';
import { Leaderboard } from './Leaderboard';
import { t } from '../i18n';
import { ChevronDown, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface StartScreenProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  isLoading?: boolean;
  onJoinPvp?: () => void;
  region: Region;
  setRegion: (r: Region) => void;
  genre: Genre;
  setGenre: (g: Genre) => void;
  uiLanguage: Language;
  onRequireLogin: () => void;
}

const REGION_OPTIONS: { id: Region; icon: string }[] = [
  { id: 'global', icon: '🌍' },
  { id: 'no', icon: '🇳🇴' },
  { id: 'se', icon: '🇸🇪' },
  { id: 'dk', icon: '🇩🇰' },
  { id: 'uk', icon: '🇬🇧' },
  { id: 'us', icon: '🇺🇸' },
];

const GENRE_OPTIONS: { id: Genre; label: string }[] = [
  { id: 'all', label: 'All Genres' },
  { id: 'pop', label: 'Pop' },
  { id: 'rock', label: 'Rock' },
  { id: 'rap', label: 'Rap' },
];

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onSelectDifficulty, isLoading, onJoinPvp, region, setRegion, genre, setGenre, uiLanguage, onRequireLogin 
}) => {
  const { user } = useAuth();
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  
  const regionRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setIsRegionDropdownOpen(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRegion = REGION_OPTIONS.find(r => r.id === region) || REGION_OPTIONS[0];
  const currentGenre = GENRE_OPTIONS.find(g => g.id === genre) || GENRE_OPTIONS[0];

  const handleRegionClick = () => {
    if (!user) {
      onRequireLogin();
    } else {
      setIsRegionDropdownOpen(!isRegionDropdownOpen);
      setIsGenreDropdownOpen(false);
    }
  };

  const handleGenreClick = () => {
    if (!user) {
      onRequireLogin();
    } else {
      setIsGenreDropdownOpen(!isGenreDropdownOpen);
      setIsRegionDropdownOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 max-w-4xl mx-auto flex-1">
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center">
        <div className="max-w-xl w-full bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 space-y-8 text-center flex-1 relative z-20">
          <div className="flex flex-col items-center gap-2">
            <img src="/ubkut.png" alt="Logo" className="w-full max-w-[280px] sm:max-w-[340px] h-auto object-contain rounded-3xl shadow-2xl mb-4" />
            <p className="text-neutral-400 tracking-[0.2em] font-medium uppercase text-xs">{t('subtitle', uiLanguage)}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 w-full max-w-md mx-auto">
            
            {/* Region Dropdown */}
            <div className="flex-1 w-full relative" ref={regionRef}>
              <button
                onClick={handleRegionClick}
                className="w-full flex items-center justify-between bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-neutral-100 text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-4 transition-all focus:outline-none h-14"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{currentRegion.icon}</span>
                  <span>{t(`region_${currentRegion.id}` as any, uiLanguage)}</span>
                </div>
                {!user ? (
                  <Lock className="w-4 h-4 text-neutral-600" />
                ) : (
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${isRegionDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                )}
              </button>

              {isRegionDropdownOpen && user && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                    {REGION_OPTIONS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setRegion(r.id);
                          setIsRegionDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                          region === r.id 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                        }`}
                      >
                        <span className="text-lg leading-none">{r.icon}</span>
                        <span>{t(`region_${r.id}` as any, uiLanguage)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Genre Dropdown */}
            <div className="flex-1 w-full relative" ref={genreRef}>
              <button
                onClick={handleGenreClick}
                className="w-full flex items-center justify-between bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-neutral-100 text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-4 transition-all focus:outline-none h-14"
              >
                <div className="flex items-center gap-2">
                  <span>{currentGenre.label}</span>
                </div>
                {!user ? (
                  <Lock className="w-4 h-4 text-neutral-600" />
                ) : (
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${isGenreDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                )}
              </button>

              {isGenreDropdownOpen && user && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                    {GENRE_OPTIONS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setGenre(g.id);
                          setIsGenreDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors text-left ${
                          genre === g.id 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                        }`}
                      >
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm">{t('fetching', uiLanguage)}</p>
            </div>
          ) : (
            <div className="w-full space-y-4 pt-2 relative z-10">
              <button
                onClick={() => onSelectDifficulty('lett')}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-transform active:scale-[0.98] block"
              >
                {t('startGame', uiLanguage)}
              </button>
              <button
                onClick={() => {
                  if (!user) onRequireLogin();
                  else if (onJoinPvp) onJoinPvp();
                }}
                className="w-full py-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {!user && <Lock className="w-4 h-4 text-neutral-400" />}
                {t('playPvp', uiLanguage)}
              </button>
              <p className="text-neutral-500 text-xs mt-6 tracking-wide">{t('diffHint', uiLanguage)}</p>
            </div>
          )}
        </div>
        
        <div className="w-full lg:max-w-md relative z-10">
          <Leaderboard region={region} uiLanguage={uiLanguage} />
        </div>
      </div>
    </div>
  );
};
