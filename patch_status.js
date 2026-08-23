import fs from 'fs';

let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

content = content.replace(
  "updateDoc(doc(db, 'pvp_rooms', roomId), {\n          [isPlayer1 ? 'player1Left' : 'player2Left']: true\n        });",
  "updateDoc(doc(db, 'pvp_rooms', roomId), {\n          [isPlayer1 ? 'player1Left' : 'player2Left']: true,\n          status: 'finished'\n        });"
);

content = content.replace(
  "updateDoc(doc(db, 'pvp_rooms', roomId), {\n          [isPlayer1 ? 'player2Left' : 'player1Left']: true\n        })",
  "updateDoc(doc(db, 'pvp_rooms', roomId), {\n          [isPlayer1 ? 'player2Left' : 'player1Left']: true,\n          status: 'finished'\n        })"
);

content = content.replace(
  "await updateDoc(doc(db, 'pvp_rooms', roomId), {\n                 [isPlayer1 ? 'player1Left' : 'player2Left']: true\n               });",
  "await updateDoc(doc(db, 'pvp_rooms', roomId), {\n                 [isPlayer1 ? 'player1Left' : 'player2Left']: true,\n                 status: 'finished'\n               });"
);

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
