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
            music: null,
            clockSound: null,
            dingSound: null,
            swooshSound: null,
            questions: [] // Array of 3 questions, each with images, voice, data
        };

        // Animation state
        this.animationFrame = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.currentTime = 0;
        this.currentQuestionIndex = 0; // Which question is currently playing (0-2)

        // Timeline (in seconds) - for all 3 questions
        this.timeline = {
            questions: [], // Array of 3 question timelines
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

        // Engagement checkboxes
        this.commentEngagement = document.getElementById('commentEngagement');
        this.followEngagement = document.getElementById('followEngagement');
        this.shareEngagement = document.getElementById('shareEngagement');
        this.likeEngagement = document.getElementById('likeEngagement');

        // Advanced prompts
        this.advancedPrompts = document.getElementById('advancedPrompts');

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

    generateRandomQuestions(baseOption1, baseOption2) {
        // Check if there are custom prompts
        const customPromptsText = this.advancedPrompts.value.trim();
        let allPrompts = [
            ['Pizza', 'Burger'],
            ['Coffee', 'Tea'],
            ['Beach', 'Mountains'],
            ['Summer', 'Winter'],
            ['Dog', 'Cat'],
            ['Books', 'Movies'],
            ['Morning', 'Night'],
            ['City', 'Countryside'],
            ['Swimming', 'Hiking'],
            ['Chocolate', 'Vanilla'],
            ['Flying', 'Invisibility'],
            ['Past', 'Future'],
            ['Rich', 'Famous'],
            ['Hot', 'Cold'],
            ['Sweet', 'Salty']
        ];

        // Parse custom prompts if provided
        if (customPromptsText) {
            const customLines = customPromptsText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const customPrompts = customLines.map(line => {
                const parts = line.split(/\s+vs\s+|\s+or\s+/i);
                if (parts.length === 2) {
                    return [parts[0].trim(), parts[1].trim()];
                }
                return null;
            }).filter(p => p !== null);

            if (customPrompts.length > 0) {
                allPrompts = [...customPrompts, ...allPrompts];
            }
        }

        // First question is always the user's input
        const questions = [
            { option1: baseOption1, option2: baseOption2 }
        ];

        // Pick 2 more random questions that are different from the first
        const availablePrompts = allPrompts.filter(p =>
            p[0] !== baseOption1 && p[1] !== baseOption2
        );

        // Shuffle and pick 2
        for (let i = 0; i < 2 && i < availablePrompts.length; i++) {
            const randomIndex = Math.floor(Math.random() * availablePrompts.length);
            const [opt1, opt2] = availablePrompts.splice(randomIndex, 1)[0];
            questions.push({ option1: opt1, option2: opt2 });
        }

        return questions;
    }

    async fetchQuestionImages(option1, option2) {
        // Fetch images for a specific question
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

        // Fetch both images automatically
        const [img1Url, img2Url] = await Promise.all([
            fetchImage(option1),
            fetchImage(option2)
        ]);

        // Load images
        const img1 = await this.loadImage(img1Url);
        const img2 = await this.loadImage(img2Url);

        return [img1, img2];
    }

    async generateQuestionVoice(option1, option2) {
        const text = `${option1} or ${option2}?`;
        const voiceId = this.voiceSelect.value;

        console.log(`🎤 Generating voice for: "${text}"`);

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenlabsKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_turbo_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ ElevenLabs API Error:', response.status, errorText);
                throw new Error(`Failed to generate voice for "${text}" (${response.status}): ${errorText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const voiceAudio = new Audio(audioUrl);

            // Wait for metadata to load to get duration
            await new Promise((resolve, reject) => {
                voiceAudio.addEventListener('loadedmetadata', () => {
                    console.log(`✅ Voice generated: "${text}" (${voiceAudio.duration.toFixed(2)}s)`);
                    resolve();
                });
                voiceAudio.addEventListener('error', (e) => {
                    console.error(`❌ Audio load error for "${text}":`, e);
                    reject(new Error(`Failed to load audio for "${text}"`));
                });
            });

            return voiceAudio;
        } catch (error) {
            console.error(`❌ Error generating voice for "${text}":`, error);
            throw error;
        }
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
            // Get engagement settings
            const engagementSettings = {
                comment: this.commentEngagement.checked,
                follow: this.followEngagement.checked,
                share: this.shareEngagement.checked,
                like: this.likeEngagement.checked
            };
            console.log('📊 Engagement settings:', engagementSettings);

            // Generate 3 random question pairs
            const allQuestions = this.generateRandomQuestions(option1, option2);
            console.log('🎯 Generated 3 questions:', allQuestions);

            // Step 1: Load background image
            this.updateStatus('🎨 Loading background...', 3);
            await this.loadBackgroundImage();

            // Step 2: Load audio assets
            this.updateStatus('🔊 Loading audio assets...', 8);
            await this.loadAudioAssets();

            // Step 3-5: Generate all 3 questions
            this.assets.questions = [];

            for (let i = 0; i < 3; i++) {
                const question = allQuestions[i];
                const progress = 10 + (i * 30); // 10%, 40%, 70%

                console.log(`\n🎬 === Processing Question ${i + 1}/3 ===`);
                console.log(`   Options: "${question.option1}" vs "${question.option2}"`);
                this.updateStatus(`🎬 Generating question ${i + 1}/3...`, progress);

                // Fetch images
                this.updateStatus(`🖼️ Fetching images ${i + 1}/3...`, progress + 5);
                console.log(`   📸 Fetching images...`);
                const [img1, img2] = await this.fetchQuestionImages(question.option1, question.option2);
                console.log(`   ✅ Images fetched`);

                // Generate voice
                this.updateStatus(`🎤 Generating voice ${i + 1}/3...`, progress + 15);
                console.log(`   🎤 Generating voice...`);
                const voice = await this.generateQuestionVoice(question.option1, question.option2);
                console.log(`   ✅ Voice generated`);

                // Generate percentages
                const percentage1 = Math.floor(Math.random() * 40) + 30; // 30-70
                const percentage2 = 100 - percentage1;

                this.assets.questions.push({
                    option1: question.option1,
                    option2: question.option2,
                    image1: img1,
                    image2: img2,
                    voice: voice,
                    percentage1: percentage1,
                    percentage2: percentage2
                });

                console.log(`   ✅ Question ${i + 1} complete! (${percentage1}% vs ${percentage2}%)`);
            }

            console.log('\n✨ All 3 questions generated successfully!');

            // Step 6: Calculate timeline
            this.updateStatus('⏱️ Building timeline...', 95);
            this.calculateTimeline();

            // Step 7: Ready to play
            this.updateStatus('✅ Video ready! (3 questions)', 100);

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

    async loadBackgroundImage() {
        try {
            // Load local image without CORS
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log('✅ Background image loaded successfully');
                    resolve();
                };
                img.onerror = (e) => {
                    console.error('❌ Background image failed to load:', e);
                    reject(new Error('Failed to load background'));
                };
                img.src = '../assets/images/or.png';
            });
            this.assets.background = img;
        } catch (error) {
            console.warn('Background image not found, using solid color:', error.message);
            this.assets.background = null;
        }
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

    async loadAudioAssets() {
        // Load audio files from assets folder
        try {
            // Load music
            this.assets.music = new Audio('../assets/audio/music.mp3');
            await this.waitForAudioLoad(this.assets.music);

            // Load clock sound
            this.assets.clockSound = new Audio('../assets/audio/clock.mp3');
            await this.waitForAudioLoad(this.assets.clockSound);

            // Load ding sound
            this.assets.dingSound = new Audio('../assets/audio/ding.mp3');
            await this.waitForAudioLoad(this.assets.dingSound);

            // Load swoosh sound
            this.assets.swooshSound = new Audio('../assets/audio/swoosh.mp3');
            await this.waitForAudioLoad(this.assets.swooshSound);

            console.log('All audio assets loaded successfully');
        } catch (error) {
            console.warn('Some audio files could not be loaded:', error.message);
            console.log('Video will continue without background audio');
            // Continue without audio - not critical for preview
        }
    }

    waitForAudioLoad(audio) {
        return new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve, { once: true });
            audio.addEventListener('error', () => {
                reject(new Error(`Failed to load ${audio.src}`));
            }, { once: true });
            audio.load();
        });
    }

    calculateTimeline() {
        // Build timeline for all 3 questions
        this.timeline.questions = [];
        let currentTime = 0;

        for (let i = 0; i < this.assets.questions.length; i++) {
            const question = this.assets.questions[i];
            const voiceDuration = question.voice.duration;

            const questionTimeline = {
                startTime: currentTime,
                voiceStart: currentTime + 0.5,
                option1Appear: currentTime + 0.5 + 0.2, // 200ms after voice
                option2Appear: currentTime + 0.5 + (voiceDuration / 2), // Mid-way through voice
                clockStart: currentTime + 0.5 + voiceDuration + 0.5,
                dingStart: currentTime + 0.5 + voiceDuration + 0.5 + 3.0,
                percentageReveal: currentTime + 0.5 + voiceDuration + 0.5 + 3.0,
                swooshStart: currentTime + 0.5 + voiceDuration + 0.5 + 3.0 + 2.0,
                endTime: currentTime + 0.5 + voiceDuration + 0.5 + 3.0 + 2.0 + 1.0
            };

            this.timeline.questions.push(questionTimeline);

            // Next question starts after swoosh completes
            currentTime = questionTimeline.endTime;
        }

        // Total duration is when the last question ends
        this.timeline.totalDuration = currentTime;
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.startTime = Date.now() - (this.currentTime * 1000);
        this.animate();

        // Play background music (loops)
        if (this.assets.music && this.currentTime < this.timeline.totalDuration) {
            this.assets.music.loop = true;
            this.assets.music.volume = 0.3; // Background volume
            this.assets.music.play();
        }

        // Schedule audio for all 3 questions
        for (let i = 0; i < this.timeline.questions.length; i++) {
            const qt = this.timeline.questions[i];
            const question = this.assets.questions[i];

            // Play voice at correct time
            if (question.voice && this.currentTime < qt.voiceStart + question.voice.duration) {
                const timeUntilVoice = Math.max(0, qt.voiceStart - this.currentTime);
                setTimeout(() => {
                    if (this.isPlaying) {
                        question.voice.currentTime = Math.max(0, this.currentTime - qt.voiceStart);
                        question.voice.play().catch(e => console.log('Voice play error:', e));
                    }
                }, timeUntilVoice * 1000);
            }

            // Play clock sound at correct time
            if (this.assets.clockSound && this.currentTime < qt.clockStart + 3) {
                const timeUntilClock = Math.max(0, qt.clockStart - this.currentTime);
                setTimeout(() => {
                    if (this.isPlaying) {
                        const clockClone = this.assets.clockSound.cloneNode();
                        clockClone.play().catch(e => console.log('Clock play error:', e));
                    }
                }, timeUntilClock * 1000);
            }

            // Play ding sound at correct time
            if (this.assets.dingSound && this.currentTime < qt.dingStart + 0.5) {
                const timeUntilDing = Math.max(0, qt.dingStart - this.currentTime);
                setTimeout(() => {
                    if (this.isPlaying) {
                        const dingClone = this.assets.dingSound.cloneNode();
                        dingClone.play().catch(e => console.log('Ding play error:', e));
                    }
                }, timeUntilDing * 1000);
            }

            // Play swoosh sound at correct time
            if (this.assets.swooshSound && this.currentTime < qt.swooshStart + 1) {
                const timeUntilSwoosh = Math.max(0, qt.swooshStart - this.currentTime);
                setTimeout(() => {
                    if (this.isPlaying) {
                        const swooshClone = this.assets.swooshSound.cloneNode();
                        swooshClone.play().catch(e => console.log('Swoosh play error:', e));
                    }
                }, timeUntilSwoosh * 1000);
            }
        }
    }

    pause() {
        this.isPlaying = false;

        // Pause background music
        if (this.assets.music) this.assets.music.pause();

        // Pause all question voices
        for (const question of this.assets.questions) {
            if (question.voice) question.voice.pause();
        }

        // Note: Sound effects (clock, ding, swoosh) are cloned and short-lived,
        // so we don't need to pause them

        cancelAnimationFrame(this.animationFrame);
    }

    restart() {
        this.pause();
        this.currentTime = 0;

        // Reset background music
        if (this.assets.music) this.assets.music.currentTime = 0;

        // Reset all question voices
        for (const question of this.assets.questions) {
            if (question.voice) question.voice.currentTime = 0;
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
        // Draw background image (stretched to 9:16)
        if (this.assets.background) {
            this.ctx.drawImage(this.assets.background, 0, 0, this.width, this.height);
        } else {
            // Fallback to black if no background
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Find which question we're currently on
        let questionIndex = -1;
        let questionTimeline = null;

        for (let i = 0; i < this.timeline.questions.length; i++) {
            const qt = this.timeline.questions[i];
            if (time >= qt.startTime && time < qt.endTime) {
                questionIndex = i;
                questionTimeline = qt;
                break;
            }
        }

        // If no question found, we're between questions or done
        if (questionIndex === -1) return;

        const question = this.assets.questions[questionIndex];

        // Apply swoosh exit animation if we're near the end
        this.ctx.save();
        if (time >= questionTimeline.swooshStart) {
            const elapsed = time - questionTimeline.swooshStart;
            const swooshDuration = questionTimeline.endTime - questionTimeline.swooshStart;
            const progress = Math.min(elapsed / swooshDuration, 1);

            // Slide everything to the left and fade out
            const slideDistance = this.width;
            this.ctx.translate(-slideDistance * progress, 0);
            this.ctx.globalAlpha = 1 - progress;
        }

        // Draw option 1 (top) with animation
        if (time >= questionTimeline.option1Appear) {
            const elapsed = time - questionTimeline.option1Appear;
            const progress = Math.min(elapsed / 0.5, 1); // 0.5s animation

            this.drawOption(
                question.image1,
                question.option1,
                question.percentage1,
                'top',
                progress,
                'left',
                time >= questionTimeline.percentageReveal
            );
        }

        // Draw option 2 (bottom) with animation
        if (time >= questionTimeline.option2Appear) {
            const elapsed = time - questionTimeline.option2Appear;
            const progress = Math.min(elapsed / 0.5, 1);

            this.drawOption(
                question.image2,
                question.option2,
                question.percentage2,
                'bottom',
                progress,
                'right',
                time >= questionTimeline.percentageReveal
            );
        }

        this.ctx.restore();
    }

    drawOption(image, text, percentage, position, progress, slideFrom, showPercentage) {
        const y = position === 'top' ? 150 : 1150;  // Moved up by 150px
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
