// Would You Rather Video Generator
class VideoGenerator {
    constructor() {
        // API Keys
        this.unsplashKey = '';
        this.elevenlabsKey = '';

        // Canvas setup
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 1080;
        this.height = 1920;

        // Assets
        this.assets = {
            background: null,
            option1Image: null,
            option2Image: null,
            voiceAudio: null,
            music: null,
            clockSound: null,
            dingSound: null,
            swooshSound: null
        };

        // Animation state
        this.animationFrame = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.currentTime = 0;

        // Video data
        this.videoData = {
            option1: '',
            option2: '',
            percentage1: 0,
            percentage2: 0
        };

        // Timeline (in seconds)
        this.timeline = {
            voiceStart: 0.5,
            option1Appear: 0.7,  // 200ms after voice starts
            option2Appear: null, // Will be calculated based on voice duration
            clockStart: null,
            dingStart: null,
            percentageReveal: null,
            swooshStart: null,
            totalDuration: 0
        };

        this.init();
    }

    init() {
        this.setupDOM();
        this.loadAPIKeys();
        this.loadRandomPrompts();
        this.drawInitialCanvas();
    }

    setupDOM() {
        // DOM elements
        this.option1Input = document.getElementById('option1Input');
        this.option2Input = document.getElementById('option2Input');
        this.unsplashKeyInput = document.getElementById('unsplashKeyInput');
        this.elevenlabsKeyInput = document.getElementById('elevenlabsKeyInput');
        this.voiceSelect = document.getElementById('voiceSelect');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.randomPromptBtn = document.getElementById('randomPromptBtn');
        this.statusPanel = document.getElementById('statusPanel');
        this.statusText = document.getElementById('statusText');
        this.progressFill = document.getElementById('progressFill');
        this.previewOverlay = document.getElementById('previewOverlay');

        // Event listeners
        this.generateBtn.addEventListener('click', () => this.generateVideo());
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.randomPromptBtn.addEventListener('click', () => this.loadRandomPrompts());

        this.unsplashKeyInput.addEventListener('change', () => this.saveAPIKeys());
        this.elevenlabsKeyInput.addEventListener('change', () => this.saveAPIKeys());
    }

    loadAPIKeys() {
        // Load from config file first
        if (typeof CONFIG !== 'undefined') {
            if (CONFIG.unsplashAccessKey && CONFIG.unsplashAccessKey !== 'YOUR_ACCESS_KEY_HERE') {
                this.unsplashKey = CONFIG.unsplashAccessKey;
                this.unsplashKeyInput.value = this.unsplashKey;
            }
            if (CONFIG.elevenlabsApiKey && CONFIG.elevenlabsApiKey !== 'YOUR_ELEVENLABS_KEY_HERE') {
                this.elevenlabsKey = CONFIG.elevenlabsApiKey;
                this.elevenlabsKeyInput.value = this.elevenlabsKey;
            }
        }

        // Load from localStorage
        const savedUnsplash = localStorage.getItem('unsplashApiKey');
        const savedElevenlabs = localStorage.getItem('elevenlabsApiKey');

        if (savedUnsplash) {
            this.unsplashKey = savedUnsplash;
            this.unsplashKeyInput.value = savedUnsplash;
        }

        if (savedElevenlabs) {
            this.elevenlabsKey = savedElevenlabs;
            this.elevenlabsKeyInput.value = savedElevenlabs;
        }
    }

    saveAPIKeys() {
        this.unsplashKey = this.unsplashKeyInput.value.trim();
        this.elevenlabsKey = this.elevenlabsKeyInput.value.trim();

        if (this.unsplashKey) localStorage.setItem('unsplashApiKey', this.unsplashKey);
        if (this.elevenlabsKey) localStorage.setItem('elevenlabsApiKey', this.elevenlabsKey);
    }

    loadRandomPrompts() {
        const prompts = [
            ['Pizza', 'Burger'],
            ['Coffee', 'Tea'],
            ['Beach', 'Mountains'],
            ['Summer', 'Winter'],
            ['Dog', 'Cat'],
            ['Books', 'Movies'],
            ['Morning', 'Night'],
            ['City', 'Countryside'],
            ['Swimming', 'Hiking'],
            ['Chocolate', 'Vanilla']
        ];

        const random = prompts[Math.floor(Math.random() * prompts.length)];
        this.option1Input.value = random[0];
        this.option2Input.value = random[1];
    }

    drawInitialCanvas() {
        // Draw black background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw centered text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Video Preview', this.width / 2, this.height / 2);

        this.ctx.font = '40px Arial';
        this.ctx.fillText('Click Generate to start', this.width / 2, this.height / 2 + 80);
    }

    updateStatus(message, progress = 0) {
        this.statusPanel.classList.remove('hidden');
        this.statusText.textContent = message;
        this.progressFill.style.width = `${progress}%`;
    }

