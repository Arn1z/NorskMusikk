import React, { useState } from 'react';
import { RefreshCw, Trophy, Share2 } from 'lucide-react';
import { Region, Language } from '../types';
import { t } from '../i18n';

interface ResultScreenProps {
  score: number;
  total: number;
  onRestart: () => void;
  isPvp?: boolean;
  opponentScore?: number;
  difficulty?: string;
  region?: Region;
  uiLanguage: Language;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, onRestart, isPvp, opponentScore, difficulty, region, uiLanguage }) => {
  const percentage = Math.round((score / total) * 100);
  
  const [copied, setCopied] = useState(false);

  let message = "";
  if (isPvp) {
    if (score > (opponentScore || 0)) message = t('win', uiLanguage);
    else if (score < (opponentScore || 0)) message = t('lose', uiLanguage);
    else message = t('tie', uiLanguage);
  } else {
    if (percentage === 100) message = t('perfect', uiLanguage);
    else if (percentage >= 80) message = t('great', uiLanguage);
    else if (percentage >= 50) message = t('good', uiLanguage);
    else message = t('bad', uiLanguage);
  }

  const handleShare = async () => {
    let textToShare = "";
    if (isPvp) {
      textToShare = `🎵 Music Quiz PVP!\nI scored ${score} vs ${opponentScore}!\nCan you beat me?`;
    } else {
      textToShare = `🎵 Music Quiz!\nI scored ${score}/${total} on ${difficulty || 'easy'} difficulty!\nCan you beat me?`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Music Quiz Result',
          text: textToShare,
          url: window.location.origin
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${textToShare}\n${window.location.origin}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <div className="max-w-xl w-full bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 flex flex-col items-center text-center space-y-10">
        
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-neutral-950 flex items-center justify-center border border-neutral-800">
            <Trophy className="w-12 h-12 text-emerald-400" />
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-neutral-100 mb-2 font-display">{t('finished', uiLanguage)}</h2>
          <p className="text-neutral-500 tracking-[0.1em] uppercase text-sm">{message}</p>
        </div>

        <div className="py-8 w-full border-y border-neutral-800 flex flex-col items-center gap-2">
          {isPvp ? (
            <div className="flex items-center justify-center gap-12 w-full">
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-emerald-400 font-display">{score}</div>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold mt-1 text-neutral-500">{t('you', uiLanguage)}</p>
              </div>
              <div className="text-4xl font-bold text-neutral-700">-</div>
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-red-400 font-display">{opponentScore}</div>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold mt-1 text-neutral-500">{t('opponent', uiLanguage)}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-6xl font-bold text-neutral-100 font-display">
                {score} <span className="text-3xl text-neutral-700">/ {total}</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold mt-1 text-neutral-500">{t('correctAnswers', uiLanguage)}</p>
            </>
          )}
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={handleShare}
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-transform active:scale-95 flex items-center justify-center space-x-3"
          >
            <Share2 className="w-5 h-5" />
            <span>{copied ? t('copiedToClipboard', uiLanguage) : t('shareResult', uiLanguage)}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-transform active:scale-95 flex items-center justify-center space-x-3"
          >
            <RefreshCw className="w-5 h-5" />
            <span>{t('playAgain', uiLanguage)}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
