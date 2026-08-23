import React, { useState } from 'react';
import { RefreshCw, Trophy, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface ResultScreenProps {
  score: number;
  total: number;
  onRestart: () => void;
  isPvp?: boolean;
  opponentScore?: number;
  difficulty?: string;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, onRestart, isPvp, opponentScore, difficulty }) => {
  const percentage = Math.round((score / total) * 100);
  
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  let message = "";
  if (isPvp) {
    if (score > (opponentScore || 0)) message = "Gratulerer, du vant!";
    else if (score < (opponentScore || 0)) message = "Beklager, du tapte.";
    else message = "Det ble uavgjort!";
  } else {
    if (percentage === 100) message = "Perfekt! Du er et orakel.";
    else if (percentage >= 80) message = "Veldig bra jobba!";
    else if (percentage >= 50) message = "Ikke verst, men kan bli bedre.";
    else message = "Uff da, kanskje prøve en lettere vanskelighetsgrad?";
  }

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'leaderboard'), {
        playerName: playerName.trim(),
        score: score,
        pvpWins: isPvp && score > (opponentScore || 0) ? 1 : 0,
        difficulty: difficulty || 'ukjent',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <div className="max-w-xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl flex flex-col items-center text-center space-y-10">
        
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-[32px] bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Trophy className="w-12 h-12 text-emerald-400" />
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Ferdig!</h2>
          <p className="text-white/40 tracking-widest uppercase text-sm">{message}</p>
        </div>

        <div className="py-8 w-full border-y border-white/10 flex flex-col items-center gap-2">
          {isPvp ? (
            <div className="flex items-center justify-center gap-12 w-full">
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-emerald-400">{score}</div>
                <p className="text-[10px] uppercase tracking-widest font-bold mt-1 text-white/40">Deg</p>
              </div>
              <div className="text-4xl font-bold text-white/20">-</div>
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-red-400">{opponentScore}</div>
                <p className="text-[10px] uppercase tracking-widest font-bold mt-1 text-white/40">Motstander</p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-6xl font-bold text-white">
                {score} <span className="text-3xl text-white/30">/ {total}</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold mt-1 text-white/40">Riktige svar</p>
            </>
          )}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmitScore} className="w-full space-y-4">
            <p className="text-white/60 text-sm mb-2">Lagre poengsummen din på topplisten?</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ditt navn..."
                maxLength={20}
                required
                className="flex-1 bg-black/40 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-2xl px-5 py-4 text-white outline-none"
              />
              <button
                type="submit"
                disabled={isSubmitting || !playerName.trim()}
                className="px-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black rounded-2xl font-bold transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-medium">
            Poengsummen din er lagret på topplisten!
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-bold uppercase tracking-widest transition-transform active:scale-95 flex items-center justify-center space-x-3"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Spill igjen</span>
        </button>
      </div>
    </div>
  );
};