    async generateVideo() {
        const option1 = this.option1Input.value.trim();
        const option2 = this.option2Input.value.trim();

        if (!option1 || !option2) {
            alert('Please enter both options');
            return;
        }

        if (!this.unsplashKey) {
            alert('Please enter your Unsplash API key');
            return;
        }

        if (!this.elevenlabsKey) {
            alert('Please enter your ElevenLabs API key');
            return;
        }

        this.generateBtn.disabled = true;
        this.previewOverlay.classList.add('hidden');

        try {
            this.videoData.option1 = option1;
            this.videoData.option2 = option2;

            // Generate random percentages
            this.videoData.percentage1 = Math.floor(Math.random() * 40) + 30; // 30-70
            this.videoData.percentage2 = 100 - this.videoData.percentage1;

            // Step 1: Fetch images
            this.updateStatus('🖼️ Fetching images from Unsplash...', 10);
            await this.fetchImages(option1, option2);

            // Step 2: Generate voice
            this.updateStatus('🎤 Generating voice with ElevenLabs...', 40);
            await this.generateVoice(option1, option2);

            // Step 3: Load audio assets
            this.updateStatus('🔊 Loading audio assets...', 60);
            await this.loadAudioAssets();

            // Step 4: Calculate timeline
            this.updateStatus('⏱️ Building timeline...', 80);
            this.calculateTimeline();

            // Step 5: Ready to play
            this.updateStatus('✅ Video ready!', 100);

            this.playBtn.disabled = false;
            this.pauseBtn.disabled = false;
            this.restartBtn.disabled = false;
            this.downloadBtn.disabled = false;

            setTimeout(() => {
                this.statusPanel.classList.add('hidden');
            }, 2000);

        } catch (error) {
            console.error('Generation error:', error);
            this.updateStatus('❌ Error: ' + error.message, 0);
            alert('Error generating video: ' + error.message);
        } finally {
            this.generateBtn.disabled = false;
        }
    }

    async fetchImages(option1, option2) {
        // Check if user has selected images from Image Finder
        const selectedImages = localStorage.getItem('videoGeneratorImages');
        let img1Url, img2Url;

        if (selectedImages) {
            try {
                const parsed = JSON.parse(selectedImages);
                if (parsed.option1 && parsed.option2) {
                    // Use selected images
                    img1Url = parsed.option1.url;
                    img2Url = parsed.option2.url;
                    console.log('Using images from Image Finder');
                } else {
                    // Auto-fetch if not enough images selected
                    throw new Error('Not enough images selected');
                }
            } catch (e) {
                // Fall back to auto-fetch
                console.log('Falling back to auto-fetch');
                [img1Url, img2Url] = await this.autoFetchImages(option1, option2);
            }
        } else {
            // Auto-fetch images
            [img1Url, img2Url] = await this.autoFetchImages(option1, option2);
        }

        // Load images
        this.assets.option1Image = await this.loadImage(img1Url);
        this.assets.option2Image = await this.loadImage(img2Url);
    }

