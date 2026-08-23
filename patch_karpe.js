import fs from 'fs';

let content = fs.readFileSync('src/artists.ts', 'utf8');

// Umulig NO
content = content.replace(
  "'Karpe Diem'",
  "'Ralph Myerz'"
);

fs.writeFileSync('src/artists.ts', content, 'utf8');
