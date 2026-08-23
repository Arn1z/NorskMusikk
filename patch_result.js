import fs from 'fs';

let content = fs.readFileSync('src/components/ResultScreen.tsx', 'utf8');

const newLogic = `  let message = "";
  let displayScore = score;
  let displayOppScore = opponentScore || 0;
  
  if (isPvp) {
    if (score === 99) {
      message = uiLanguage === 'no' ? "Motstanderen forlot spillet. Du vinner!" : "Opponent left the game. You win!";
      displayScore = 3;
      displayOppScore = 0;
    } else if (opponentScore === 99) {
      message = uiLanguage === 'no' ? "Du forlot spillet." : "You left the game.";
      displayScore = 0;
      displayOppScore = 3;
    } else if (score > (opponentScore || 0)) {
      message = t('win', uiLanguage);
    } else if (score < (opponentScore || 0)) {
      message = t('lose', uiLanguage);
    } else {
      message = t('tie', uiLanguage);
    }
  } else {`;

content = content.replace(
  `  let message = "";
  if (isPvp) {
    if (score > (opponentScore || 0)) message = t('win', uiLanguage);
    else if (score < (opponentScore || 0)) message = t('lose', uiLanguage);
    else message = t('tie', uiLanguage);
  } else {`,
  newLogic
);

// We need to replace usages of `score` and `opponentScore` with `displayScore` and `displayOppScore` in the JSX if it's PvP.
const jsxOld = `              <div className="flex items-center justify-center gap-12 mb-8">
                <div className="text-center">
                  <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest mb-2">{t('you', uiLanguage)}</p>
                  <p className="text-6xl font-display text-emerald-400">{score}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-display italic text-neutral-600 mb-2">VS</p>
                </div>
                <div className="text-center">
                  <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest mb-2">{t('opponent', uiLanguage)}</p>
                  <p className="text-6xl font-display text-red-400">{opponentScore}</p>
                </div>
              </div>`;
              
const jsxNew = `              <div className="flex items-center justify-center gap-12 mb-8">
                <div className="text-center">
                  <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest mb-2">{t('you', uiLanguage)}</p>
                  <p className="text-6xl font-display text-emerald-400">{displayScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-display italic text-neutral-600 mb-2">VS</p>
                </div>
                <div className="text-center">
                  <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest mb-2">{t('opponent', uiLanguage)}</p>
                  <p className="text-6xl font-display text-red-400">{displayOppScore}</p>
                </div>
              </div>`;

content = content.replace(jsxOld, jsxNew);

fs.writeFileSync('src/components/ResultScreen.tsx', content, 'utf8');
