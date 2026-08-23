const fs = require('fs');
let code = fs.readFileSync('src/components/ResultScreen.tsx', 'utf-8');

code = code.replace("import { Region } from '../types';", "import { Region, Language } from '../types';\nimport { t } from '../i18n';");
code = code.replace("region?: Region;", "region?: Region;\n  uiLanguage: Language;");
code = code.replace("if (score > (opponentScore || 0)) message = \"Gratulerer, du vant!\";", "if (score > (opponentScore || 0)) message = t('win', uiLanguage);");
code = code.replace("else if (score < (opponentScore || 0)) message = \"Beklager, du tapte.\";", "else if (score < (opponentScore || 0)) message = t('lose', uiLanguage);");
code = code.replace("else message = \"Det ble uavgjort!\";", "else message = t('tie', uiLanguage);");

code = code.replace("if (percentage === 100) message = \"Perfekt! Du er et orakel.\";", "if (percentage === 100) message = t('perfect', uiLanguage);");
code = code.replace("else if (percentage >= 80) message = \"Veldig bra jobba!\";", "else if (percentage >= 80) message = t('great', uiLanguage);");
code = code.replace("else if (percentage >= 50) message = \"Ikke verst, men kan bli bedre.\";", "else if (percentage >= 50) message = t('good', uiLanguage);");
code = code.replace("else message = \"Uff da, kanskje prøve en lettere vanskelighetsgrad?\";", "else message = t('bad', uiLanguage);");

code = code.replace(">Ferdig!<", ">{t('finished', uiLanguage)}<");
code = code.replace(">Deg<", ">{t('you', uiLanguage)}<");
code = code.replace(">Motstander<", ">{t('opponent', uiLanguage)}<");
code = code.replace(">Riktige svar<", ">{t('correctAnswers', uiLanguage)}<");
code = code.replace(">Lagre poengsummen din på topplisten?<", ">{t('saveScore', uiLanguage)}<");
code = code.replace("\"Ditt navn...\"", "{t('yourName', uiLanguage)}");
code = code.replace(">Poengsummen din er lagret på topplisten!<", ">{t('scoreSaved', uiLanguage)}<");
code = code.replace(">Spill igjen<", ">{t('playAgain', uiLanguage)}<");

fs.writeFileSync('src/components/ResultScreen.tsx', code);
