import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0340956506",
  appId: "1:613337578419:web:42bea7283bf72bf3a8e9c6",
  apiKey: "AIzaSyDqjBCj5aHz52iDmoqopSp2o0T3f-Y-SkY",
  authDomain: "gen-lang-client-0340956506.firebaseapp.com",
  storageBucket: "gen-lang-client-0340956506.firebasestorage.app",
  messagingSenderId: "613337578419",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-norsksangquiz-8aa2dfb5-4e5c-40b0-ba91-d56db112583e");
export const auth = getAuth(app);
