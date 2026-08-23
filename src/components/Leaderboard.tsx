import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Medal, Clock } from 'lucide-react';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  difficulty?: string;
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'leaderboard'),
          orderBy('score', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const fetchedEntries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LeaderboardEntry[];
        setEntries(fetchedEntries);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full h-full bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-8 justify-center">
        <Trophy className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold tracking-[0.1em] text-neutral-100 uppercase text-center font-display">Topp 10 Spillerne</h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-neutral-500 text-sm">Ingen resultater enda. Bli den første!</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/50 hover:bg-neutral-800/80 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center font-bold text-neutral-400 text-sm">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div>
                  <span className="text-neutral-200 font-medium font-display">{entry.playerName}</span>
                  {entry.difficulty && (
                    <span className="block text-[10px] uppercase text-neutral-500 tracking-wider">{entry.difficulty}</span>
                  )}
                </div>
              </div>
              <div className="text-xl font-bold text-emerald-400 font-display">{entry.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
