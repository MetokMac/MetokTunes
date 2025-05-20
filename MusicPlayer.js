class MusicPlayer {
    static instance = null;

    static getInstance() {
        if (!MusicPlayer.instance) {
            MusicPlayer.instance = new MusicPlayer();
        }
        return MusicPlayer.instance;
    }

    constructor() {
        if (MusicPlayer.instance) {
            throw new Error('MusicPlayer is a singleton. Use getInstance()');
        }
        this.currentSongIndex = 0;
        this.songs = [];
        this.audio = new Audio();
        this.isPlaying = false;
        this.volume = 0.5;
        this.isMuted = false;
        this.currentPlaylist = [];
        this.currentSeed = null;
        this.likedSongs = [];
        this.shuffle = false;
        this.repeat = false;
        this.waveformElements = [];
        this.spectrumCanvas = null;
        this.spectrumCtx = null;
        this.audioContext = null;
        this.analyser = null;
        this.initializePlayer();
    }

    async initializePlayer() {
        try {
            // Fetch songs
            this.songs = await firebase.fetchSongs();
            if (this.songs.length === 0) {
                throw new Error('No songs found');
            }

            // Create player UI
            this.createPlayerUI();
            
            // Initialize audio context for visual effects
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.7;

            // Create waveform elements
            this.waveformElements = document.querySelectorAll('.wave');
            this.waveformElements.forEach((wave, index) => {
                wave.style.animationDelay = `-${index * 0.1}s`;
            });

            // Set up spectrum canvas
            this.spectrumCanvas = document.createElement('canvas');
            this.spectrumCanvas.width = 200;
            this.spectrumCanvas.height = 200;
            this.spectrumCtx = this.spectrumCanvas.getContext('2d');
            document.querySelector('.radio-effects').appendChild(this.spectrumCanvas);

            // Add event listeners
            this.addEventListeners();

            // Load saved liked songs
            this.loadLikedSongs();

            // Start with random seed
            this.setRandomSeed();
        } catch (error) {
            console.error('Error initializing player:', error);
            this.showError('Failed to load songs');
        }
    }

    createPlayerUI() {
        const playerHTML = `
            <div class="music-player">
                <div class="current-mix">
                    <div class="mix-info">
                        <i class="fas fa-music"></i>
                        <span id="mix-name">Your Mix</span>
                        <span id="mix-seed">Based on your taste</span>
                    </div>
                    <div class="mix-controls">
                        <button id="like-btn" class="like-btn"><i class="far fa-thumbs-up"></i></button>
                        <button id="dislike-btn" class="dislike-btn"><i class="far fa-thumbs-down"></i></button>
                        <button id="liked-songs-btn" class="liked-songs-btn"><i class="fas fa-heart"></i></button>
                    </div>
                </div>
                <div class="current-song">
                    <img id="song-image" src="" alt="Current Song">
                    <div class="current-song-info">
                        <h3 id="song-title">Loading...</h3>
                        <p id="song-artist">Loading...</p>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-inner"></div>
                </div>
                <div class="music-controls">
                    <button id="prev-btn"><i class="fas fa-backward"></i></button>
                    <button id="play-btn"><i class="fas fa-play"></i></button>
                    <button id="next-btn"><i class="fas fa-forward"></i></button>
                    <button id="volume-btn"><i class="fas fa-volume-up"></i></button>
                </div>
                <div class="volume-controls">
                    <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="0.5">
                </div>
            </div>
            <div id="liked-songs-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Liked Songs</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="liked-songs-list">
                        <div class="no-liked-songs">
                            <i class="fas fa-heart-broken"></i>
                            <p>No songs liked yet</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', playerHTML);
    }

    addEventListeners() {
        const playBtn = document.getElementById('play-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const volumeBtn = document.getElementById('volume-btn');
        const volumeSlider = document.getElementById('volume-slider');
        const likeBtn = document.getElementById('like-btn');
        const dislikeBtn = document.getElementById('dislike-btn');
        const likedSongsBtn = document.getElementById('liked-songs-btn');
        const playButton = document.getElementById('play-button');
        const modal = document.getElementById('liked-songs-modal');
        const closeBtn = modal.querySelector('.close-btn');
        const shuffleBtn = document.querySelector('.shuffle-btn');
        const repeatBtn = document.querySelector('.repeat-btn');

        playBtn.addEventListener('click', () => this.togglePlay());
        prevBtn.addEventListener('click', () => this.playPrevious());
        nextBtn.addEventListener('click', () => this.playNext());
        volumeBtn.addEventListener('click', () => this.toggleMute());
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        likeBtn.addEventListener('click', () => this.likeCurrentSong());
        dislikeBtn.addEventListener('click', () => this.dislikeCurrentSong());
        likedSongsBtn.addEventListener('click', () => this.toggleLikedSongsModal());
        closeBtn.addEventListener('click', () => this.toggleLikedSongsModal());
        shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.toggleLikedSongsModal();
            }
        });

        playButton.addEventListener('click', () => this.startMusicMix());
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i>';
            this.stopAudioVisualization();
        } else {
            this.audio.play();
            document.getElementById('play-btn').innerHTML = '<i class="fas fa-pause"></i>';
            this.startAudioVisualization();
        }
        this.isPlaying = !this.isPlaying;
    }

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        const shuffleBtn = document.querySelector('.shuffle-btn');
        if (this.shuffle) {
            shuffleBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            shuffleBtn.style.color = 'white';
        } else {
            shuffleBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            shuffleBtn.style.color = 'white';
        }
    }

    toggleRepeat() {
        this.repeat = !this.repeat;
        const repeatBtn = document.querySelector('.repeat-btn');
        if (this.repeat) {
            repeatBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            repeatBtn.style.color = 'white';
        } else {
            repeatBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            repeatBtn.style.color = 'white';
        }
    }

    startAudioVisualization() {
        if (!this.audioContext) return;

        // Connect audio nodes
        const source = this.audioContext.createMediaElementSource(this.audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Start spectrum visualization
        this.drawSpectrum();

        // Start waveform animation
        this.animateWaveform();
    }

    stopAudioVisualization() {
        if (!this.audioContext) return;

        // Clear animations
        cancelAnimationFrame(this.spectrumAnimationId);
        cancelAnimationFrame(this.waveformAnimationId);

        // Reset elements
        this.spectrumCtx.clearRect(0, 0, this.spectrumCanvas.width, this.spectrumCanvas.height);
        this.waveformElements.forEach(wave => {
            wave.style.height = '100%';
        });
    }

    drawSpectrum() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const width = this.spectrumCanvas.width;
        const height = this.spectrumCanvas.height;

        this.spectrumCtx.clearRect(0, 0, width, height);
        this.analyser.getByteFrequencyData(dataArray);

        this.spectrumCtx.beginPath();
        this.spectrumCtx.moveTo(0, height);

        const sliceWidth = width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height;

            if (i === 0) {
                this.spectrumCtx.moveTo(x, y);
            } else {
                this.spectrumCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.spectrumCtx.lineTo(width, height);
        this.spectrumCtx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
        this.spectrumCtx.stroke();

        this.spectrumAnimationId = requestAnimationFrame(() => this.drawSpectrum());
    }

    animateWaveform() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);

        this.waveformElements.forEach((wave, index) => {
            const average = dataArray[index * 10];
            const height = Math.max(10, average / 256 * 100);
            wave.style.height = `${height}%`;
        });

        this.waveformAnimationId = requestAnimationFrame(() => this.animateWaveform());
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        const volumeBtn = document.getElementById('volume-btn');
        volumeBtn.innerHTML = this.isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    }

    setVolume(value) {
        this.volume = parseFloat(value);
        this.audio.volume = this.volume;
    }

    playNext() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.currentPlaylist.length;
        this.playSong(this.currentSongIndex);
    }

    playPrevious() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.currentPlaylist.length) % this.currentPlaylist.length;
        this.playSong(this.currentSongIndex);
    }

    handleTouch(e) {
        const touch = e.touches[0];
        const volumeSlider = document.getElementById('volume-slider');
        if (touch) {
            const rect = volumeSlider.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const width = rect.width;
            const value = x / width;
            this.setVolume(value);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
}
