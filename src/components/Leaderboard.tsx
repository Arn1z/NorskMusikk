import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy } from 'lucide-react';
import { Language, Region } from '../types';
import { t } from '../i18n';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  rating: number;
}

interface LeaderboardProps {
  region: Region;
  uiLanguage: Language;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ uiLanguage }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('rating', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaderboardEntry[];
      setEntries(fetchedEntries);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full h-full bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-8 justify-center">
        <Trophy className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold tracking-[0.1em] text-neutral-100 uppercase text-center font-display">{t('top10', uiLanguage)}</h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-neutral-500 text-sm">{t('noResults', uiLanguage)}</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/50 hover:bg-neutral-800/80 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center font-bold text-neutral-400 text-sm">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div>
                  <span className="text-neutral-200 font-medium font-display">{entry.displayName || 'Player'}</span>
                  <span className="block text-[10px] uppercase text-neutral-500 tracking-wider">
                    PvP Rating
                  </span>
                </div>
              </div>
              <div className="text-xl font-bold text-emerald-400 font-display">{entry.rating || 1000}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
