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
        <div className="max-w-xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl space-y-12 text-center flex-1">
          <div className="flex flex-col items-center gap-2">
            <img src="/MUSIKKLOGO.png" alt="NorskMusikk Logo" className="w-full max-w-[280px] sm:max-w-[380px] h-auto object-contain drop-shadow-2xl" />
            <p className="text-white/40 tracking-widest uppercase text-sm mt-0">Gjett riktig sang på kortest mulig tid</p>
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
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-sm font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-emerald-500/20 block"
              >
                Start Spill
              </button>
              <button
                onClick={onJoinPvp}
                className="w-full py-5 bg-purple-500 hover:bg-purple-400 text-black rounded-2xl text-sm font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-purple-500/20 block"
              >
                Spill mot andre (PVP)
              </button>
              <p className="text-white/40 text-xs mt-4">Eller velg vanskelighetsgrad i menyen på toppen</p>
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

