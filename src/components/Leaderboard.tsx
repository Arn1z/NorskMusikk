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
    <div className="w-full h-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6">
      <div className="flex items-center gap-3 mb-6 justify-center">
        <Trophy className="w-5 h-5 text-emerald-400" />
        <h3 className="text-xl font-bold tracking-tight text-white uppercase text-center">Topp 10 Spillerne</h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-white/40 text-sm">Ingen resultater enda. Bli den første!</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center font-bold text-white/40 text-sm">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div>
                  <span className="text-white font-medium">{entry.playerName}</span>
                  {entry.difficulty && (
                    <span className="block text-[10px] uppercase text-white/30">{entry.difficulty}</span>
                  )}
                </div>
              </div>
              <div className="text-xl font-bold text-emerald-400">{entry.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
