import fs from 'fs';
let content = fs.readFileSync('src/i18n.ts', 'utf8');

content = content.replace("waiting: 'Venter på motstander...',", "waiting: 'Venter på motstander...',\n    opponentGuessed10s: 'Motstander gjettet riktig! Du har 10 sekunder på deg!',\n    bothCorrect: 'Begge gjettet riktig!',\n    youWonRound: 'Du vant runden!',\n    opponentWonRound: 'Motstanderen vant runden!',\n    nobodyCorrect: 'Ingen gjettet riktig!',");
content = content.replace("waiting: 'Waiting for opponent...',", "waiting: 'Waiting for opponent...',\n    opponentGuessed10s: 'Opponent guessed correctly! You have 10 seconds!',\n    bothCorrect: 'Both guessed correctly!',\n    youWonRound: 'You won the round!',\n    opponentWonRound: 'Opponent won the round!',\n    nobodyCorrect: 'Nobody guessed correctly!',");
content = content.replace("leftMatch: 'Forlat',", "leaveMatch: 'Forlat',");
content = content.replace("hasGuessed: 'har svart!',", "hasGuessed: 'har svart!',\n    leaveMatch: 'Forlat',");
content = content.replace("hasGuessed: 'has answered!',", "hasGuessed: 'has answered!',\n    leaveMatch: 'Leave',");

fs.writeFileSync('src/i18n.ts', content, 'utf8');
