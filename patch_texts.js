import fs from 'fs';
let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

content = content.replace("setRoundWinner('Venter på motstander...');", "setRoundWinner(t('waiting', uiLanguage) as string);");
content = content.replace("setRoundWinner('Motstander gjettet riktig! Du har 10 sekunder på deg!');", "setRoundWinner(t('opponentGuessed10s', uiLanguage) as string);");
content = content.replace("setRoundWinner('Begge gjettet riktig!');", "setRoundWinner(t('bothCorrect', uiLanguage) as string);");
content = content.replace("setRoundWinner('Du vant runden!');", "setRoundWinner(t('youWonRound', uiLanguage) as string);");
content = content.replace("setRoundWinner('Motstanderen vant runden!');", "setRoundWinner(t('opponentWonRound', uiLanguage) as string);");
content = content.replace("setRoundWinner('Ingen gjettet riktig!');", "setRoundWinner(t('nobodyCorrect', uiLanguage) as string);");
content = content.replace("<X className=\"w-4 h-4\" /> Forlat", "<X className=\"w-4 h-4\" /> {t('leaveMatch', uiLanguage)}");

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
