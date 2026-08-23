/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameState, Difficulty, Track } from './types';
import { fetchTracks } from './api';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { PvpGameScreen } from './components/PvpGameScreen';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('lett');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  
  const [roomId, setRoomId] = useState<string>('');
  const [playerId] = useState<string>(() => Math.random().toString(36).substring(2, 9));
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => {
    if (!roomId || gameState !== 'pvp_queue') return;

    const unsubscribe = onSnapshot(doc(db, 'pvp_rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'playing') {
          setGameState('pvp_playing');
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, gameState]);

  const handleStart = async (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState('loading');
    try {
      const fetchedTracks = await fetchTracks(selectedDifficulty);
      if (fetchedTracks.length === 0) {
        alert('Kunne ikke hente sanger. Prøv igjen.');
        setGameState('start');
        return;
      }
      setTracks(fetchedTracks);
      setGameState('playing');
    } catch (error) {
      console.error(error);
      alert('En feil oppstod.');
      setGameState('start');
    }
  };

  const handleJoinPvp = async () => {
    setGameState('pvp_queue');
    try {
      const q = query(collection(db, 'pvp_rooms'), where('status', '==', 'waiting'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Join existing room
        const roomDoc = querySnapshot.docs[0];
        setRoomId(roomDoc.id);
        setIsPlayer1(false);
        setTracks(roomDoc.data().tracks);
        
        await updateDoc(doc(db, 'pvp_rooms', roomDoc.id), {
          player2: playerId,
          status: 'playing'
        });
      } else {
        // Create new room
        const fetchedTracks = await fetchTracks(difficulty);
        if (fetchedTracks.length === 0) {
          alert('Kunne ikke hente sanger.');
          setGameState('start');
          return;
        }
        setTracks(fetchedTracks);
        setIsPlayer1(true);
        
        const newRoomRef = await addDoc(collection(db, 'pvp_rooms'), {
          createdAt: serverTimestamp(),
          status: 'waiting',
          player1: playerId,
          player2: null,
          player1Score: 0,
          player2Score: 0,
          currentRound: 0,
          tracks: fetchedTracks,
          player1GuessedCorrectly: false,
          player2GuessedCorrectly: false,
          firstGuesserId: null,
          roundEndsAt: null
        });
        setRoomId(newRoomRef.id);
      }
    } catch (error) {
      console.error("Error joining PVP:", error);
      alert('Kunne ikke koble til PVP.');
      setGameState('start');
    }
  };


  const handleFinish = (finalScore: number, total: number) => {
    setScore(finalScore);
    setTotalRounds(total);
    setGameState('result');
  };

  const handlePvpFinish = (myScore: number, oppScore: number) => {
    setScore(myScore);
    setOpponentScore(oppScore);
    setTotalRounds(tracks.length);
    setGameState('pvp_result');
  };

  const handleRestart = () => {
    setGameState('start');
    setTracks([]);
    setScore(0);
    setOpponentScore(0);
  };

  return (
    <div 
      className="min-h-screen text-neutral-100 font-sans flex flex-col overflow-x-hidden relative selection:bg-emerald-500/30 bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: 'url(/background.jpg)' }}
    >
      <div className="fixed inset-0 bg-neutral-950/85 pointer-events-none"></div>
      
      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 py-8 md:px-12 gap-6 md:gap-0">
        <div className="flex items-center cursor-pointer" onClick={handleRestart}>
          <img src="/MUSIKKLOGO.png" alt="NorskMusikk" className="w-40 md:w-48 h-auto object-contain drop-shadow-xl" />
        </div>
        
        <div className="flex gap-8 border-b border-white/10 pb-2">
          {(['lett', 'medium', 'vanskelig', 'umulig'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => handleStart(d)}
              disabled={gameState === 'loading'}
              className={`text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed relative ${
                difficulty === d && gameState !== 'start'
                  ? 'text-emerald-400' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {d}
              {difficulty === d && gameState !== 'start' && (
                <div className="absolute -bottom-[9px] left-0 w-full h-[2px] bg-emerald-400"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-12">
        {gameState === 'start' && <StartScreen onSelectDifficulty={handleStart} onJoinPvp={handleJoinPvp} />}
        {gameState === 'loading' && <StartScreen onSelectDifficulty={() => {}} isLoading={true} />}
        {gameState === 'pvp_queue' && (
          <div className="flex flex-col items-center text-center">
             <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm">Leter etter motstander...</p>
             <p className="text-white/40 text-xs mt-2">Dette kan ta litt tid. Gjør deg klar!</p>
          </div>
        )}
        {gameState === 'playing' && <GameScreen tracks={tracks} onFinish={handleFinish} />}
        {gameState === 'pvp_playing' && roomId && (
          <PvpGameScreen roomId={roomId} playerId={playerId} isPlayer1={isPlayer1} tracks={tracks} onFinish={handlePvpFinish} />
        )}
        {gameState === 'result' && <ResultScreen score={score} total={totalRounds} onRestart={handleRestart} difficulty={difficulty} />}
        {gameState === 'pvp_result' && (
          <ResultScreen score={score} total={totalRounds} onRestart={handleRestart} isPvp={true} opponentScore={opponentScore} difficulty={difficulty} />
        )}
      </div>
    </div>
  );
}
