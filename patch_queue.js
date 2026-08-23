import fs from 'fs';

let content = fs.readFileSync('src/components/StartScreen.tsx', 'utf8');

const oldQueue = `  useEffect(() => {
    const q = query(collection(db, 'pvp_rooms'), where('status', '==', 'waiting'), where('region', '==', 'global'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQueueCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);`;

const newQueue = `  useEffect(() => {
    const q = query(collection(db, 'pvp_rooms'), where('status', '==', 'waiting'), where('region', '==', 'global'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      const now = Date.now();
      snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : now;
        if (now - createdAt <= 60000) {
          count++;
        }
      });
      setQueueCount(count);
    });
    return () => unsubscribe();
  }, []);`;

content = content.replace(oldQueue, newQueue);

fs.writeFileSync('src/components/StartScreen.tsx', content, 'utf8');
