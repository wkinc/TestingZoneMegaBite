import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, orderBy,
  limit, onSnapshot, writeBatch, serverTimestamp, getCountFromServer }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp({
  apiKey: 'AIzaSyBObFzFKM93QD1fMNyZqVLj1kGYvEn0a5A',
  authDomain: 'megabite-os-test.firebaseapp.com',
  projectId: 'megabite-os-test',
  appId: '1:774860936041:web:392bddcf41af80cbed63f8',
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export { onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, orderBy, limit,
  onSnapshot, writeBatch, serverTimestamp, getCountFromServer };
