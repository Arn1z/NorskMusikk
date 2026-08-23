import React, { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { PvpGameScreen } from './components/PvpGameScreen';
import { LoginScreen } from './LoginScreen';
import { Difficulty, Region, Track, GameState, Language, Genre } from './types';
import { fetchTracks } from './api';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, doc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { t } from './i18n';
import { useAuth, loginWithGoogle, logout } from './contexts/AuthContext';
import { LogOut } from 'lucide-react';

const getDefaultLanguage = (): Language => {
  const lang = navigator.language.toLowerCase();
  return lang.startsWith('no') || lang.startsWith('nb') || lang.startsWith('nn') ? 'no' : 'en';
};

export default function App() {
  const { user, profile } = useAuth();
  const [gameState, setGameState] = useState<GameState>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('lett');
  const [region, setRegion] = useState<Region>('global');
  const [genre, setGenre] = useState<Genre>('all');
  const [uiLanguage, setUiLanguage] = useState<Language>(getDefaultLanguage);
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  
  const [roomId, setRoomId] = useState<string>('');
  const [playerId] = useState<string>(() => Math.random().toString(36).substring(2, 9));
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [opponentScore, setOpponentScore] = useState(0);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!user) {
      setRegion('global');
      setGenre('all');
    }
  }, [user]);

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

  const handleStart = async (selectedDifficulty: Difficulty, selectedRegion: Region = region, selectedGenre: Genre = genre) => {
    setDifficulty(selectedDifficulty);
    setRegion(selectedRegion);
    setGenre(selectedGenre);
    setGameState('loading');
    
    try {
      const fetchedTracks = await fetchTracks(selectedDifficulty, selectedRegion, selectedGenre);
      if (fetchedTracks.length === 0) {
        alert(t('errorFetch', uiLanguage));
        setGameState('start');
        return;
      }
      setTracks(fetchedTracks);
      setGameState('playing');
    } catch (error) {
      console.error(error);
      alert(t('errorGeneric', uiLanguage));
      setGameState('start');
    }
  };

  const handleJoinPvp = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setRegion('global');
    setGenre('all');
    setGameState('pvp_queue');
    
    try {
      const q = query(collection(db, 'pvp_rooms'), where('status', '==', 'waiting'), where('region', '==', 'global'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const roomDoc = querySnapshot.docs[0];
        setRoomId(roomDoc.id);
        setIsPlayer1(false);
        setTracks(roomDoc.data().tracks);
        
        await updateDoc(doc(db, 'pvp_rooms', roomDoc.id), {
          player2: user.uid,
          player2Name: profile?.displayName || 'Player 2',
          status: 'playing'
        });
      } else {
        const fetchedTracks = await fetchTracks(difficulty, 'global', 'all');
        if (fetchedTracks.length === 0) {
          alert(t('errorFetch', uiLanguage));
          setGameState('start');
          return;
        }
        setTracks(fetchedTracks);
        setIsPlayer1(true);
        
        const newRoomRef = await addDoc(collection(db, 'pvp_rooms'), {
          createdAt: serverTimestamp(),
          status: 'waiting',
          region: 'global',
          player1: user.uid,
          player1Name: profile?.displayName || 'Player 1',
          player2: null,
          player2Name: null,
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
      alert(t('errorPvp', uiLanguage));
      setGameState('start');
    }
  };

  const handleFinish = (finalScore: number, total: number) => {
    setScore(finalScore);
    setTotalRounds(total);
    setGameState('result');
  };

  const handlePvpFinish = async (myScore: number, oppScore: number) => {
    setScore(myScore);
    setOpponentScore(oppScore);
    setTotalRounds(tracks.length * 1000);
    setGameState('pvp_result');

    if (user && profile) {
      const ratingChange = myScore > oppScore ? 25 : myScore < oppScore ? -25 : 0;
      if (ratingChange !== 0) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          rating: profile.rating + ratingChange,
          gamesPlayed: (profile.gamesPlayed || 0) + 1
        }).catch(console.error);
      }
    }
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
      
      {showLoginPrompt && (
        <LoginScreen uiLanguage={uiLanguage} onCancel={() => setShowLoginPrompt(false)} />
      )}

      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 py-8 md:px-12 gap-6 md:gap-0">
        <div className="flex items-center cursor-pointer" onClick={handleRestart}>
          <img src="/ubkut.png" alt="Logo" className="w-24 md:w-32 h-auto object-contain rounded-2xl shadow-xl" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex gap-8 border-b border-white/10 pb-2">
            {(['lett', 'medium', 'vanskelig', 'umulig'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => handleStart(d, region, genre)}
                disabled={gameState === 'loading'}
                className={`text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed relative ${
                  difficulty === d && gameState !== 'start'
                    ? 'text-emerald-400' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t(d as any, uiLanguage)}
                {difficulty === d && gameState !== 'start' && (
                  <div className="absolute -bottom-[9px] left-0 w-full h-[2px] bg-emerald-400"></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 backdrop-blur-sm">
              <button
                onClick={() => setUiLanguage('no')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors ${uiLanguage === 'no' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                NO
              </button>
              <button
                onClick={() => setUiLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors ${uiLanguage === 'en' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 bg-neutral-900/80 px-4 py-1.5 rounded-xl border border-neutral-800 backdrop-blur-sm">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-neutral-200">{profile?.displayName || 'Player'}</span>
                  <span className="text-[10px] text-emerald-400 font-bold tracking-wider">{profile?.rating || 1000} ELO</span>
                </div>
                <button onClick={logout} className="text-neutral-500 hover:text-neutral-300 transition-colors ml-1 p-1">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginPrompt(true)}
                className="bg-neutral-900/80 hover:bg-neutral-800 px-4 py-2 rounded-xl border border-neutral-800 text-xs font-bold tracking-widest uppercase transition-colors text-neutral-300 backdrop-blur-sm"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-12">
        {gameState === 'start' && <StartScreen onSelectDifficulty={(diff) => handleStart(diff, region, genre)} onJoinPvp={() => handleJoinPvp()} region={region} setRegion={setRegion} genre={genre} setGenre={setGenre} uiLanguage={uiLanguage} onRequireLogin={() => setShowLoginPrompt(true)} />}
        {gameState === 'loading' && <StartScreen onSelectDifficulty={() => {}} isLoading={true} region={region} setRegion={setRegion} genre={genre} setGenre={setGenre} uiLanguage={uiLanguage} onRequireLogin={() => {}} />}
        
        {gameState === 'pvp_queue' && (
          <div className="flex flex-col items-center text-center">
             <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm">{t('searchingPvp', uiLanguage)}</p>
             <p className="text-white/40 text-xs mt-2">{t('readyPvp', uiLanguage)}</p>
          </div>
        )}

        {gameState === 'playing' && <GameScreen tracks={tracks} onFinish={handleFinish} region={region} uiLanguage={uiLanguage} />}
        
        {gameState === 'pvp_playing' && roomId && (
          <PvpGameScreen roomId={roomId} playerId={user?.uid || playerId} isPlayer1={isPlayer1} tracks={tracks} onFinish={handlePvpFinish} region={region} uiLanguage={uiLanguage} />
        )}

        {gameState === 'result' && <ResultScreen score={score} total={totalRounds} onRestart={handleRestart} difficulty={difficulty} region={region} uiLanguage={uiLanguage} />}
        
        {gameState === 'pvp_result' && (
          <ResultScreen score={score} total={totalRounds} onRestart={handleRestart} isPvp={true} opponentScore={opponentScore} difficulty={difficulty} region={region} uiLanguage={uiLanguage} />
        )}
      </div>
    </div>
  );
}
