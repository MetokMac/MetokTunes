// firebase-config.js
import firebaseConfig from './config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export the initialized app for use in other modules
export const app = firebase.app();
export const db = firebase.firestore();
export const auth = firebase.auth();
