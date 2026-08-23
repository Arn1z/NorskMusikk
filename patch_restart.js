import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "setGameState('start');\n    setTracks([]);",
  "setGameState('start');\n    setTracks([]);\n    setRoomId(null);"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
