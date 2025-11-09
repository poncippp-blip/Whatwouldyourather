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
            questions: [], // Array of questions with images, voice, data
            engagementImages: {} // Pre-loaded engagement images
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

        // Config management
        this.saveConfigBtn = document.getElementById('saveConfigBtn');
        this.loadConfigBtn = document.getElementById('loadConfigBtn');
        this.configFileInput = document.getElementById('configFileInput');

        // Engagement configuration
        this.commentEngagementCB = document.getElementById('commentEngagement');
        this.commentOption1 = document.getElementById('commentOption1');
        this.commentOption2 = document.getElementById('commentOption2');
        this.commentInsertAfter = document.getElementById('commentInsertAfter');

        this.shareEngagementCB = document.getElementById('shareEngagement');
        this.shareOption1 = document.getElementById('shareOption1');
        this.shareOption2 = document.getElementById('shareOption2');
        this.shareInsertAfter = document.getElementById('shareInsertAfter');

        this.followEngagementCB = document.getElementById('followEngagement');
        this.followOption1 = document.getElementById('followOption1');
        this.followOption2 = document.getElementById('followOption2');
        this.followInsertAfter = document.getElementById('followInsertAfter');

        this.likeEngagementCB = document.getElementById('likeEngagement');
        this.likeOption1 = document.getElementById('likeOption1');
        this.likeOption2 = document.getElementById('likeOption2');
        this.likeInsertAfter = document.getElementById('likeInsertAfter');

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

        // Advanced timing controls
        this.advancedTimingBtn = document.getElementById('advancedTimingBtn');
        this.advancedTimingPanel = document.getElementById('advancedTimingPanel');

        // Timing parameters (in seconds) - Optimized for faster pacing
        this.timing = {
            questionDelay: 0.325,    // Delay between questions (50% faster than previous)
            voiceDelay: 0.325,       // Voice start delay (35% faster)
            option1Delay: 0.13,      // Option 1 appearance delay after voice (35% faster)
            option2DelayPercent: 50, // Option 2 delay as % of voice duration
            clockDuration: 2.7,      // Thinking time with clock (10% faster)
            percentageDuration: 1.8, // How long to show percentages (10% faster)
            engagementDuration: 2.7, // How long to show engagement hooks (10% faster)
            swooshDuration: 0.9,     // Transition duration between questions (10% faster)
            fadeInDuration: 0.45,    // Fade in animation duration (10% faster)
            afterVoicePause: 0.325   // Pause after voice before clock (35% faster)
        };

        // Event listeners
        this.generateBtn.addEventListener('click', () => this.generateVideo());
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.restartBtn.addEventListener('click', () => this.restart());

        this.unsplashKeyInput.addEventListener('change', () => this.saveAPIKeys());
        this.elevenlabsKeyInput.addEventListener('change', () => this.saveAPIKeys());

        // Config management
        this.saveConfigBtn.addEventListener('click', () => this.saveConfig());
        this.loadConfigBtn.addEventListener('click', () => this.configFileInput.click());
        this.configFileInput.addEventListener('change', (e) => this.loadConfig(e));

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

        // Advanced timing panel toggle
        if (this.advancedTimingBtn) {
            this.advancedTimingBtn.addEventListener('click', () => {
                this.advancedTimingPanel.classList.toggle('hidden');
            });
        }

        // Advanced timing sliders
        this.setupTimingSlider('questionDelay', 'questionDelayValue', (val) => `${val}s`);
        this.setupTimingSlider('voiceDelay', 'voiceDelayValue', (val) => `${val}s`);
        this.setupTimingSlider('option1Delay', 'option1DelayValue', (val) => `${val}s`);
        this.setupTimingSlider('option2Delay', 'option2DelayValue', (val) => `${val}%`, 'option2DelayPercent');
        this.setupTimingSlider('clockDuration', 'clockDurationValue', (val) => `${val}s`);
        this.setupTimingSlider('percentageDuration', 'percentageDurationValue', (val) => `${val}s`);
        this.setupTimingSlider('engagementDuration', 'engagementDurationValue', (val) => `${val}s`);
        this.setupTimingSlider('swooshDuration', 'swooshDurationValue', (val) => `${val}s`);
        this.setupTimingSlider('fadeInDuration', 'fadeInDurationValue', (val) => `${val}s`);
        this.setupTimingSlider('afterVoicePause', 'afterVoicePauseValue', (val) => `${val}s`);
    }

    setupTimingSlider(sliderId, valueId, formatter, timingKey = null) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);

        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const key = timingKey || sliderId.replace(/([A-Z])/g, (match) => match.toLowerCase()).replace(/delay$/, 'Delay').replace(/duration$/, 'Duration').replace(/pause$/, 'Pause');

                // Update the timing object
                if (timingKey) {
                    this.timing[timingKey] = value;
                } else {
                    // Convert camelCase ID to timing key
                    const timingKeyMap = {
                        'questionDelay': 'questionDelay',
                        'voiceDelay': 'voiceDelay',
                        'option1Delay': 'option1Delay',
                        'clockDuration': 'clockDuration',
                        'percentageDuration': 'percentageDuration',
                        'engagementDuration': 'engagementDuration',
                        'swooshDuration': 'swooshDuration',
                        'fadeInDuration': 'fadeInDuration',
                        'afterVoicePause': 'afterVoicePause'
                    };
                    this.timing[timingKeyMap[sliderId]] = value;
                }

                valueDisplay.textContent = formatter(value);
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

    saveConfig() {
        const config = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            apiKeys: {
                unsplash: this.unsplashKeyInput.value.trim(),
                elevenlabs: this.elevenlabsKeyInput.value.trim()
            },
            voice: this.voiceSelect.value,
            musicVolume: this.musicVolume,
            questionCount: this.questionCount,
            timing: { ...this.timing },
            engagement: {
                comment: {
                    enabled: this.commentEngagementCB.checked,
                    option1: this.commentOption1.value.trim(),
                    option2: this.commentOption2.value.trim(),
                    insertAfter: parseInt(this.commentInsertAfter.value) || 0
                },
                share: {
                    enabled: this.shareEngagementCB.checked,
                    option1: this.shareOption1.value.trim(),
                    option2: this.shareOption2.value.trim(),
                    insertAfter: parseInt(this.shareInsertAfter.value) || 0
                },
                follow: {
                    enabled: this.followEngagementCB.checked,
                    option1: this.followOption1.value.trim(),
                    option2: this.followOption2.value.trim(),
                    insertAfter: parseInt(this.followInsertAfter.value) || 0
                },
                like: {
                    enabled: this.likeEngagementCB.checked,
                    option1: this.likeOption1.value.trim(),
                    option2: this.likeOption2.value.trim(),
                    insertAfter: parseInt(this.likeInsertAfter.value) || 0
                }
            },
            promptSource: document.querySelector('input[name="promptSource"]:checked').value,
            customPrompt: {
                option1: this.customOption1.value.trim(),
                option2: this.customOption2.value.trim()
            }
        };

        // Convert to JSON and download
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wouldyourather-config-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ Configuration saved!');
        alert('Configuration saved successfully!');
    }

    async loadConfig(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const config = JSON.parse(text);

            console.log('📂 Loading configuration:', config);

            // Load API keys
            if (config.apiKeys) {
                if (config.apiKeys.unsplash) {
                    this.unsplashKeyInput.value = config.apiKeys.unsplash;
                    this.unsplashKey = config.apiKeys.unsplash;
                    localStorage.setItem('unsplashApiKey', config.apiKeys.unsplash);
                }
                if (config.apiKeys.elevenlabs) {
                    this.elevenlabsKeyInput.value = config.apiKeys.elevenlabs;
                    this.elevenlabsKey = config.apiKeys.elevenlabs;
                    localStorage.setItem('elevenlabsApiKey', config.apiKeys.elevenlabs);
                }
            }

            // Load voice
            if (config.voice) {
                this.voiceSelect.value = config.voice;
            }

            // Load music volume
            if (config.musicVolume !== undefined) {
                this.musicVolume = config.musicVolume;
                this.musicVolumeSlider.value = Math.round(config.musicVolume * 100);
                this.volumeValueDisplay.textContent = `${Math.round(config.musicVolume * 100)}%`;
            }

            // Load question count
            if (config.questionCount !== undefined) {
                this.questionCount = config.questionCount;
                this.questionCountSlider.value = config.questionCount;
                this.questionCountValue.textContent = config.questionCount;
            }

            // Load timing settings
            if (config.timing) {
                this.timing = { ...this.timing, ...config.timing };

                // Update all timing sliders
                if (config.timing.questionDelay !== undefined) {
                    document.getElementById('questionDelay').value = config.timing.questionDelay;
                    document.getElementById('questionDelayValue').textContent = `${config.timing.questionDelay}s`;
                }
                if (config.timing.voiceDelay !== undefined) {
                    document.getElementById('voiceDelay').value = config.timing.voiceDelay;
                    document.getElementById('voiceDelayValue').textContent = `${config.timing.voiceDelay}s`;
                }
                if (config.timing.option1Delay !== undefined) {
                    document.getElementById('option1Delay').value = config.timing.option1Delay;
                    document.getElementById('option1DelayValue').textContent = `${config.timing.option1Delay}s`;
                }
                if (config.timing.option2DelayPercent !== undefined) {
                    document.getElementById('option2Delay').value = config.timing.option2DelayPercent;
                    document.getElementById('option2DelayValue').textContent = `${config.timing.option2DelayPercent}%`;
                }
                if (config.timing.clockDuration !== undefined) {
                    document.getElementById('clockDuration').value = config.timing.clockDuration;
                    document.getElementById('clockDurationValue').textContent = `${config.timing.clockDuration}s`;
                }
                if (config.timing.percentageDuration !== undefined) {
                    document.getElementById('percentageDuration').value = config.timing.percentageDuration;
                    document.getElementById('percentageDurationValue').textContent = `${config.timing.percentageDuration}s`;
                }
                if (config.timing.engagementDuration !== undefined) {
                    document.getElementById('engagementDuration').value = config.timing.engagementDuration;
                    document.getElementById('engagementDurationValue').textContent = `${config.timing.engagementDuration}s`;
                }
                if (config.timing.swooshDuration !== undefined) {
                    document.getElementById('swooshDuration').value = config.timing.swooshDuration;
                    document.getElementById('swooshDurationValue').textContent = `${config.timing.swooshDuration}s`;
                }
                if (config.timing.fadeInDuration !== undefined) {
                    document.getElementById('fadeInDuration').value = config.timing.fadeInDuration;
                    document.getElementById('fadeInDurationValue').textContent = `${config.timing.fadeInDuration}s`;
                }
                if (config.timing.afterVoicePause !== undefined) {
                    document.getElementById('afterVoicePause').value = config.timing.afterVoicePause;
                    document.getElementById('afterVoicePauseValue').textContent = `${config.timing.afterVoicePause}s`;
                }
            }

            // Load engagement settings
            if (config.engagement) {
                // Comment
                if (config.engagement.comment) {
                    this.commentEngagementCB.checked = config.engagement.comment.enabled;
                    if (config.engagement.comment.option1) this.commentOption1.value = config.engagement.comment.option1;
                    if (config.engagement.comment.option2) this.commentOption2.value = config.engagement.comment.option2;
                    if (config.engagement.comment.insertAfter !== undefined) this.commentInsertAfter.value = config.engagement.comment.insertAfter;
                }

                // Share
                if (config.engagement.share) {
                    this.shareEngagementCB.checked = config.engagement.share.enabled;
                    if (config.engagement.share.option1) this.shareOption1.value = config.engagement.share.option1;
                    if (config.engagement.share.option2) this.shareOption2.value = config.engagement.share.option2;
                    if (config.engagement.share.insertAfter !== undefined) this.shareInsertAfter.value = config.engagement.share.insertAfter;
                }

                // Follow
                if (config.engagement.follow) {
                    this.followEngagementCB.checked = config.engagement.follow.enabled;
                    if (config.engagement.follow.option1) this.followOption1.value = config.engagement.follow.option1;
                    if (config.engagement.follow.option2) this.followOption2.value = config.engagement.follow.option2;
                    if (config.engagement.follow.insertAfter !== undefined) this.followInsertAfter.value = config.engagement.follow.insertAfter;
                }

                // Like
                if (config.engagement.like) {
                    this.likeEngagementCB.checked = config.engagement.like.enabled;
                    if (config.engagement.like.option1) this.likeOption1.value = config.engagement.like.option1;
                    if (config.engagement.like.option2) this.likeOption2.value = config.engagement.like.option2;
                    if (config.engagement.like.insertAfter !== undefined) this.likeInsertAfter.value = config.engagement.like.insertAfter;
                }
            }

            // Load prompt source
            if (config.promptSource) {
                const radio = document.querySelector(`input[name="promptSource"][value="${config.promptSource}"]`);
                if (radio) {
                    radio.checked = true;
                    if (config.promptSource === 'custom') {
                        this.customPromptSection.classList.remove('hidden');
                    } else {
                        this.customPromptSection.classList.add('hidden');
                    }
                }
            }

            // Load custom prompt
            if (config.customPrompt) {
                if (config.customPrompt.option1) this.customOption1.value = config.customPrompt.option1;
                if (config.customPrompt.option2) this.customOption2.value = config.customPrompt.option2;
            }

            console.log('✅ Configuration loaded successfully!');
            alert('Configuration loaded successfully!');

        } catch (error) {
            console.error('❌ Error loading configuration:', error);
            alert('Error loading configuration: ' + error.message);
        }

        // Reset file input
        event.target.value = '';
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
            // Generate prompts based on question count
            const promptSource = document.querySelector('input[name="promptSource"]:checked').value;
            let regularQuestions;

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
                regularQuestions = [
                    { option1: opt1, option2: opt2 },
                    ...randomPrompts
                ];
            } else {
                regularQuestions = this.promptManager.getRandomPrompts(this.questionCount);
            }

            // Collect enabled engagement questions
            const engagementQuestions = [];

            if (this.commentEngagementCB.checked) {
                const insertAfter = parseInt(this.commentInsertAfter.value) || 0;
                engagementQuestions.push({
                    option1: this.commentOption1.value.trim() || "Comment 'I love God'",
                    option2: this.commentOption2.value.trim() || "Reject the offer",
                    insertAfter: insertAfter,
                    type: 'comment',
                    isEngagement: true
                });
            }

            if (this.shareEngagementCB.checked) {
                const insertAfter = parseInt(this.shareInsertAfter.value) || 0;
                engagementQuestions.push({
                    option1: this.shareOption1.value.trim() || "Always be alone",
                    option2: this.shareOption2.value.trim() || "Marry the 3rd person who clicks share",
                    insertAfter: insertAfter,
                    type: 'share',
                    isEngagement: true
                });
            }

            if (this.followEngagementCB.checked) {
                const insertAfter = parseInt(this.followInsertAfter.value) || 0;
                engagementQuestions.push({
                    option1: this.followOption1.value.trim() || "Follow for more",
                    option2: this.followOption2.value.trim() || "Skip and regret it",
                    insertAfter: insertAfter,
                    type: 'follow',
                    isEngagement: true
                });
            }

            if (this.likeEngagementCB.checked) {
                const insertAfter = parseInt(this.likeInsertAfter.value) || 0;
                engagementQuestions.push({
                    option1: this.likeOption1.value.trim() || "Like if you chose the first option",
                    option2: this.likeOption2.value.trim() || "Don't like and miss out",
                    insertAfter: insertAfter,
                    type: 'like',
                    isEngagement: true
                });
            }

            // Sort engagement questions by insertion point
            engagementQuestions.sort((a, b) => a.insertAfter - b.insertAfter);

            // Insert engagement questions at specified positions
            let allQuestions = [...regularQuestions];
            let offset = 0;

            for (const engQ of engagementQuestions) {
                const insertPosition = engQ.insertAfter === 0 ? allQuestions.length : engQ.insertAfter + offset;
                allQuestions.splice(insertPosition, 0, engQ);
                offset++;
            }

            const totalQuestions = allQuestions.length;
            console.log(`🎯 Generated ${regularQuestions.length} regular + ${engagementQuestions.length} engagement questions = ${totalQuestions} total`);

            // Step 1: Load background image
            this.updateStatus('🎨 Loading background...', 3);
            await this.loadBackgroundImage();

            // Step 2: Load engagement images
            this.updateStatus('🖼️ Loading engagement images...', 5);
            await this.loadEngagementImages();

            // Step 3: Load audio assets
            this.updateStatus('🔊 Loading audio assets...', 8);
            await this.loadAudioAssets();

            // Step 3+: Generate all questions (regular + engagement)
            this.assets.questions = [];
            const progressPerQuestion = 85 / totalQuestions; // 85% total for all questions (10-95%)

            for (let i = 0; i < totalQuestions; i++) {
                const question = allQuestions[i];
                const baseProgress = 10 + (i * progressPerQuestion);
                const questionType = question.isEngagement ? `${question.type} engagement` : 'regular';

                console.log(`\n🎬 === Processing Question ${i + 1}/${totalQuestions} (${questionType}) ===`);
                console.log(`   Options: "${question.option1}" vs "${question.option2}"`);
                this.updateStatus(`🎬 Generating question ${i + 1}/${totalQuestions}...`, baseProgress);

                // Fetch images (use local images for engagement questions)
                this.updateStatus(`🖼️ Fetching images ${i + 1}/${totalQuestions}...`, baseProgress + progressPerQuestion * 0.2);
                console.log(`   📸 Fetching images...`);

                let img1, img2;
                if (question.isEngagement) {
                    // Use pre-loaded local engagement images
                    const engagementImages = this.getEngagementImages(question.type);
                    img1 = engagementImages[0];
                    img2 = engagementImages[1];
                    console.log(`   ✅ Using local engagement images for ${question.type}`);
                } else {
                    // Fetch from Unsplash for regular questions
                    [img1, img2] = await this.fetchQuestionImages(question.option1, question.option2);
                    console.log(`   ✅ Images fetched from Unsplash`);
                }

                // Generate voice
                this.updateStatus(`🎤 Generating voice ${i + 1}/${totalQuestions}...`, baseProgress + progressPerQuestion * 0.6);
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
                    percentage2: percentage2,
                    isEngagement: question.isEngagement || false,
                    engagementType: question.type || null
                });

                console.log(`   ✅ Question ${i + 1} complete! (${percentage1}% vs ${percentage2}%)${question.isEngagement ? ' [ENGAGEMENT: ' + question.type + ']' : ''}`);
            }

            console.log(`\n✨ All ${totalQuestions} questions generated successfully!`);
            console.log(`   📊 ${regularQuestions.length} regular + ${engagementQuestions.length} engagement questions`);

            // Step 6: Calculate timeline
            this.updateStatus('⏱️ Building timeline...', 95);
            this.calculateTimeline();

            // Step 7: Ready to play
            this.updateStatus(`✅ Video ready! (${totalQuestions} question${totalQuestions > 1 ? 's' : ''})`, 100);

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
            img.crossOrigin = 'anonymous'; // Enable CORS for canvas export
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

    async loadEngagementImages() {
        try {
            const imagesToLoad = {
                'comment': '../assets/images/engagement/comment.png',
                'reject': '../assets/images/engagement/reject.png',
                'marry': '../assets/images/engagement/marry.png'
            };

            for (const [key, path] of Object.entries(imagesToLoad)) {
                try {
                    const img = await this.loadImage(path);
                    this.assets.engagementImages[key] = img;
                    console.log(`✅ Loaded engagement image: ${key}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to load engagement image ${key}:`, error.message);
                }
            }
        } catch (error) {
            console.warn('Some engagement images could not be loaded:', error.message);
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

            // Calculate option 2 delay based on percentage of voice duration
            const option2Delay = (voiceDuration * this.timing.option2DelayPercent) / 100;

            const questionTimeline = {
                startTime: currentTime,
                voiceStart: currentTime + this.timing.voiceDelay,
                option1Appear: currentTime + this.timing.voiceDelay + this.timing.option1Delay,
                option2Appear: currentTime + this.timing.voiceDelay + option2Delay,
                clockStart: currentTime + this.timing.voiceDelay + voiceDuration + this.timing.afterVoicePause,
                dingStart: currentTime + this.timing.voiceDelay + voiceDuration + this.timing.afterVoicePause + this.timing.clockDuration,
                percentageReveal: currentTime + this.timing.voiceDelay + voiceDuration + this.timing.afterVoicePause + this.timing.clockDuration,
                swooshStart: currentTime + this.timing.voiceDelay + voiceDuration + this.timing.afterVoicePause + this.timing.clockDuration + this.timing.percentageDuration,
                endTime: currentTime + this.timing.voiceDelay + voiceDuration + this.timing.afterVoicePause + this.timing.clockDuration + this.timing.percentageDuration + this.timing.swooshDuration
            };

            this.timeline.questions.push(questionTimeline);
            currentTime = questionTimeline.endTime + this.timing.questionDelay;
        }

        this.timeline.totalDuration = currentTime - this.timing.questionDelay; // Remove last delay
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
            const progress = Math.min(elapsed / this.timing.fadeInDuration, 1);

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
            const progress = Math.min(elapsed / this.timing.fadeInDuration, 1);

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

        // Engagement indicator removed for cleaner canvas
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

        // Add vibrant glow to option text
        this.ctx.save();
        this.ctx.shadowColor = '#00d4ff'; // Bright cyan glow
        this.ctx.shadowBlur = 25;

        // Use wrapped text with max width of 950px and line height of 85px
        this.drawStrokedTextWrapped(text, this.width / 2, textY, 'bold 70px Arial', '#fff', '#000', 8, 950, 85);

        this.ctx.restore();

        if (showPercentage) {
            const color = percentage >= 50 ? '#00ff88' : '#ff3366'; // More vibrant green and red
            const percentY = textY + 100;

            // Add glow effect for percentages
            this.ctx.save();
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 30;

            this.drawStrokedText(
                `${percentage}%`,
                this.width / 2,
                percentY,
                'bold 90px Arial',
                color,
                '#000',
                10
            );

            this.ctx.restore();
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

    // Wrap text into multiple lines if too long
    wrapText(text, maxWidth) {
        this.ctx.textAlign = 'center';
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // Draw stroked text with automatic wrapping
    drawStrokedTextWrapped(text, x, y, font, fillColor, strokeColor, strokeWidth, maxWidth, lineHeight) {
        this.ctx.font = font;
        const lines = this.wrapText(text, maxWidth);

        // Adjust starting y position to center multi-line text
        const totalHeight = (lines.length - 1) * lineHeight;
        const startY = y - (totalHeight / 2);

        for (let i = 0; i < lines.length; i++) {
            const lineY = startY + (i * lineHeight);
            this.drawStrokedText(lines[i], x, lineY, font, fillColor, strokeColor, strokeWidth);
        }
    }

    drawEngagementIndicator(engagementType) {
        this.ctx.save();

        // Draw engagement badge at top of screen
        const badgeText = `${this.getEngagementEmoji(engagementType)} ${engagementType.toUpperCase()} ENGAGEMENT`;
        const badgeY = 60;
        const centerX = this.width / 2;

        // Background for badge with vibrant glow
        const badgeColor = this.getEngagementColor(engagementType);
        this.ctx.fillStyle = badgeColor;
        this.ctx.shadowColor = badgeColor;
        this.ctx.shadowBlur = 40;
        this.ctx.shadowOffsetY = 0;

        const padding = 30;
        const tempFont = this.ctx.font;
        this.ctx.font = 'bold 45px Arial';
        const textWidth = this.ctx.measureText(badgeText).width;
        const badgeWidth = textWidth + padding * 2;
        const badgeHeight = 60;

        // Rounded rectangle for badge
        const badgeX = centerX - badgeWidth / 2;
        this.ctx.beginPath();
        this.ctx.roundRect(badgeX, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 15);
        this.ctx.fill();

        // Reset shadow for text
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;

        // Badge text
        this.drawStrokedText(badgeText, centerX, badgeY, 'bold 45px Arial', '#fff', '#000', 5);

        this.ctx.font = tempFont;
        this.ctx.restore();
    }

    getEngagementEmoji(type) {
        const emojis = {
            'comment': '💬',
            'share': '🔄',
            'follow': '👤',
            'like': '❤️'
        };
        return emojis[type] || '⭐';
    }

    getEngagementColor(type) {
        const colors = {
            'comment': '#00aaff',  // Vibrant bright blue
            'share': '#aa44ff',    // Vibrant purple
            'follow': '#ff0099',   // Vibrant hot pink
            'like': '#ff3344'      // Vibrant red
        };
        return colors[type] || '#667eea';
    }

    getEngagementImages(type) {
        // Map engagement types to local pre-loaded images
        const imageMapping = {
            'comment': [this.assets.engagementImages.comment, this.assets.engagementImages.reject],
            'share': [this.assets.engagementImages.reject, this.assets.engagementImages.marry],
            'follow': [this.assets.engagementImages.comment, this.assets.engagementImages.marry],
            'like': [this.assets.engagementImages.marry, this.assets.engagementImages.comment]
        };

        // Return mapped images or fallback to comment/reject
        return imageMapping[type] || [this.assets.engagementImages.comment, this.assets.engagementImages.reject];
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
