// Main Video Generator Class - Refactored for SaaS
class VideoGenerator {
    constructor() {
        // API Keys
        this.unsplashKey = '';
        this.elevenlabsKey = '';

        // Managers
        this.promptManager = new PromptManager();
        this.engagementManager = new EngagementManager();

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
            questions: [] // Array of 3 questions with images, voice, data
        };

        // Animation state
        this.animationFrame = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.currentTime = 0;

        // Timeline for all 3 questions
        this.timeline = {
            questions: [],
            totalDuration: 0
        };

        this.init();
    }

    init() {
        this.setupDOM();
        this.loadAPIKeys();
        this.drawInitialCanvas();
    }

    setupDOM() {
        // DOM elements
        this.unsplashKeyInput = document.getElementById('unsplashKey');
        this.elevenlabsKeyInput = document.getElementById('elevenlabsKey');
        this.voiceSelect = document.getElementById('voiceSelect');
        this.generateBtn = document.getElementById('generateBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.statusPanel = document.getElementById('statusPanel');
        this.statusText = document.getElementById('statusText');
        this.progressFill = document.getElementById('progressFill');
        this.previewOverlay = document.getElementById('previewOverlay');

        // Engagement checkboxes
        this.commentEngagementCB = document.getElementById('commentEngagement');
        this.followEngagementCB = document.getElementById('followEngagement');
        this.shareEngagementCB = document.getElementById('shareEngagement');
        this.likeEngagementCB = document.getElementById('likeEngagement');

        // Prompt source
        this.promptSourceRadios = document.querySelectorAll('input[name="promptSource"]');
        this.customOption1 = document.getElementById('customOption1');
        this.customOption2 = document.getElementById('customOption2');
        this.customPromptSection = document.getElementById('customPromptSection');

        // Volume control
        this.musicVolumeSlider = document.getElementById('musicVolume');
        this.volumeValueDisplay = document.getElementById('volumeValue');
        this.musicVolume = 0.3; // Default 30%

        // Question count
        this.questionCountSlider = document.getElementById('questionCount');
        this.questionCountValue = document.getElementById('questionCountValue');
        this.questionCount = 3; // Default 3 questions

        // Event listeners
        this.generateBtn.addEventListener('click', () => this.generateVideo());
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.restartBtn.addEventListener('click', () => this.restart());

        this.unsplashKeyInput.addEventListener('change', () => this.saveAPIKeys());
        this.elevenlabsKeyInput.addEventListener('change', () => this.saveAPIKeys());

        // Prompt source toggle
        this.promptSourceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    this.customPromptSection.classList.remove('hidden');
                } else {
                    this.customPromptSection.classList.add('hidden');
                }
            });
        });

        // Engagement toggles
        this.commentEngagementCB.addEventListener('change', (e) => {
            this.engagementManager.setEngagementEnabled('comment', e.target.checked);
        });
        this.followEngagementCB.addEventListener('change', (e) => {
            this.engagementManager.setEngagementEnabled('follow', e.target.checked);
        });
        this.shareEngagementCB.addEventListener('change', (e) => {
            this.engagementManager.setEngagementEnabled('share', e.target.checked);
        });
        this.likeEngagementCB.addEventListener('change', (e) => {
            this.engagementManager.setEngagementEnabled('like', e.target.checked);
        });

        // Volume slider
        if (this.musicVolumeSlider) {
            this.musicVolumeSlider.addEventListener('input', (e) => {
                this.musicVolume = parseInt(e.target.value) / 100;
                this.volumeValueDisplay.textContent = `${e.target.value}%`;
                if (this.assets.music) {
                    this.assets.music.volume = this.musicVolume;
                }
            });
        }

        // Question count slider
        if (this.questionCountSlider) {
            this.questionCountSlider.addEventListener('input', (e) => {
                this.questionCount = parseInt(e.target.value);
                this.questionCountValue.textContent = e.target.value;
            });
        }
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

    drawInitialCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Video Preview', this.width / 2, this.height / 2);

        this.ctx.font = '40px Arial';
        this.ctx.fillStyle = '#888';
        this.ctx.fillText('Click Generate to start', this.width / 2, this.height / 2 + 80);
    }

    updateStatus(message, progress = 0) {
        this.statusPanel.classList.remove('hidden');
        this.statusText.textContent = message;
        this.progressFill.style.width = `${progress}%`;
    }

    async generateVideo() {
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
            const engagementSettings = this.engagementManager.getEnabledEngagements();
            console.log('📊 Engagement settings:', engagementSettings);

            // Generate prompts based on question count
            const promptSource = document.querySelector('input[name="promptSource"]:checked').value;
            let allQuestions;

            if (promptSource === 'custom') {
                const opt1 = this.customOption1.value.trim();
                const opt2 = this.customOption2.value.trim();

                if (!opt1 || !opt2) {
                    alert('Please enter both custom options');
                    this.generateBtn.disabled = false;
                    return;
                }

                // Get random prompts + the custom one
                const randomPrompts = this.promptManager.getRandomPrompts(this.questionCount - 1);
                allQuestions = [
                    { option1: opt1, option2: opt2 },
                    ...randomPrompts
                ];
            } else {
                allQuestions = this.promptManager.getRandomPrompts(this.questionCount);
            }

            console.log(`🎯 Generated ${this.questionCount} questions:`, allQuestions);

            // Step 1: Load background image
            this.updateStatus('🎨 Loading background...', 3);
            await this.loadBackgroundImage();

            // Step 2: Load audio assets
            this.updateStatus('🔊 Loading audio assets...', 8);
            await this.loadAudioAssets();

            // Step 3+: Generate all questions
            this.assets.questions = [];
            const progressPerQuestion = 85 / this.questionCount; // 85% total for all questions (10-95%)

            for (let i = 0; i < this.questionCount; i++) {
                const question = allQuestions[i];
                const baseProgress = 10 + (i * progressPerQuestion);

                console.log(`\n🎬 === Processing Question ${i + 1}/${this.questionCount} ===`);
                console.log(`   Options: "${question.option1}" vs "${question.option2}"`);
                this.updateStatus(`🎬 Generating question ${i + 1}/${this.questionCount}...`, baseProgress);

                // Fetch images
                this.updateStatus(`🖼️ Fetching images ${i + 1}/${this.questionCount}...`, baseProgress + progressPerQuestion * 0.2);
                console.log(`   📸 Fetching images...`);
                const [img1, img2] = await this.fetchQuestionImages(question.option1, question.option2);
                console.log(`   ✅ Images fetched`);

                // Generate voice
                this.updateStatus(`🎤 Generating voice ${i + 1}/${this.questionCount}...`, baseProgress + progressPerQuestion * 0.6);
                console.log(`   🎤 Generating voice...`);
                const voice = await this.generateQuestionVoice(question.option1, question.option2);
                console.log(`   ✅ Voice generated`);

                // Generate percentages
                const percentage1 = Math.floor(Math.random() * 40) + 30; // 30-70
                const percentage2 = 100 - percentage1;

                // Get engagement for this question (last question gets engagement)
                const engagement = this.engagementManager.getEngagementForQuestion(i, this.questionCount);

                this.assets.questions.push({
                    option1: question.option1,
                    option2: question.option2,
                    image1: img1,
                    image2: img2,
                    voice: voice,
                    percentage1: percentage1,
                    percentage2: percentage2,
                    engagement: engagement
                });

                console.log(`   ✅ Question ${i + 1} complete! (${percentage1}% vs ${percentage2}%)`);
                if (engagement) {
                    console.log(`   🎯 Engagement: ${engagement.type}`);
                }
            }

            console.log(`\n✨ All ${this.questionCount} questions generated successfully!`);

            // Step 6: Calculate timeline
            this.updateStatus('⏱️ Building timeline...', 95);
            this.calculateTimeline();

            // Step 7: Ready to play
            this.updateStatus(`✅ Video ready! (${this.questionCount} question${this.questionCount > 1 ? 's' : ''})`, 100);

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

    async fetchQuestionImages(option1, option2) {
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

        const [img1Url, img2Url] = await Promise.all([
            fetchImage(option1),
            fetchImage(option2)
        ]);

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
        try {
            this.assets.music = new Audio('../assets/audio/music.mp3');
            await this.waitForAudioLoad(this.assets.music);

            this.assets.clockSound = new Audio('../assets/audio/clock.mp3');
            await this.waitForAudioLoad(this.assets.clockSound);

            this.assets.dingSound = new Audio('../assets/audio/ding.mp3');
            await this.waitForAudioLoad(this.assets.dingSound);

            this.assets.swooshSound = new Audio('../assets/audio/swoosh.mp3');
            await this.waitForAudioLoad(this.assets.swooshSound);

            console.log('All audio assets loaded successfully');
        } catch (error) {
            console.warn('Some audio files could not be loaded:', error.message);
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
        this.timeline.questions = [];
        let currentTime = 0;

        for (let i = 0; i < this.assets.questions.length; i++) {
            const question = this.assets.questions[i];
            const voiceDuration = question.voice.duration;

            const questionTimeline = {
                startTime: currentTime,
                voiceStart: currentTime + 0.5,
                option1Appear: currentTime + 0.5 + 0.2,
                option2Appear: currentTime + 0.5 + (voiceDuration / 2),
                clockStart: currentTime + 0.5 + voiceDuration + 0.5,
                dingStart: currentTime + 0.5 + voiceDuration + 0.5 + 3.0,
                percentageReveal: currentTime + 0.5 + voiceDuration + 0.5 + 3.0,
                swooshStart: currentTime + 0.5 + voiceDuration + 0.5 + 3.0 + 2.0,
                endTime: currentTime + 0.5 + voiceDuration + 0.5 + 3.0 + 2.0 + 1.0
            };

            this.timeline.questions.push(questionTimeline);
            currentTime = questionTimeline.endTime;
        }

        this.timeline.totalDuration = currentTime;
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.startTime = Date.now() - (this.currentTime * 1000);
        this.animate();

        if (this.assets.music && this.currentTime < this.timeline.totalDuration) {
            this.assets.music.loop = true;
            this.assets.music.volume = this.musicVolume;
            this.assets.music.play();
        }

        for (let i = 0; i < this.timeline.questions.length; i++) {
            const qt = this.timeline.questions[i];
            const question = this.assets.questions[i];

            if (question.voice && this.currentTime < qt.voiceStart + question.voice.duration) {
                const timeUntilVoice = Math.max(0, qt.voiceStart - this.currentTime);
                setTimeout(() => {
                    if (this.isPlaying) {
                        question.voice.currentTime = Math.max(0, this.currentTime - qt.voiceStart);
                        question.voice.play().catch(e => console.log('Voice play error:', e));
                    }
                }, timeUntilVoice * 1000);
            }

            if (this.assets.clockSound && this.currentTime < qt.clockStart + 3) {
                const timeUntilClock = Math.max(0, qt.clockStart - this.currentTime);
                setTimeout(() => {
                    if (this.isPlaying) {
                        const clockClone = this.assets.clockSound.cloneNode();
                        clockClone.play().catch(e => console.log('Clock play error:', e));
                    }
                }, timeUntilClock * 1000);
            }

            if (this.assets.dingSound && this.currentTime < qt.dingStart + 0.5) {
                const timeUntilDing = Math.max(0, qt.dingStart - this.currentTime);
                setTimeout(() => {
                    if (this.isPlaying) {
                        const dingClone = this.assets.dingSound.cloneNode();
                        dingClone.play().catch(e => console.log('Ding play error:', e));
                    }
                }, timeUntilDing * 1000);
            }

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

        if (this.assets.music) this.assets.music.pause();

        for (const question of this.assets.questions) {
            if (question.voice) question.voice.pause();
        }

        cancelAnimationFrame(this.animationFrame);
    }

    restart() {
        this.pause();
        this.currentTime = 0;

        if (this.assets.music) this.assets.music.currentTime = 0;

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
        // Draw background
        if (this.assets.background) {
            this.ctx.drawImage(this.assets.background, 0, 0, this.width, this.height);
        } else {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Find current question
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

        if (questionIndex === -1) return;

        const question = this.assets.questions[questionIndex];

        // Apply swoosh exit animation
        this.ctx.save();
        if (time >= questionTimeline.swooshStart) {
            const elapsed = time - questionTimeline.swooshStart;
            const swooshDuration = questionTimeline.endTime - questionTimeline.swooshStart;
            const progress = Math.min(elapsed / swooshDuration, 1);

            const slideDistance = this.width;
            this.ctx.translate(-slideDistance * progress, 0);
            this.ctx.globalAlpha = 1 - progress;
        }

        // Draw option 1 (top)
        if (time >= questionTimeline.option1Appear) {
            const elapsed = time - questionTimeline.option1Appear;
            const progress = Math.min(elapsed / 0.5, 1);

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

        // Draw option 2 (bottom)
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
        const y = position === 'top' ? 150 : 1150;
        const imageSize = 400;
        const imageX = (this.width - imageSize) / 2;

        this.ctx.save();

        if (progress < 1) {
            const slideDistance = 200;
            const offset = slideFrom === 'left'
                ? -slideDistance * (1 - progress)
                : slideDistance * (1 - progress);
            this.ctx.translate(offset, 0);
            this.ctx.globalAlpha = progress;
        }

        if (image) {
            this.drawRoundedImage(image, imageX, y, imageSize, imageSize, 20);
        }

        const textY = y + imageSize + 80;
        this.drawStrokedText(text, this.width / 2, textY, 'bold 70px Arial', '#fff', '#000', 8);

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

        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeText(text, x, y);

        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
    }

    async downloadVideo() {
        if (!this.assets.questions || this.assets.questions.length === 0) {
            alert('Please generate a video first!');
            return;
        }

        try {
            this.updateStatus('📹 Recording video...', 0);
            this.downloadBtn.disabled = true;

            // Reset to start
            this.pause();
            this.currentTime = 0;
            if (this.assets.music) this.assets.music.currentTime = 0;
            for (const question of this.assets.questions) {
                if (question.voice) question.voice.currentTime = 0;
            }

            // Create canvas stream
            const canvasStream = this.canvas.captureStream(30); // 30 fps

            // Create audio context to mix all audio sources
            const audioContext = new AudioContext();
            const audioDestination = audioContext.createMediaStreamDestination();

            // Add music to mix
            if (this.assets.music) {
                const musicSource = audioContext.createMediaElementSource(this.assets.music);
                musicSource.connect(audioDestination);
                musicSource.connect(audioContext.destination); // Also play through speakers
            }

            // Add question voices to mix
            for (const question of this.assets.questions) {
                if (question.voice) {
                    const voiceSource = audioContext.createMediaElementSource(question.voice);
                    voiceSource.connect(audioDestination);
                }
            }

            // Combine video and audio streams
            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...audioDestination.stream.getAudioTracks()
            ]);

            // Set up MediaRecorder
            const chunks = [];
            const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
                ? 'video/webm; codecs=vp9'
                : 'video/webm';

            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 5000000 // 5 Mbps
            });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `would-you-rather-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.updateStatus('✅ Video downloaded!', 100);
                setTimeout(() => {
                    this.statusPanel.classList.add('hidden');
                    this.downloadBtn.disabled = false;
                }, 2000);
            };

            // Start recording
            mediaRecorder.start();
            this.updateStatus('📹 Recording video...', 10);

            // Play the video and monitor progress
            this.isPlaying = true;
            this.startTime = Date.now();
            this.animate();

            // Start all audio
            if (this.assets.music) {
                this.assets.music.loop = true;
                this.assets.music.volume = this.musicVolume;
                this.assets.music.play();
            }

            // Schedule all audio events
            for (let i = 0; i < this.timeline.questions.length; i++) {
                const qt = this.timeline.questions[i];
                const question = this.assets.questions[i];

                if (question.voice) {
                    setTimeout(() => {
                        if (this.isPlaying) {
                            question.voice.play().catch(e => console.log('Voice play error:', e));
                        }
                    }, qt.voiceStart * 1000);
                }

                if (this.assets.clockSound) {
                    setTimeout(() => {
                        if (this.isPlaying) {
                            const clockClone = this.assets.clockSound.cloneNode();
                            clockClone.play().catch(e => console.log('Clock play error:', e));
                        }
                    }, qt.clockStart * 1000);
                }

                if (this.assets.dingSound) {
                    setTimeout(() => {
                        if (this.isPlaying) {
                            const dingClone = this.assets.dingSound.cloneNode();
                            dingClone.play().catch(e => console.log('Ding play error:', e));
                        }
                    }, qt.dingStart * 1000);
                }

                if (this.assets.swooshSound) {
                    setTimeout(() => {
                        if (this.isPlaying) {
                            const swooshClone = this.assets.swooshSound.cloneNode();
                            swooshClone.play().catch(e => console.log('Swoosh play error:', e));
                        }
                    }, qt.swooshStart * 1000);
                }
            }

            // Update progress during recording
            const progressInterval = setInterval(() => {
                if (this.isPlaying) {
                    const progress = (this.currentTime / this.timeline.totalDuration) * 90;
                    this.updateStatus(`📹 Recording video... ${Math.floor(progress)}%`, 10 + progress);
                }
            }, 100);

            // Stop recording when video ends
            setTimeout(() => {
                clearInterval(progressInterval);
                this.pause();
                mediaRecorder.stop();
                audioContext.close();
            }, this.timeline.totalDuration * 1000 + 500);

        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading video: ' + error.message);
            this.downloadBtn.disabled = false;
            this.statusPanel.classList.add('hidden');
        }
    }
}
