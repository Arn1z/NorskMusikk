import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "status: 'playing'",
  "status: 'playing',\n          player2LastPing: Date.now()"
);

content = content.replace(
  "roundEndsAt: null",
  "roundEndsAt: null,\n          player1LastPing: Date.now()"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
