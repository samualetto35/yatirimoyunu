import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration for yatirimoyunu1 project
const firebaseConfig = {
  apiKey: "AIzaSyCmxbJ42q3XYUj6oFUKjbqRCvIAX7yB5kA",
  authDomain: "yatirimoyunu1.firebaseapp.com",
  projectId: "yatirimoyunu1",
  storageBucket: "yatirimoyunu1.firebasestorage.app",
  messagingSenderId: "1059980367276",
  appId: "1:1059980367276:web:ec954d670a7a5dcfad1609",
  measurementId: "G-V5PMGYZHRD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 