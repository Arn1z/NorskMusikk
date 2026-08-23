import React from 'react';
import { Difficulty } from '../types';
import { Leaderboard } from './Leaderboard';

interface StartScreenProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  isLoading?: boolean;
  onJoinPvp?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onSelectDifficulty, isLoading, onJoinPvp }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full p-4 max-w-4xl mx-auto flex-1">
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center">
        <div className="max-w-xl w-full bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 space-y-12 text-center flex-1">
          <div className="flex flex-col items-center gap-2">
            <img src="/MUSIKKLOGO.png" alt="NorskMusikk Logo" className="w-full max-w-[280px] sm:max-w-[340px] h-auto object-contain" />
            <p className="text-neutral-400 tracking-[0.2em] font-medium uppercase text-xs mt-2">Gjett riktig sang på kortest mulig tid</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm">Henter sanger fra skyen...</p>
            </div>
          ) : (
            <div className="w-full space-y-4 pt-4">
              <button
                onClick={() => onSelectDifficulty('lett')}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-transform active:scale-[0.98] block"
              >
                Start Spill
              </button>
              <button
                onClick={onJoinPvp}
                className="w-full py-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-transform active:scale-[0.98] block"
              >
                Spill mot andre (PVP)
              </button>
              <p className="text-neutral-500 text-xs mt-6 tracking-wide">Eller velg vanskelighetsgrad i menyen på toppen</p>
            </div>
          )}
        </div>
        
        <div className="w-full lg:max-w-md">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

