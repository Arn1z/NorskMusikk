import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `      if (!querySnapshot.empty) {
        const roomDoc = querySnapshot.docs[0];
        setRoomId(roomDoc.id);
        setIsPlayer1(false);
        setTracks(roomDoc.data().tracks);
        
        await updateDoc(doc(db, 'pvp_rooms', roomDoc.id), {
          player2: user.uid,
          player2Name: profile?.displayName || 'Player 2',
          status: 'playing',
          player2LastPing: Date.now()
        });
      } else {`;

const newLogic = `      let foundRoom = false;
      for (const roomDoc of querySnapshot.docs) {
        const data = roomDoc.data();
        const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
        if (Date.now() - createdAt > 60000) {
           // Clean up stale room
           updateDoc(doc(db, 'pvp_rooms', roomDoc.id), { status: 'finished' }).catch(console.error);
           continue;
        }
        
        setRoomId(roomDoc.id);
        setIsPlayer1(false);
        setTracks(data.tracks);
        
        await updateDoc(doc(db, 'pvp_rooms', roomDoc.id), {
          player2: user.uid,
          player2Name: profile?.displayName || 'Player 2',
          status: 'playing',
          player2LastPing: Date.now()
        });
        foundRoom = true;
        break;
      }

      if (!foundRoom) {`;

content = content.replace(oldLogic, newLogic);

fs.writeFileSync('src/App.tsx', content, 'utf8');
