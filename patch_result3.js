import fs from 'fs';

let content = fs.readFileSync('src/components/ResultScreen.tsx', 'utf8');

const jsxOld = `{isPvp ? (
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
            </div>`;

const jsxNew = `{isPvp ? (
            <div className="flex items-center justify-center gap-12 w-full">
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-emerald-400 font-display">{displayScore}</div>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold mt-1 text-neutral-500">{t('you', uiLanguage)}</p>
              </div>
              <div className="text-4xl font-bold text-neutral-700">-</div>
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-red-400 font-display">{displayOppScore}</div>
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold mt-1 text-neutral-500">{t('opponent', uiLanguage)}</p>
              </div>
            </div>`;

content = content.replace(jsxOld, jsxNew);

fs.writeFileSync('src/components/ResultScreen.tsx', content, 'utf8');
