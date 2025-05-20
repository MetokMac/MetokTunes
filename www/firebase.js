// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBweoLvMv4WERAc31PGM9-8k19RXR1PcGg",
    authDomain: "metoktunes.firebaseapp.com",
    projectId: "metoktunes",
    storageBucket: "metoktunes.firebasestorage.app",
    messagingSenderId: "683773038647",
    appId: "1:683773038647:web:d2fbdb4496535737ce6fb2",
    measurementId: "G-5G1NJ3SZ13"
};

// Initialize Firebase
const firebase = {
    config: firebaseConfig,
    initialize() {
        try {
            const app = initializeApp(this.config);
            this.auth = getAuth(app);
            this.db = getFirestore(app);
            this.storage = getStorage(app);
            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return false;
        }
    },
    // User authentication methods
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    },
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    },
    async signOut() {
        try {
            await signOut(this.auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    },
    // Firestore methods
    async getArtists() {
        try {
            const artistsRef = collection(this.db, 'artists');
            const snapshot = await getDocs(artistsRef);
            const artists = [];
            snapshot.forEach(doc => {
                artists.push({ id: doc.id, ...doc.data() });
            });
            return artists;
        } catch (error) {
            console.error('Error getting artists:', error);
            throw error;
        }
    },
    async getSongs() {
        try {
            const songsRef = collection(this.db, 'songs');
            const snapshot = await getDocs(songsRef);
            const songs = [];
            snapshot.forEach(doc => {
                songs.push({ id: doc.id, ...doc.data() });
            });
            return songs;
        } catch (error) {
            console.error('Error getting songs:', error);
            throw error;
        }
    },
    async getUserPlaylists(userId) {
        try {
            const playlistsRef = collection(this.db, 'playlists');
            const q = query(playlistsRef, where('userId', '==', userId));
            const snapshot = await getDocs(q);
            const playlists = [];
            snapshot.forEach(doc => {
                playlists.push({ id: doc.id, ...doc.data() });
            });
            return playlists;
        } catch (error) {
            console.error('Error getting playlists:', error);
            throw error;
        }
    },
    // Storage methods
    async uploadSong(file) {
        try {
            const storageRef = ref(this.storage, `songs/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.error('Error uploading song:', error);
            throw error;
        }
    }
};

export default firebase;
