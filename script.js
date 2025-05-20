// Remove ES module import
// MusicPlayer is now available through window.MusicPlayer
import firebase from './firebase.js';
import './withdraw.js';
import './donation.js';

// Register Service Worker
if ('serviceWorker' in navigator) {
    try {
        navigator.serviceWorker.register('/sw.js').then(() => {
            console.log('Service Worker registered successfully');
        });
    } catch (error) {
        console.error('Service Worker registration failed:', error);
    }
}

// Initialize Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "metoktunes.firebaseapp.com",
    projectId: "metoktunes",
    storageBucket: "metoktunes.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Token conversion rates (100,000 tokens = $0.10)
const TOKEN_CONVERSION_RATES = {
    '0.10': 100000,  // 100,000 tokens = $0.10
    '0.30': 300000,  // 300,000 tokens = $0.30
    '0.50': 500000,  // 500,000 tokens = $0.50
    '1.00': 1000000, // 1,000,000 tokens = $1.00
    '5.00': 5000000  // 5,000,000 tokens = $5.00
};

firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore
const db = firebase.firestore();

// DOM Elements
const loginForm = document.getElementById('login-form');
const guestLogin = document.getElementById('guest-login');
const loginScreen = document.getElementById('login-screen');

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // For testing, accept any credentials
        if (email && password) {
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                email: email,
                isGuest: false,
                timestamp: Date.now()
            }));
            
            // Initialize user balance
            await firebase.initializeUserBalance(email);
            
            // Hide login screen
            loginScreen.style.display = 'none';
            
            // Show main content
            showMainContent();
        } else {
            alert('Please enter both email and password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Handle guest login
guestLogin.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Store guest user info in localStorage
    localStorage.setItem('user', JSON.stringify({
        email: 'guest@metoktunes.com',
        isGuest: true,
        timestamp: Date.now()
    }));
    
    // Hide login screen
    loginScreen.style.display = 'none';
    
    // Show main content
    showMainContent();
});

// Show main content
function showMainContent() {
    // Hide login screen
    loginScreen.style.display = 'none';
    // Show main content
    const mainContent = document.querySelector('body > :not(#login-screen)');
    if (mainContent) {
        mainContent.style.display = 'block';
        
        // Initialize music player
        initializeMusicPlayer();
        
        // Load user balance
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && !user.isGuest) {
            firebase.loadUserBalance(user.email);
        }
    }
}

// Initialize music player
function initializeMusicPlayer() {
    // Add your music player initialization code here
    console.log('Music player initialized');
}

// Initialize notifications
function initializeNotifications() {
    // Add your notifications initialization code here
    console.log('Notifications initialized');
}

// Initialize other features
function initializeFeatures() {
    // Add initialization for other features here
    console.log('Features initialized');
}

// Check if user is logged in
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // Hide main content
        const mainContent = document.querySelector('body > :not(#login-screen)');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        // Show login screen
        loginScreen.style.display = 'block';
        // Remove any existing logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    } else {
        showMainContent();
        // Add logout button if not already present
        const logoutBtn = document.getElementById('logout-btn');
        if (!logoutBtn) {
            const nav = document.querySelector('nav');
            if (nav) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logout-btn';
                logoutBtn.textContent = 'Logout';
                logoutBtn.style.cssText = 'margin-left: auto; padding: 8px 16px; background-color: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;';
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    localStorage.removeItem('user');
                    checkLoginStatus();
                });
                nav.appendChild(logoutBtn);
            }
        }
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded event triggered');

    // Initialize Firebase
    firebase.initialize();

    // Initialize music player
    const player = window.MusicPlayer.getInstance();

    // Initialize PayPal
    paypal.Buttons({
        style: {
            layout: 'horizontal',
            color: 'blue',
            shape: 'rect',
            label: 'pay'
        }
    }).render('#paypal-button-container');

    // Debug: Confirm Firebase initialization
    console.log('Firebase initialized:', { app, db, auth, storage });

    // Initialize app
    initializeMusicPlayer();
    initializeNotifications();
    initializeFeatures();

    // Fetch recommended songs
    fetchRecommendedSongs();

    // Add event listeners for search functionality
    setupSearchListeners();

    // Add click handlers for navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Handle navigation here - for now just log the click
            console.log('Navigating to:', item.textContent);
        });
    });
});

