import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "setTotalRounds(tracks.length * 1000);",
  "setTotalRounds(3);"
);
fs.writeFileSync('src/App.tsx', content, 'utf8');