    async autoFetchImages(option1, option2) {
        const fetchImage = async (query) => {
            const url = new URL('https://api.unsplash.com/search/photos');
            url.searchParams.append('query', query);
            url.searchParams.append('per_page', 1);
            url.searchParams.append('orientation', 'squarish');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${this.unsplashKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch image for "${query}"`);
            }

            const data = await response.json();

            if (data.results.length === 0) {
                throw new Error(`No images found for "${query}"`);
            }

            return data.results[0].urls.regular;
        };

        // Fetch both images
        return await Promise.all([
            fetchImage(option1),
            fetchImage(option2)
        ]);
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }

    async generateVoice(option1, option2) {
        const text = `${option1} or ${option2}?`;
        const voiceId = this.voiceSelect.value;

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': this.elevenlabsKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate voice');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        this.assets.voiceAudio = new Audio(audioUrl);

        // Wait for metadata to load to get duration
        await new Promise((resolve) => {
            this.assets.voiceAudio.addEventListener('loadedmetadata', resolve);
        });
    }

    async loadAudioAssets() {
        // For now, create silent audio or use placeholder
        // In production, user should provide these files
        this.assets.music = null; // User should add music.mp3
        this.assets.clockSound = null; // User should add clock.mp3
        this.assets.dingSound = null; // User should add ding.mp3
        this.assets.swooshSound = null; // User should add swoosh.mp3
    }

    calculateTimeline() {
        const voiceDuration = this.assets.voiceAudio.duration;

        // Calculate when each element appears
        this.timeline.voiceStart = 0.5;
        this.timeline.option1Appear = this.timeline.voiceStart + 0.2; // 200ms after voice

        // Option 2 appears mid-way through voice (when "or" is said)
        this.timeline.option2Appear = this.timeline.voiceStart + (voiceDuration / 2);

        // Clock starts 0.5s after voice ends
        this.timeline.clockStart = this.timeline.voiceStart + voiceDuration + 0.5;

        // Ding after 3 seconds of clock
        this.timeline.dingStart = this.timeline.clockStart + 3.0;

        // Percentages revealed with ding
        this.timeline.percentageReveal = this.timeline.dingStart;

        // Swoosh 2 seconds after ding
        this.timeline.swooshStart = this.timeline.dingStart + 2.0;

        // Total duration
        this.timeline.totalDuration = this.timeline.swooshStart + 1.0;
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.startTime = Date.now() - (this.currentTime * 1000);
        this.animate();

        // Play voice at correct time
        if (this.assets.voiceAudio) {
            const timeUntilVoice = Math.max(0, this.timeline.voiceStart - this.currentTime);
            setTimeout(() => {
                if (this.isPlaying) {
                    this.assets.voiceAudio.currentTime = Math.max(0, this.currentTime - this.timeline.voiceStart);
                    this.assets.voiceAudio.play();
                }
            }, timeUntilVoice * 1000);
        }
    }

    pause() {
        this.isPlaying = false;
        if (this.assets.voiceAudio) {
            this.assets.voiceAudio.pause();
        }
        cancelAnimationFrame(this.animationFrame);
    }

    restart() {
        this.pause();
        this.currentTime = 0;
        if (this.assets.voiceAudio) {
            this.assets.voiceAudio.currentTime = 0;
        }
        this.renderFrame(0);
        this.play();
    }

    animate() {
        if (!this.isPlaying) return;

        this.currentTime = (Date.now() - this.startTime) / 1000;

        if (this.currentTime >= this.timeline.totalDuration) {
            this.pause();
            this.currentTime = 0;
            return;
        }

        this.renderFrame(this.currentTime);
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    renderFrame(time) {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw background if loaded
        if (this.assets.background) {
            this.ctx.drawImage(this.assets.background, 0, 0, this.width, this.height);
        }

        // Draw option 1 (top) with animation
        if (time >= this.timeline.option1Appear) {
            const elapsed = time - this.timeline.option1Appear;
            const progress = Math.min(elapsed / 0.5, 1); // 0.5s animation

            this.drawOption(
                this.assets.option1Image,
                this.videoData.option1,
                this.videoData.percentage1,
                'top',
                progress,
                'left',
                time >= this.timeline.percentageReveal
            );
        }

        // Draw option 2 (bottom) with animation
        if (time >= this.timeline.option2Appear) {
            const elapsed = time - this.timeline.option2Appear;
            const progress = Math.min(elapsed / 0.5, 1);

            this.drawOption(
                this.assets.option2Image,
                this.videoData.option2,
                this.videoData.percentage2,
                'bottom',
                progress,
                'right',
                time >= this.timeline.percentageReveal
            );
        }
    }

    drawOption(image, text, percentage, position, progress, slideFrom, showPercentage) {
        const y = position === 'top' ? 300 : 1300;
        const imageSize = 400;
        const imageX = (this.width - imageSize) / 2;

        // Apply slide animation
        this.ctx.save();

        if (progress < 1) {
            const slideDistance = 200;
            const offset = slideFrom === 'left'
                ? -slideDistance * (1 - progress)
                : slideDistance * (1 - progress);
            this.ctx.translate(offset, 0);
            this.ctx.globalAlpha = progress;
        }

        // Draw image with rounded corners
        if (image) {
            this.drawRoundedImage(image, imageX, y, imageSize, imageSize, 20);
        }

        // Draw text with stroke
        const textY = y + imageSize + 80;
        this.drawStrokedText(text, this.width / 2, textY, 'bold 70px Arial', '#fff', '#000', 8);

        // Draw percentage if revealed
        if (showPercentage) {
            const color = percentage >= 50 ? '#10b981' : '#ef4444';
            const percentY = textY + 100;
            this.drawStrokedText(
                `${percentage}%`,
                this.width / 2,
                percentY,
                'bold 90px Arial',
                color,
                '#000',
                10
            );
        }

        this.ctx.restore();
    }

    drawRoundedImage(image, x, y, width, height, radius) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.clip();
        this.ctx.drawImage(image, x, y, width, height);
        this.ctx.restore();
    }

    drawStrokedText(text, x, y, font, fillColor, strokeColor, strokeWidth) {
        this.ctx.font = font;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Draw stroke
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeText(text, x, y);

        // Draw fill
        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
    }

    async downloadVideo() {
        alert('Video download functionality requires a backend server for proper video encoding. For now, you can screen record the preview!');
        // In a full implementation, this would use MediaRecorder API or server-side rendering
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new VideoGenerator();
});