// Fetch recommended songs
async function fetchRecommendedSongs() {
    try {
        console.log('🎵 Starting fetchRecommendedSongs...');
        
        // Get songs collection
        const songsRef = collection(db, 'songs');
        console.log('📚 Songs collection reference:', songsRef);
        
        // Create query
        const q = query(songsRef);
        console.log('🔍 Query created:', q);
        
        // Execute query
        const querySnapshot = await getDocs(q);
        console.log('📊 Query snapshot:', querySnapshot);
        
        // Log number of documents found
        console.log(`📊 Found ${querySnapshot.size} songs in database`);
        
        // Get the recommended songs container
        const recommendedSongsDiv = document.getElementById('recommended-songs');
        if (!recommendedSongsDiv) {
            console.error('❌ Could not find recommended-songs container');
            return;
        }
        
        // Clear existing recommendations
        recommendedSongsDiv.innerHTML = '';
        console.log('🧹 Cleared existing recommendations');

        // Process each song
        for (const doc of querySnapshot.docs) {
            const songData = doc.data();
            console.log('🎵 Processing song:', songData.title);
            
            // Special logging for Heaven Sent
            if (songData.title === 'Heaven Sent') {
                console.log('🎵 Special logging for Heaven Sent:');
                console.log('🎵 Heaven Sent storage path:', songData.storagePath);
                console.log('🎵 Heaven Sent data:', songData);
            }
            
            // Get audio URL
            const audioUrl = await getAudioUrl(songData.storagePath);
            
            // Special logging for Heaven Sent
            if (songData.title === 'Heaven Sent') {
                console.log('🎵 Heaven Sent audio URL result:', audioUrl);
            }
            
            // Create song item
            const songItem = document.createElement('div');
            songItem.innerHTML = `
                <strong>${songData.title}</strong> by ${songData.artist}
                ${audioUrl ? `
                    <audio controls>
                        <source src="${audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                ` : 'No audio available'}
            `;
            
            // Add to container
            recommendedSongsDiv.appendChild(songItem);
            console.log('🎵 Added song to container');
        }
        
        console.log('✅ Finished fetching and displaying recommended songs');
    } catch (error) {
        console.error('❌ Error in fetchRecommendedSongs:', error);
    }
}

// Search songs function
async function searchSongs(searchTerm) {
    try {
        console.log(`🔍 Searching for: ${searchTerm}`);
        
        const songsRef = collection(db, 'songs');
        const querySnapshot = await getDocs(songsRef);

        const searchResultsDiv = document.getElementById('search-results');
        if (!searchResultsDiv) {
            console.error('Search results div not found');
            return;
        }

        searchResultsDiv.innerHTML = ''; // Clear previous results

        if (!searchTerm) {
            searchResultsDiv.innerHTML = 'Please enter a search term';
            return;
        }

        const lowercaseSearchTerm = searchTerm.toLowerCase();
        const matchingSongs = querySnapshot.docs.filter(doc => {
            const songData = doc.data();
            return (
                songData.title.toLowerCase().includes(lowercaseSearchTerm) ||
                songData.artist.toLowerCase().includes(lowercaseSearchTerm) ||
                songData.genre.toLowerCase().includes(lowercaseSearchTerm)
            );
        });

        if (matchingSongs.length === 0) {
            searchResultsDiv.innerHTML = 'No songs found';
            return;
        }

        for (const doc of matchingSongs) {
            const songData = doc.data();
            const audioUrl = await getAudioUrl(songData.storagePath);
            
            const songItem = document.createElement('div');
            songItem.classList.add('search-result-item');
            songItem.innerHTML = `
                <strong>${songData.title}</strong> by ${songData.artist} 
                (Genre: ${songData.genre})
                ${audioUrl ? `
                    <audio controls>
                        <source src="${audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                ` : 'No audio available'}
            `;
            searchResultsDiv.appendChild(songItem);
        }

        console.log(`Found ${matchingSongs.length} matching songs`);
    } catch (error) {
        console.error('Error searching songs:', error);
        const searchResultsDiv = document.getElementById('search-results');
        if (searchResultsDiv) {
            searchResultsDiv.innerHTML = 'An error occurred while searching';
        }
    }
}

// Update currently playing song
function updateCurrentSong(song) {
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;
    currentSongArtist.dataset.artistId = song.artistId;
    currentSongArtist.addEventListener('click', () => {
        navigateToArtistProfile(song.artistId);
    });
}

// Navigate to artist profile
function navigateToArtistProfile(artistId) {
    // Get artist data from Firebase
    const artistRef = doc(firebase.db, 'users', artistId);
    getDoc(artistRef).then((doc) => {
        if (doc.exists()) {
            const artistData = doc.data();
            if (artistData.artistProfile) {
                // Store artist data in localStorage
                localStorage.setItem('artistProfile', JSON.stringify(artistData));
                // Navigate to artist page
                window.location.href = 'artist.html';
            } else {
                alert('This artist profile is not available.');
            }
        } else {
            alert('Artist not found.');
        }
    }).catch((error) => {
        console.error('Error getting artist data:', error);
        alert('Error loading artist profile.');
    });
}

// Add event listeners for search functionality
function setupSearchListeners() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            searchSongs(searchTerm);
        });

        // Optional: Add real-time search as user types
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length > 2) {  // Start searching after 3 characters
                searchSongs(searchTerm);
            }
        });
    }
}
