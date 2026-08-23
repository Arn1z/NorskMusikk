import fs from 'fs';

let content = fs.readFileSync('src/components/ResultScreen.tsx', 'utf8');

content = content.replace(
  "textToShare = `🎵 Music Quiz PVP!\\nI scored ${score} vs ${opponentScore}!\\nCan you beat me?`;",
  "textToShare = `🎵 Music Quiz PVP!\\nI scored ${displayScore} vs ${displayOppScore}!\\nCan you beat me?`;"
);

fs.writeFileSync('src/components/ResultScreen.tsx', content, 'utf8');
