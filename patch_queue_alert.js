import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldListener = `        if (data.status === 'playing') {
          setGameState('pvp_playing');
        } else if (data.status === 'finished') {
          // Room was cancelled or timed out
          setGameState('start');
        }`;

const newListener = `        if (data.status === 'playing') {
          setGameState('pvp_playing');
        } else if (data.status === 'finished') {
          // Room was cancelled or timed out
          alert(t('errorGeneric', uiLanguage) + " (Køen tok for lang tid / Matchmaking timeout)");
          setGameState('start');
        }`;

content = content.replace(oldListener, newListener);

fs.writeFileSync('src/App.tsx', content, 'utf8');
