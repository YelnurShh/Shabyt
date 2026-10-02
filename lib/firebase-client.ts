import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBnOp_UNw82uUkdrY4QYst6VWz74A785Zw',
  authDomain: 'shabyt-a12b0.firebaseapp.com',
  projectId: 'shabyt-a12b0',
  storageBucket: 'shabyt-a12b0.firebasestorage.app',
  messagingSenderId: '723437804086',
  appId: '1:723437804086:web:e1db3ec317fa415c3b9697',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
