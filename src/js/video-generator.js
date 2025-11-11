// Main Video Generator Class - Refactored for SaaS
class VideoGenerator {
    constructor() {
        // API Keys - DEFAULT VALUES
        this.unsplashKey = 'B5K8dASmtv-P2uJNn7zNSmuxhgdHrAw3dwALvuSn1i0';
        this.elevenlabsKey = 'sk_9295844b74284aae4eed3ecf03eb41ddead9e78de1b8a785';

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
        this.scheduledTimeouts = []; // Track timeouts for cleanup

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
        this.manualPromptSection = document.getElementById('manualPromptSection');
        this.manualPromptsContainer = document.getElementById('manualPromptsContainer');

        // Volume control
        this.musicVolumeSlider = document.getElementById('musicVolume');
        this.volumeValueDisplay = document.getElementById('volumeValue');
        this.musicVolume = 0.15; // Default 15%

        // Question count
        this.questionCountSlider = document.getElementById('questionCount');
        this.questionCountValue = document.getElementById('questionCountValue');
        this.questionCount = 7; // Default 7 questions

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

        // Image shadow settings
        this.imageShadow = {
            enabled: true,
            blur: 40,
            offsetX: 0,
            offsetY: 15,
            color: 'rgba(0, 0, 0, 0.6)'
        };

        // Enhanced player settings
        this.playbackSpeed = 1.0;
        this.canvasZoom = 1.0;
        this.voiceVolume = 1.0;
        this.effectsVolume = 1.0;
        this.loopEnabled = false;
        this.isMuted = false;
        this.exportQuality = 'high';
        this.exportFPS = 30;
        this.exportFormat = 'webm';
        this.autoSaveEnabled = true;
        this.autoSaveTimer = null;

        // New advanced features
        this.canvasFilters = {
            brightness: 100,
            contrast: 100,
            saturation: 142,
            blur: 0
        };
        this.customColors = {
            text: '#ffffff',
            glow: '#ffffff',
            percentageWin: '#11ff00',
            percentageLose: '#ff0040'
        };
        this.animationEasing = {
            slide: 'ease',
            fade: 'ease'
        };
        this.bookmarks = [];
        this.snapToQuestion = false;
        this.autoPauseOnBlur = true;
        this.settingsHistory = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;

        // NEW: Food-only mode (500+ delicious food prompts)
        this.foodOnlyMode = false;

        // NEW: Simple fast food mode (100+ simple fast foods only)
        this.simpleFastFoodMode = false;

        // Manual prompts storage
        this.manualPrompts = [];

        // NEW: Text animation settings
        this.textAnimation = {
            enabled: true,
            type: 'slide',  // bounce, fade, slide, scale, none
            intensity: 1.0
        };

        // NEW: Text styling (glow vs shadow/stroke)
        this.textStyle = {
            useGlow: false,  // Glow disabled by default
            useShadow: true, // Shadow enabled for better readability
            useStroke: true,
            shadowBlur: 15,
            shadowOffsetX: 3,
            shadowOffsetY: 3,
            shadowColor: '#000000',
            strokeWidth: 8,
            strokeColor: '#000000'
        };

        // NEW: 20+ Quality of Life Features
        this.backgroundColor = '#0a0a0a';
        this.useBackgroundGradient = false;
        this.backgroundGradient = {
            color1: '#0a0a0a',
            color2: '#1a1a1a',
            angle: 180
        };
        this.textFont = 'Arial';
        this.imageBorder = {
            enabled: false,
            width: 4,
            color: '#00d9ff'
        };
        this.watermark = {
            enabled: false,
            text: '',
            position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
            fontSize: 24,
            color: '#ffffff',
            opacity: 0.7
        };
        this.exportResolution = '1080p'; // 720p, 1080p, 4K
        this.previewSpeed = 1.0; // 0.5x, 1x, 1.5x, 2x
        this.performanceMode = false; // Lower quality for faster preview
        this.compactMode = false; // Hide advanced settings
        this.favorites = []; // Saved favorite configurations
        this.recentHistory = []; // Last 10 video settings
        this.maxHistoryItems = 10;
        this.currentPreset = 'balanced'; // fast, balanced, cinematic, viral

        // Keyboard shortcuts enabled
        this.keyboardShortcutsEnabled = true;

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
                    this.manualPromptSection.classList.add('hidden');
                } else if (e.target.value === 'manual') {
                    this.customPromptSection.classList.add('hidden');
                    this.manualPromptSection.classList.remove('hidden');
                    this.generateManualInputs();
                } else {
                    this.customPromptSection.classList.add('hidden');
                    this.manualPromptSection.classList.add('hidden');
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
                // Regenerate manual inputs if manual mode is active
                const manualRadio = document.querySelector('input[name="promptSource"][value="manual"]');
                if (manualRadio && manualRadio.checked) {
                    this.generateManualInputs();
                }
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

        // Image shadow controls
        const imageShadowEnabled = document.getElementById('imageShadowEnabled');
        const imageShadowBlur = document.getElementById('imageShadowBlur');
        const imageShadowBlurValue = document.getElementById('imageShadowBlurValue');
        const imageShadowOffsetY = document.getElementById('imageShadowOffsetY');
        const imageShadowOffsetYValue = document.getElementById('imageShadowOffsetYValue');

        if (imageShadowEnabled) {
            imageShadowEnabled.addEventListener('change', (e) => {
                this.imageShadow.enabled = e.target.checked;
            });
        }

        if (imageShadowBlur && imageShadowBlurValue) {
            imageShadowBlur.addEventListener('input', (e) => {
                this.imageShadow.blur = parseInt(e.target.value);
                imageShadowBlurValue.textContent = `${e.target.value}px`;
            });
        }

        if (imageShadowOffsetY && imageShadowOffsetYValue) {
            imageShadowOffsetY.addEventListener('input', (e) => {
                this.imageShadow.offsetY = parseInt(e.target.value);
                imageShadowOffsetYValue.textContent = `${e.target.value}px`;
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isPlaying) {
                    this.pause();
                } else if (this.assets.questions.length > 0) {
                    this.play();
                }
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                if (this.assets.questions.length > 0) {
                    this.restart();
                }
            } else if (e.code === 'KeyM') {
                e.preventDefault();
                this.toggleMute();
            } else if (e.code === 'KeyF') {
                e.preventDefault();
                this.toggleFullscreen();
            } else if (e.code === 'KeyL') {
                e.preventDefault();
                this.toggleLoop();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.seekRelative(-5);
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                this.seekRelative(5);
            }
        });

        // Setup enhanced controls
        this.setupEnhancedControls();
    }

    setupEnhancedControls() {
        // Timeline scrubber
        const timelineScrubber = document.getElementById('timelineScrubber');
        if (timelineScrubber) {
            timelineScrubber.addEventListener('input', (e) => {
                if (this.timeline.totalDuration > 0) {
                    const seekTime = (parseInt(e.target.value) / 100) * this.timeline.totalDuration;
                    this.seekTo(seekTime);
                }
            });
        }

        // Playback speed
        const playbackSpeed = document.getElementById('playbackSpeed');
        if (playbackSpeed) {
            playbackSpeed.addEventListener('change', (e) => {
                this.playbackSpeed = parseFloat(e.target.value);
                this.triggerAutoSave();
            });
        }

        // Canvas zoom
        const canvasZoom = document.getElementById('canvasZoom');
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasZoom && canvasContainer) {
            canvasZoom.addEventListener('change', (e) => {
                this.canvasZoom = parseFloat(e.target.value);
                canvasContainer.style.transform = `scale(${this.canvasZoom})`;
                canvasContainer.style.transformOrigin = 'top center';
                this.triggerAutoSave();
            });
        }

        // Individual volume controls
        const musicVolSlider = document.getElementById('musicVolSlider');
        const musicVolDisplay = document.getElementById('musicVolDisplay');
        if (musicVolSlider && musicVolDisplay) {
            musicVolSlider.addEventListener('input', (e) => {
                this.musicVolume = parseInt(e.target.value) / 100;
                musicVolDisplay.textContent = `${e.target.value}%`;
                if (this.assets.music) this.assets.music.volume = this.musicVolume;
                this.triggerAutoSave();
            });
        }

        const voiceVolSlider = document.getElementById('voiceVolSlider');
        const voiceVolDisplay = document.getElementById('voiceVolDisplay');
        if (voiceVolSlider && voiceVolDisplay) {
            voiceVolSlider.addEventListener('input', (e) => {
                this.voiceVolume = parseInt(e.target.value) / 100;
                voiceVolDisplay.textContent = `${e.target.value}%`;
                for (const question of this.assets.questions) {
                    if (question.voice) question.voice.volume = this.voiceVolume;
                }
                this.triggerAutoSave();
            });
        }

        const effectsVolSlider = document.getElementById('effectsVolSlider');
        const effectsVolDisplay = document.getElementById('effectsVolDisplay');
        if (effectsVolSlider && effectsVolDisplay) {
            effectsVolSlider.addEventListener('input', (e) => {
                this.effectsVolume = parseInt(e.target.value) / 100;
                effectsVolDisplay.textContent = `${e.target.value}%`;
                this.triggerAutoSave();
            });
        }

        // Loop button
        const loopBtn = document.getElementById('loopBtn');
        if (loopBtn) {
            loopBtn.addEventListener('click', () => this.toggleLoop());
        }

        // Mute button
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Export quality
        const exportQuality = document.getElementById('exportQuality');
        if (exportQuality) {
            exportQuality.addEventListener('change', (e) => {
                this.exportQuality = e.target.value;
                this.triggerAutoSave();
            });
        }

        // Export FPS
        const exportFPS = document.getElementById('exportFPS');
        if (exportFPS) {
            exportFPS.addEventListener('change', (e) => {
                this.exportFPS = parseInt(e.target.value);
                this.triggerAutoSave();
            });
        }

        // Quick presets
        document.getElementById('presetFast')?.addEventListener('click', () => this.loadPreset('fast'));
        document.getElementById('presetBalanced')?.addEventListener('click', () => this.loadPreset('balanced'));
        document.getElementById('presetCinematic')?.addEventListener('click', () => this.loadPreset('cinematic'));
        document.getElementById('presetMinimal')?.addEventListener('click', () => this.loadPreset('minimal'));

        // Shortcuts help toggle
        const shortcutsHeader = document.getElementById('shortcutsHeader');
        const shortcutsPanel = document.getElementById('shortcutsPanel');
        if (shortcutsHeader && shortcutsPanel) {
            shortcutsHeader.addEventListener('click', () => {
                shortcutsPanel.classList.toggle('hidden');
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Canvas filters
        this.setupFilter('filterBrightness', 'filterBrightnessValue', 'brightness', '%');
        this.setupFilter('filterContrast', 'filterContrastValue', 'contrast', '%');
        this.setupFilter('filterSaturation', 'filterSaturationValue', 'saturation', '%');
        this.setupFilter('filterBlur', 'filterBlurValue', 'blur', 'px');

        document.getElementById('resetFiltersBtn')?.addEventListener('click', () => this.resetFilters());

        // Color pickers
        document.getElementById('textColor')?.addEventListener('change', (e) => {
            this.customColors.text = e.target.value;
            this.triggerAutoSave();
        });
        document.getElementById('glowColor')?.addEventListener('change', (e) => {
            this.customColors.glow = e.target.value;
            this.triggerAutoSave();
        });
        document.getElementById('percentageWinColor')?.addEventListener('change', (e) => {
            this.customColors.percentageWin = e.target.value;
            this.triggerAutoSave();
        });
        document.getElementById('percentageLoseColor')?.addEventListener('change', (e) => {
            this.customColors.percentageLose = e.target.value;
            this.triggerAutoSave();
        });

        // Initialize colors from HTML inputs
        const textColorInput = document.getElementById('textColor');
        const glowColorInput = document.getElementById('glowColor');
        const percentageWinInput = document.getElementById('percentageWinColor');
        const percentageLoseInput = document.getElementById('percentageLoseColor');

        if (textColorInput) this.customColors.text = textColorInput.value;
        if (glowColorInput) this.customColors.glow = glowColorInput.value;
        if (percentageWinInput) this.customColors.percentageWin = percentageWinInput.value;
        if (percentageLoseInput) this.customColors.percentageLose = percentageLoseInput.value;

        // Animation easing
        document.getElementById('slideEasing')?.addEventListener('change', (e) => {
            this.animationEasing.slide = e.target.value;
            this.triggerAutoSave();
        });
        document.getElementById('fadeEasing')?.addEventListener('change', (e) => {
            this.animationEasing.fade = e.target.value;
            this.triggerAutoSave();
        });

        // Frame navigation
        document.getElementById('framePrevBtn')?.addEventListener('click', () => this.framePrevious());
        document.getElementById('frameNextBtn')?.addEventListener('click', () => this.frameNext());

        // Bookmark system
        document.getElementById('bookmarkBtn')?.addEventListener('click', () => this.toggleBookmark());
        document.getElementById('clearBookmarksBtn')?.addEventListener('click', () => this.clearBookmarks());

        // Snap to question
        document.getElementById('snapToQuestion')?.addEventListener('change', (e) => {
            this.snapToQuestion = e.target.checked;
        });

        // Export format
        document.getElementById('exportFormat')?.addEventListener('change', (e) => {
            this.exportFormat = e.target.value;
            this.triggerAutoSave();
        });

        // Auto-pause on blur
        document.getElementById('autoPauseOnBlur')?.addEventListener('change', (e) => {
            this.autoPauseOnBlur = e.target.checked;
        });

        // NEW: Food-only mode
        document.getElementById('foodOnlyMode')?.addEventListener('change', (e) => {
            this.foodOnlyMode = e.target.checked;
            // Make food modes mutually exclusive
            if (this.foodOnlyMode && this.simpleFastFoodMode) {
                this.simpleFastFoodMode = false;
                const simpleFastFoodCheckbox = document.getElementById('simpleFastFoodMode');
                if (simpleFastFoodCheckbox) simpleFastFoodCheckbox.checked = false;
            }
            this.triggerAutoSave();
        });

        // NEW: Simple fast food mode
        document.getElementById('simpleFastFoodMode')?.addEventListener('change', (e) => {
            this.simpleFastFoodMode = e.target.checked;
            // Make food modes mutually exclusive
            if (this.simpleFastFoodMode && this.foodOnlyMode) {
                this.foodOnlyMode = false;
                const foodOnlyCheckbox = document.getElementById('foodOnlyMode');
                if (foodOnlyCheckbox) foodOnlyCheckbox.checked = false;
            }
            this.triggerAutoSave();
        });

        // NEW: Keyboard shortcuts toggle
        document.getElementById('keyboardShortcutsToggle')?.addEventListener('change', (e) => {
            this.keyboardShortcutsEnabled = e.target.checked;
            console.log(`⌨️ Keyboard shortcuts ${e.target.checked ? 'enabled' : 'disabled'}`);
        });

        // NEW: Text animation
        document.getElementById('textAnimationEnabled')?.addEventListener('change', (e) => {
            this.textAnimation.enabled = e.target.checked;
            this.triggerAutoSave();
        });

        document.getElementById('textAnimationType')?.addEventListener('change', (e) => {
            this.textAnimation.type = e.target.value;
            this.triggerAutoSave();
        });

        this.setupSlider('textAnimationIntensity', 'textAnimationIntensityValue', (value) => {
            this.textAnimation.intensity = parseFloat(value);
            this.triggerAutoSave();
        }, '', 1);

        // NEW: Text styling
        document.getElementById('textUseGlow')?.addEventListener('change', (e) => {
            this.textStyle.useGlow = e.target.checked;
            this.triggerAutoSave();
        });

        document.getElementById('textUseShadow')?.addEventListener('change', (e) => {
            this.textStyle.useShadow = e.target.checked;
            const shadowSettings = document.getElementById('shadowSettings');
            if (shadowSettings) {
                shadowSettings.style.display = e.target.checked ? 'block' : 'none';
            }
            this.triggerAutoSave();
        });

        document.getElementById('textUseStroke')?.addEventListener('change', (e) => {
            this.textStyle.useStroke = e.target.checked;
            const strokeSettings = document.getElementById('strokeSettings');
            if (strokeSettings) {
                strokeSettings.style.display = e.target.checked ? 'block' : 'none';
            }
            this.triggerAutoSave();
        });

        // Shadow settings
        this.setupSlider('textShadowBlur', 'textShadowBlurValue', (value) => {
            this.textStyle.shadowBlur = parseInt(value);
            this.triggerAutoSave();
        }, 'px');

        this.setupSlider('textShadowOffsetX', 'textShadowOffsetXValue', (value) => {
            this.textStyle.shadowOffsetX = parseInt(value);
            this.triggerAutoSave();
        }, 'px');

        this.setupSlider('textShadowOffsetY', 'textShadowOffsetYValue', (value) => {
            this.textStyle.shadowOffsetY = parseInt(value);
            this.triggerAutoSave();
        }, 'px');

        document.getElementById('textShadowColor')?.addEventListener('change', (e) => {
            this.textStyle.shadowColor = e.target.value;
            this.triggerAutoSave();
        });

        // Stroke settings
        this.setupSlider('textStrokeWidth', 'textStrokeWidthValue', (value) => {
            this.textStyle.strokeWidth = parseInt(value);
            this.triggerAutoSave();
        }, 'px');

        document.getElementById('textStrokeColor')?.addEventListener('change', (e) => {
            this.textStyle.strokeColor = e.target.value;
            this.triggerAutoSave();
        });

        window.addEventListener('blur', () => {
            if (this.autoPauseOnBlur && this.isPlaying) {
                this.pause();
                this.wasPlayingBeforeBlur = true;
            }
        });

        window.addEventListener('focus', () => {
            if (this.wasPlayingBeforeBlur && this.assets.questions.length > 0) {
                this.play();
                this.wasPlayingBeforeBlur = false;
            }
        });

        // NEW: Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (!this.keyboardShortcutsEnabled) return;

            // Ignore if user is typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            switch(e.key.toLowerCase()) {
                case ' ': // Space - Play/Pause
                    e.preventDefault();
                    if (this.isPlaying) this.pause();
                    else this.play();
                    break;
                case 'r': // R - Restart
                    if (e.ctrlKey || e.metaKey) return; // Don't intercept Ctrl+R (reload)
                    e.preventDefault();
                    this.restart();
                    break;
                case 'f': // F - Frame forward
                    e.preventDefault();
                    this.frameNext();
                    break;
                case 'b': // B - Frame backward
                    e.preventDefault();
                    this.framePrevious();
                    break;
                case 'm': // M - Toggle mute
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 's': // S - Save config (Ctrl+S)
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.saveConfig();
                    }
                    break;
                case 'g': // G - Generate video
                    if (e.ctrlKey || e.metaKey) return;
                    e.preventDefault();
                    this.generateVideo();
                    break;
                case 'arrowleft': // Left arrow - Seek backward 5s
                    e.preventDefault();
                    this.seekTo(Math.max(0, this.currentTime - 5));
                    break;
                case 'arrowright': // Right arrow - Seek forward 5s
                    e.preventDefault();
                    this.seekTo(Math.min(this.timeline.totalDuration, this.currentTime + 5));
                    break;
                case 'k': // K - Toggle bookmark
                    e.preventDefault();
                    this.toggleBookmark();
                    break;
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    // Number keys - Jump to percentage (0=0%, 1=10%, ..., 9=90%)
                    e.preventDefault();
                    const percent = parseInt(e.key) * 10;
                    this.seekTo((this.timeline.totalDuration * percent) / 100);
                    break;
            }
        });

        // Undo/Redo
        document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
        document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());

        // NEW: Prompt Manager Button
        document.getElementById('promptManagerBtn')?.addEventListener('click', () => this.openPromptManager());

        // NEW: Favorites Manager Button
        document.getElementById('favoritesManagerBtn')?.addEventListener('click', () => this.openFavoritesManager());

        // NEW: Additional functional buttons
        document.getElementById('exportStatsBtn')?.addEventListener('click', () => this.exportStats());
        document.getElementById('resetAllBtn')?.addEventListener('click', () => this.resetAllSettings());
        document.getElementById('duplicateSettingsBtn')?.addEventListener('click', () => this.duplicateCurrentSettings());
        document.getElementById('exportMetadataBtn')?.addEventListener('click', () => this.exportVideoMetadata());
        document.getElementById('quickExportBtn')?.addEventListener('click', () => this.quickExportVideo());

        // Load saved settings
        this.loadEnhancedSettings();
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

    setupSlider(sliderId, valueId, callback, suffix = '', decimals = 0) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);

        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const displayValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value);
                valueDisplay.textContent = `${displayValue}${suffix}`;
                callback(value);
            });
        }
    }

    loadAPIKeys() {
        // Load from localStorage first
        const savedUnsplash = localStorage.getItem('unsplashApiKey');
        const savedElevenlabs = localStorage.getItem('elevenlabsApiKey');

        if (savedUnsplash) {
            this.unsplashKey = savedUnsplash;
            this.unsplashKeyInput.value = savedUnsplash;
        } else {
            // Set default API keys if none saved
            this.unsplashKeyInput.value = this.unsplashKey;
        }

        if (savedElevenlabs) {
            this.elevenlabsKey = savedElevenlabs;
            this.elevenlabsKeyInput.value = savedElevenlabs;
        } else {
            // Set default API keys if none saved
            this.elevenlabsKeyInput.value = this.elevenlabsKey;
        }

        // Load from config file (can override)
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
    }

    saveAPIKeys() {
        this.unsplashKey = this.unsplashKeyInput.value.trim();
        this.elevenlabsKey = this.elevenlabsKeyInput.value.trim();

        if (this.unsplashKey) localStorage.setItem('unsplashApiKey', this.unsplashKey);
        if (this.elevenlabsKey) localStorage.setItem('elevenlabsApiKey', this.elevenlabsKey);
    }

    generateManualInputs() {
        if (!this.manualPromptsContainer) return;

        // Save existing values first
        const existingValues = [];
        const existingInputs = this.manualPromptsContainer.querySelectorAll('.manual-prompt-pair');
        existingInputs.forEach((pair, index) => {
            const opt1 = pair.querySelector('.manual-option1')?.value || '';
            const opt2 = pair.querySelector('.manual-option2')?.value || '';
            existingValues[index] = { opt1, opt2 };
        });

        // Clear container
        this.manualPromptsContainer.innerHTML = '';

        // Generate inputs for each question
        for (let i = 0; i < this.questionCount; i++) {
            const pairDiv = document.createElement('div');
            pairDiv.className = 'manual-prompt-pair';
            pairDiv.style.cssText = 'margin-bottom: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);';

            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = `Question ${i + 1}:`;
            label.style.marginBottom = '0.5rem';
            label.style.display = 'block';
            label.style.fontWeight = '600';
            label.style.color = 'var(--primary-accent)';

            const opt1 = document.createElement('input');
            opt1.type = 'text';
            opt1.className = 'form-input mb-sm manual-option1';
            opt1.placeholder = `Option 1 (e.g., Pizza)`;
            opt1.value = existingValues[i]?.opt1 || '';
            opt1.style.marginBottom = '0.5rem';

            const opt2 = document.createElement('input');
            opt2.type = 'text';
            opt2.className = 'form-input manual-option2';
            opt2.placeholder = `Option 2 (e.g., Burger)`;
            opt2.value = existingValues[i]?.opt2 || '';

            pairDiv.appendChild(label);
            pairDiv.appendChild(opt1);
            pairDiv.appendChild(opt2);
            this.manualPromptsContainer.appendChild(pairDiv);
        }

        console.log(`✅ Generated ${this.questionCount} manual input fields`);
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
            },
            imageShadow: { ...this.imageShadow },
            foodOnlyMode: this.foodOnlyMode,
            textAnimation: { ...this.textAnimation },
            textStyle: { ...this.textStyle },
            customColors: { ...this.customColors },
            canvasFilters: { ...this.canvasFilters }
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

            // Load image shadow settings
            if (config.imageShadow) {
                this.imageShadow = { ...this.imageShadow, ...config.imageShadow };

                const imageShadowEnabled = document.getElementById('imageShadowEnabled');
                const imageShadowBlur = document.getElementById('imageShadowBlur');
                const imageShadowBlurValue = document.getElementById('imageShadowBlurValue');
                const imageShadowOffsetY = document.getElementById('imageShadowOffsetY');
                const imageShadowOffsetYValue = document.getElementById('imageShadowOffsetYValue');

                if (imageShadowEnabled && config.imageShadow.enabled !== undefined) {
                    imageShadowEnabled.checked = config.imageShadow.enabled;
                }
                if (imageShadowBlur && imageShadowBlurValue && config.imageShadow.blur !== undefined) {
                    imageShadowBlur.value = config.imageShadow.blur;
                    imageShadowBlurValue.textContent = `${config.imageShadow.blur}px`;
                }
                if (imageShadowOffsetY && imageShadowOffsetYValue && config.imageShadow.offsetY !== undefined) {
                    imageShadowOffsetY.value = config.imageShadow.offsetY;
                    imageShadowOffsetYValue.textContent = `${config.imageShadow.offsetY}px`;
                }
            }

            // Load food-only mode
            if (config.foodOnlyMode !== undefined) {
                this.foodOnlyMode = config.foodOnlyMode;
                const foodOnlyModeCheckbox = document.getElementById('foodOnlyMode');
                if (foodOnlyModeCheckbox) {
                    foodOnlyModeCheckbox.checked = config.foodOnlyMode;
                }
            }

            // Load text animation settings
            if (config.textAnimation) {
                this.textAnimation = { ...this.textAnimation, ...config.textAnimation };

                const textAnimationEnabled = document.getElementById('textAnimationEnabled');
                const textAnimationType = document.getElementById('textAnimationType');
                const textAnimationIntensity = document.getElementById('textAnimationIntensity');
                const textAnimationIntensityValue = document.getElementById('textAnimationIntensityValue');

                if (textAnimationEnabled && config.textAnimation.enabled !== undefined) {
                    textAnimationEnabled.checked = config.textAnimation.enabled;
                }
                if (textAnimationType && config.textAnimation.type) {
                    textAnimationType.value = config.textAnimation.type;
                }
                if (textAnimationIntensity && textAnimationIntensityValue && config.textAnimation.intensity !== undefined) {
                    textAnimationIntensity.value = config.textAnimation.intensity;
                    textAnimationIntensityValue.textContent = config.textAnimation.intensity.toFixed(1);
                }
            }

            // Load text styling settings
            if (config.textStyle) {
                this.textStyle = { ...this.textStyle, ...config.textStyle };

                const textUseGlow = document.getElementById('textUseGlow');
                const textUseShadow = document.getElementById('textUseShadow');
                const textUseStroke = document.getElementById('textUseStroke');
                const shadowSettings = document.getElementById('shadowSettings');
                const strokeSettings = document.getElementById('strokeSettings');

                if (textUseGlow && config.textStyle.useGlow !== undefined) {
                    textUseGlow.checked = config.textStyle.useGlow;
                }
                if (textUseShadow && config.textStyle.useShadow !== undefined) {
                    textUseShadow.checked = config.textStyle.useShadow;
                    if (shadowSettings) {
                        shadowSettings.style.display = config.textStyle.useShadow ? 'block' : 'none';
                    }
                }
                if (textUseStroke && config.textStyle.useStroke !== undefined) {
                    textUseStroke.checked = config.textStyle.useStroke;
                    if (strokeSettings) {
                        strokeSettings.style.display = config.textStyle.useStroke ? 'block' : 'none';
                    }
                }

                // Shadow settings
                if (config.textStyle.shadowBlur !== undefined) {
                    const textShadowBlur = document.getElementById('textShadowBlur');
                    const textShadowBlurValue = document.getElementById('textShadowBlurValue');
                    if (textShadowBlur && textShadowBlurValue) {
                        textShadowBlur.value = config.textStyle.shadowBlur;
                        textShadowBlurValue.textContent = `${config.textStyle.shadowBlur}px`;
                    }
                }
                if (config.textStyle.shadowOffsetX !== undefined) {
                    const textShadowOffsetX = document.getElementById('textShadowOffsetX');
                    const textShadowOffsetXValue = document.getElementById('textShadowOffsetXValue');
                    if (textShadowOffsetX && textShadowOffsetXValue) {
                        textShadowOffsetX.value = config.textStyle.shadowOffsetX;
                        textShadowOffsetXValue.textContent = `${config.textStyle.shadowOffsetX}px`;
                    }
                }
                if (config.textStyle.shadowOffsetY !== undefined) {
                    const textShadowOffsetY = document.getElementById('textShadowOffsetY');
                    const textShadowOffsetYValue = document.getElementById('textShadowOffsetYValue');
                    if (textShadowOffsetY && textShadowOffsetYValue) {
                        textShadowOffsetY.value = config.textStyle.shadowOffsetY;
                        textShadowOffsetYValue.textContent = `${config.textStyle.shadowOffsetY}px`;
                    }
                }
                if (config.textStyle.shadowColor) {
                    const textShadowColor = document.getElementById('textShadowColor');
                    if (textShadowColor) {
                        textShadowColor.value = config.textStyle.shadowColor;
                    }
                }

                // Stroke settings
                if (config.textStyle.strokeWidth !== undefined) {
                    const textStrokeWidth = document.getElementById('textStrokeWidth');
                    const textStrokeWidthValue = document.getElementById('textStrokeWidthValue');
                    if (textStrokeWidth && textStrokeWidthValue) {
                        textStrokeWidth.value = config.textStyle.strokeWidth;
                        textStrokeWidthValue.textContent = `${config.textStyle.strokeWidth}px`;
                    }
                }
                if (config.textStyle.strokeColor) {
                    const textStrokeColor = document.getElementById('textStrokeColor');
                    if (textStrokeColor) {
                        textStrokeColor.value = config.textStyle.strokeColor;
                    }
                }
            }

            // Load custom colors
            if (config.customColors) {
                this.customColors = { ...this.customColors, ...config.customColors };

                const textColor = document.getElementById('textColor');
                const glowColor = document.getElementById('glowColor');
                const percentageWinColor = document.getElementById('percentageWinColor');
                const percentageLoseColor = document.getElementById('percentageLoseColor');

                if (textColor && config.customColors.text) textColor.value = config.customColors.text;
                if (glowColor && config.customColors.glow) glowColor.value = config.customColors.glow;
                if (percentageWinColor && config.customColors.percentageWin) percentageWinColor.value = config.customColors.percentageWin;
                if (percentageLoseColor && config.customColors.percentageLose) percentageLoseColor.value = config.customColors.percentageLose;
            }

            // Load canvas filters
            if (config.canvasFilters) {
                this.canvasFilters = { ...this.canvasFilters, ...config.canvasFilters };
                this.applyCanvasFilters();

                if (config.canvasFilters.brightness !== undefined) {
                    const filterBrightness = document.getElementById('filterBrightness');
                    const filterBrightnessValue = document.getElementById('filterBrightnessValue');
                    if (filterBrightness && filterBrightnessValue) {
                        filterBrightness.value = config.canvasFilters.brightness;
                        filterBrightnessValue.textContent = `${config.canvasFilters.brightness}%`;
                    }
                }
                if (config.canvasFilters.contrast !== undefined) {
                    const filterContrast = document.getElementById('filterContrast');
                    const filterContrastValue = document.getElementById('filterContrastValue');
                    if (filterContrast && filterContrastValue) {
                        filterContrast.value = config.canvasFilters.contrast;
                        filterContrastValue.textContent = `${config.canvasFilters.contrast}%`;
                    }
                }
                if (config.canvasFilters.saturation !== undefined) {
                    const filterSaturation = document.getElementById('filterSaturation');
                    const filterSaturationValue = document.getElementById('filterSaturationValue');
                    if (filterSaturation && filterSaturationValue) {
                        filterSaturation.value = config.canvasFilters.saturation;
                        filterSaturationValue.textContent = `${config.canvasFilters.saturation}%`;
                    }
                }
                if (config.canvasFilters.blur !== undefined) {
                    const filterBlur = document.getElementById('filterBlur');
                    const filterBlurValue = document.getElementById('filterBlurValue');
                    if (filterBlur && filterBlurValue) {
                        filterBlur.value = config.canvasFilters.blur;
                        filterBlurValue.textContent = `${config.canvasFilters.blur}px`;
                    }
                }
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
                const randomPrompts = this.promptManager.getRandomPrompts(this.questionCount - 1, this.foodOnlyMode, this.simpleFastFoodMode);
                regularQuestions = [
                    { option1: opt1, option2: opt2 },
                    ...randomPrompts
                ];
            } else if (promptSource === 'manual') {
                // Read manual inputs
                regularQuestions = [];
                const manualPairs = this.manualPromptsContainer.querySelectorAll('.manual-prompt-pair');

                for (let i = 0; i < manualPairs.length; i++) {
                    const opt1 = manualPairs[i].querySelector('.manual-option1')?.value.trim();
                    const opt2 = manualPairs[i].querySelector('.manual-option2')?.value.trim();

                    if (!opt1 || !opt2) {
                        alert(`Please enter both options for Question ${i + 1}`);
                        this.generateBtn.disabled = false;
                        return;
                    }

                    regularQuestions.push({ option1: opt1, option2: opt2 });
                }
            } else {
                regularQuestions = this.promptManager.getRandomPrompts(this.questionCount, this.foodOnlyMode, this.simpleFastFoodMode);
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

            // Enable timeline scrubber and frame navigation
            const timelineScrubber = document.getElementById('timelineScrubber');
            if (timelineScrubber) timelineScrubber.disabled = false;

            const framePrevBtn = document.getElementById('framePrevBtn');
            const frameNextBtn = document.getElementById('frameNextBtn');
            const bookmarkBtn = document.getElementById('bookmarkBtn');
            if (framePrevBtn) framePrevBtn.disabled = false;
            if (frameNextBtn) frameNextBtn.disabled = false;
            if (bookmarkBtn) bookmarkBtn.disabled = false;

            // Update displays and timeline markers
            this.updateTimeDisplay();
            this.updateTimelineMarkers();

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
            // Don't use crossOrigin for local images - it breaks them!
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log('✅ Background image loaded successfully');
                    resolve();
                };
                img.onerror = (e) => {
                    console.error('❌ Background image failed to load:', e);
                    reject(new Error('Failed to load background'));
                };
                img.src = '/assets/images/or.png';
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
                'comment': '/assets/images/engagement/comment.svg',
                'reject': '/assets/images/engagement/reject.svg',
                'marry': '/assets/images/engagement/marry.svg'
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

    // Smart keyword translation for better Unsplash results
    translateToSearchKeyword(promptText) {
        const text = promptText.toLowerCase();

        // Keyword mapping for better Unsplash search results
        const keywordMap = {
            // Time-based
            'wake up early': 'sunrise morning', 'morning person': 'sunrise', 'early bird': 'morning coffee',
            'stay up late': 'night city', 'night owl': 'moon night', 'sleep in late': 'sleeping',

            // Tech & Media
            'watch dubbed': 'cinema', 'read subtitles': 'movie theater', 'dark mode': 'dark screen',
            'light mode': 'bright screen', 'send gifs': 'phone texting', 'send emojis': 'smartphone',
            'watch memes': 'smartphone laughing', 'watch videos': 'video streaming',

            // Food
            'extremely spicy': 'chili peppers', 'super mild': 'bland food', 'extra cheese': 'cheese',
            'no cheese': 'salad', 'extra mayo': 'sandwich', 'extra hot sauce': 'hot sauce',
            'pizza with pineapple': 'pizza', 'pizza without pineapple': 'pepperoni pizza',
            'thin crust pizza': 'pizza', 'deep dish pizza': 'chicago pizza',

            // Lifestyle
            'cozy night in': 'cozy home', 'fancy date out': 'restaurant', 'party every weekend': 'party',
            'relax at home': 'relaxing sofa', 'quiet nights in': 'cozy evening',

            // Daily life
            'clean as you go': 'cleaning', 'deep clean weekly': 'cleaning', 'make bed daily': 'bed',
            'leave it messy': 'messy room', 'organized closet': 'organized', 'messy pile': 'clutter',

            // Relationships
            'know all passwords': 'password', 'respect privacy': 'privacy', 'attached at hip': 'couple',
            'healthy independence': 'independent', 'say i love you daily': 'love', 'show it with actions': 'helping',
            'big fancy wedding': 'wedding', 'intimate elopement': 'couple beach',

            // Career & Money
            'follow your passion': 'artist', 'follow the money': 'money', 'work to live': 'vacation',
            'live to work': 'office desk', 'hustle culture': 'busy office', 'work-life balance': 'balance',
            'minimum wage happy job': 'happy worker', 'six figures miserable job': 'stressed',
            'entrepreneur risk': 'startup', 'employee security': 'office', '$1 million right now': 'money cash',
            '$10k every month forever': 'passive income', 'dream job low salary': 'creative work',
            'boring job high salary': 'corporate office',

            // Philosophy
            'create your path': 'hiking path', 'believe in destiny': 'fortune', 'everything connected': 'network',
            'everything separate': 'alone', 'know how you die': 'hourglass', 'know when you die': 'calendar',
            'edit your past': 'old photo', 'see your future': 'future', 'restart life from birth': 'baby',
            'continue from now': 'forward', 'always 5 minutes early': 'clock punctual',
            'always 5 minutes late': 'late running',

            // More concepts
            'debt free average': 'simple living', 'luxury life with debt': 'luxury', 'rich but alone': 'mansion',
            'poor but loved': 'family', 'brutally honest': 'honest', 'tactfully kind': 'kindness',
            'logic over emotion': 'logic', 'emotion over logic': 'emotion', 'organized chaos': 'creative',
            'everything has place': 'organized', '5 year plan': 'planning', 'present moment': 'meditation',
            'go with flow': 'river', 'never hungover': 'healthy', 'worth the hangover': 'party',
            'track everything': 'fitness tracker', 'live freely': 'freedom',

            // More specific prompts
            'physical paper books': 'books', 'digital e-books': 'ebook reader', 'public library': 'library',
            'buy at bookstore': 'bookstore', 'online college courses': 'online learning',
            'traditional campus': 'university campus', 'study alone quietly': 'studying',
            'study group sessions': 'study group', 'handwritten notes': 'writing notes',
            'laptop typing': 'laptop', 'coffee while studying': 'coffee study',
            'tea while learning': 'tea studying',

            // Drinks
            'iced coffee': 'iced coffee', 'hot coffee': 'hot coffee', 'black coffee': 'black coffee',
            'sweet latte': 'latte', 'expensive coffee shop': 'coffee shop', 'home brewed': 'coffee maker',
            'never drink alcohol': 'water', 'drink socially': 'drinks', 'wine connoisseur': 'wine',
            'beer enthusiast': 'beer', 'craft beer': 'craft beer', 'cheap beer': 'beer',

            // Personality traits
            'minimalist lifestyle': 'minimalist', 'collector of things': 'collection',
            'spontaneous plans': 'spontaneous', 'organized schedule': 'planner',
            'risk taker': 'adventure', 'play it safe': 'safety',

            // Entertainment
            'marvel movies': 'marvel', 'dc comics': 'dc comics', 'star wars': 'star wars',
            'star trek': 'star trek', 'harry potter': 'harry potter', 'lord of the rings': 'lotr',
            'scary horror': 'horror', 'funny comedy': 'comedy', 'binge entire season': 'binge watching',
            'watch weekly episodes': 'tv watching',

            // Gaming
            'single player story': 'gaming', 'online multiplayer': 'multiplayer gaming',
            'role-playing rpg': 'rpg game', 'first person shooter': 'fps gaming',
            'mobile phone games': 'mobile gaming', 'console gaming': 'console',
        };

        // Check exact match
        if (keywordMap[text]) {
            return keywordMap[text];
        }

        // Extract meaningful words (remove common words)
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                            'of', 'with', 'by', 'from', 'up', 'all', 'your', 'you', 'it', 'every',
                            'vs', 'versus', 'always', 'never'];

        const words = text.split(/\s+/).filter(word =>
            word.length > 2 && !commonWords.includes(word)
        );

        // Use first 2 meaningful words
        if (words.length > 0) {
            return words.slice(0, 2).join(' ');
        }

        // Fallback
        return promptText;
    }

    getFallbackKeywords(originalQuery, translatedKeyword) {
        const text = originalQuery.toLowerCase();

        // Context-aware fallbacks based on common themes
        const contextFallbacks = {
            // Sleep/Time related
            'wake up early': ['sunrise', 'morning', 'dawn', 'breakfast'],
            'stay up late': ['night', 'moon', 'stars', 'city lights'],
            'morning person': ['sunrise', 'coffee', 'morning'],
            'night owl': ['moon', 'night sky', 'stars'],

            // Food related
            'unsweetened': ['tea', 'coffee', 'drink', 'beverage'],
            'sweetened': ['dessert', 'candy', 'sugar'],
            'pizza': ['food', 'italian', 'dinner'],
            'burger': ['food', 'restaurant', 'meal'],

            // Entertainment
            'watch dubbed': ['cinema', 'theater', 'movie', 'film'],
            'read subtitles': ['movie theater', 'cinema', 'screen'],
            'watch subbed': ['cinema', 'movie', 'screen'],

            // Technology
            'know all passwords': ['security', 'computer', 'digital'],
            'respect privacy': ['privacy', 'security', 'protection'],
            'type': ['keyboard', 'computer', 'typing'],
            'handwrite': ['pen', 'paper', 'writing'],

            // Lifestyle
            'work to live': ['beach', 'vacation', 'relaxation'],
            'live to work': ['office', 'desk', 'work'],
            'rich but alone': ['mansion', 'luxury', 'wealth'],
            'poor but loved': ['family', 'friends', 'together'],
            'city life': ['city', 'urban', 'skyline'],
            'country life': ['nature', 'countryside', 'rural'],

            // Social
            'introvert': ['alone', 'solitude', 'quiet'],
            'extrovert': ['party', 'people', 'social'],
            'alone': ['solitude', 'peaceful', 'quiet'],
            'company': ['friends', 'people', 'group'],

            // Travel
            'beach vacation': ['beach', 'ocean', 'sand'],
            'mountain vacation': ['mountain', 'hiking', 'nature'],
            'travel': ['adventure', 'journey', 'explore'],
            'staycation': ['home', 'cozy', 'comfort'],

            // Seasons
            'summer': ['sun', 'beach', 'warm'],
            'winter': ['snow', 'cold', 'ice'],
            'spring': ['flowers', 'bloom', 'nature'],
            'fall': ['autumn', 'leaves', 'orange'],

            // Activities
            'read': ['book', 'library', 'reading'],
            'watch': ['screen', 'television', 'movie'],
            'exercise': ['gym', 'fitness', 'workout'],
            'relax': ['peaceful', 'calm', 'rest'],

            // General concepts
            'win': ['victory', 'success', 'champion'],
            'lose': ['defeat', 'failure', 'sad'],
            'love': ['heart', 'romance', 'couple'],
            'hate': ['angry', 'frustration', 'rage']
        };

        // Try to find specific fallbacks
        for (const [key, fallbacks] of Object.entries(contextFallbacks)) {
            if (text.includes(key)) {
                return fallbacks;
            }
        }

        // Extract individual words as fallbacks
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'be', 'all', 'your'];
        const words = text.split(/\s+/).filter(word =>
            word.length > 3 && !commonWords.includes(word)
        );

        // Generic fallbacks that usually work
        const genericFallbacks = ['abstract', 'minimal', 'texture', 'pattern', 'color', 'background'];

        return [...words, ...genericFallbacks];
    }

    async fetchQuestionImages(option1, option2) {
        const fetchImage = async (query) => {
            // Translate to better search keyword
            const searchKeyword = this.translateToSearchKeyword(query);
            const fallbacks = this.getFallbackKeywords(query, searchKeyword);

            console.log(`🔍 Image search for "${query}": primary="${searchKeyword}", fallbacks=[${fallbacks.slice(0, 3).join(', ')}...]`);

            // Try primary keyword and fallbacks
            const keywordsToTry = [searchKeyword, ...fallbacks];

            for (let i = 0; i < keywordsToTry.length; i++) {
                const keyword = keywordsToTry[i];

                try {
                    const url = new URL('https://api.unsplash.com/search/photos');
                    url.searchParams.append('query', keyword);
                    url.searchParams.append('per_page', 1);
                    url.searchParams.append('orientation', 'squarish');

                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Client-ID ${this.unsplashKey}`
                        }
                    });

                    if (!response.ok) {
                        console.warn(`⚠️ API error for "${keyword}": ${response.status}`);
                        continue;
                    }

                    const data = await response.json();

                    if (data.results.length === 0) {
                        console.warn(`⚠️ No results for "${keyword}", trying next fallback...`);
                        continue;
                    }

                    // Success!
                    if (i > 0) {
                        console.log(`✅ Found image using fallback "${keyword}" (attempt ${i + 1})`);
                    } else {
                        console.log(`✅ Found image using primary keyword "${keyword}"`);
                    }

                    return data.results[0].urls.regular;

                } catch (error) {
                    console.warn(`⚠️ Error trying "${keyword}":`, error.message);
                    if (i === keywordsToTry.length - 1) {
                        throw new Error(`Failed to find image for "${query}" after trying ${keywordsToTry.length} keywords`);
                    }
                }
            }

            throw new Error(`No images found for "${query}" after trying all fallbacks`);
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
            voiceAudio.volume = this.voiceVolume; // Apply voice volume setting

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
            // Only use crossOrigin for external URLs (like Unsplash)
            if (url.startsWith('http://') || url.startsWith('https://')) {
                img.crossOrigin = 'anonymous';
            }
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }

    async loadAudioAssets() {
        try {
            this.assets.music = new Audio('/assets/audio/music.mp3');
            await this.waitForAudioLoad(this.assets.music);

            this.assets.clockSound = new Audio('/assets/audio/clock.mp3');
            await this.waitForAudioLoad(this.assets.clockSound);

            this.assets.dingSound = new Audio('/assets/audio/ding.mp3');
            await this.waitForAudioLoad(this.assets.dingSound);

            this.assets.swooshSound = new Audio('/assets/audio/swoosh.mp3');
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

        // Start or resume music
        if (this.assets.music) {
            this.assets.music.loop = true;
            this.assets.music.volume = this.musicVolume;
            this.assets.music.currentTime = this.currentTime; // Seek to correct position
            this.assets.music.play().catch(e => console.log('Music play error:', e));
        }

        // Schedule audio events only for future events
        for (let i = 0; i < this.timeline.questions.length; i++) {
            const qt = this.timeline.questions[i];
            const question = this.assets.questions[i];

            // Voice audio
            if (question.voice) {
                const voiceStart = qt.voiceStart;
                const voiceEnd = voiceStart + question.voice.duration;

                if (this.currentTime < voiceEnd) {
                    if (this.currentTime >= voiceStart) {
                        // Already started, resume from current position
                        question.voice.currentTime = this.currentTime - voiceStart;
                        question.voice.play().catch(e => console.log('Voice play error:', e));
                    } else {
                        // Schedule for future
                        const delay = (voiceStart - this.currentTime) * 1000;
                        const timeoutId = setTimeout(() => {
                            if (this.isPlaying) {
                                question.voice.currentTime = 0;
                                question.voice.play().catch(e => console.log('Voice play error:', e));
                            }
                        }, delay);
                        this.scheduledTimeouts.push(timeoutId);
                    }
                }
            }

            // Clock sound
            if (this.assets.clockSound && this.currentTime < qt.clockStart) {
                const delay = (qt.clockStart - this.currentTime) * 1000;
                const timeoutId = setTimeout(() => {
                    if (this.isPlaying) {
                        const clockClone = this.assets.clockSound.cloneNode();
                        clockClone.volume = this.effectsVolume; // Apply effects volume
                        clockClone.play().catch(e => console.log('Clock play error:', e));
                    }
                }, delay);
                this.scheduledTimeouts.push(timeoutId);
            }

            // Ding sound
            if (this.assets.dingSound && this.currentTime < qt.dingStart) {
                const delay = (qt.dingStart - this.currentTime) * 1000;
                const timeoutId = setTimeout(() => {
                    if (this.isPlaying) {
                        const dingClone = this.assets.dingSound.cloneNode();
                        dingClone.volume = this.effectsVolume; // Apply effects volume
                        dingClone.play().catch(e => console.log('Ding play error:', e));
                    }
                }, delay);
                this.scheduledTimeouts.push(timeoutId);
            }

            // Swoosh sound
            if (this.assets.swooshSound && this.currentTime < qt.swooshStart) {
                const delay = (qt.swooshStart - this.currentTime) * 1000;
                const timeoutId = setTimeout(() => {
                    if (this.isPlaying) {
                        const swooshClone = this.assets.swooshSound.cloneNode();
                        swooshClone.volume = this.effectsVolume; // Apply effects volume
                        swooshClone.play().catch(e => console.log('Swoosh play error:', e));
                    }
                }, delay);
                this.scheduledTimeouts.push(timeoutId);
            }
        }
    }

    pause() {
        this.isPlaying = false;

        // Clear all scheduled timeouts
        for (const timeoutId of this.scheduledTimeouts) {
            clearTimeout(timeoutId);
        }
        this.scheduledTimeouts = [];

        // Pause all audio
        if (this.assets.music) this.assets.music.pause();

        for (const question of this.assets.questions) {
            if (question.voice) question.voice.pause();
        }

        // Cancel animation frame
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

        this.currentTime = (Date.now() - this.startTime) / 1000 * this.playbackSpeed;

        if (this.currentTime >= this.timeline.totalDuration) {
            // Video completed
            this.currentTime = this.timeline.totalDuration;
            this.renderFrame(this.currentTime);
            this.updateTimeDisplay();

            if (this.loopEnabled) {
                // Loop back to start
                console.log('🔁 Looping video...');
                this.restart();
            } else {
                this.pause();
                console.log('✅ Video playback completed');
            }
            return;
        }

        this.renderFrame(this.currentTime);
        this.updateTimeDisplay();
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

        // NEW: Apply text animation
        this.ctx.save();
        if (this.textAnimation.enabled && progress < 1) {
            const animProgress = progress * this.textAnimation.intensity;

            switch (this.textAnimation.type) {
                case 'bounce':
                    // Bounce effect - text bounces in from above
                    const bounceOffset = Math.sin((1 - animProgress) * Math.PI) * 50 * this.textAnimation.intensity;
                    this.ctx.translate(0, -bounceOffset);
                    break;

                case 'scale':
                    // Scale effect - text grows from small to normal
                    const scale = 0.5 + (animProgress * 0.5);
                    this.ctx.translate(this.width / 2, textY);
                    this.ctx.scale(scale, scale);
                    this.ctx.translate(-this.width / 2, -textY);
                    break;

                case 'fade':
                    // Fade effect - text fades in (already handled by globalAlpha)
                    break;

                case 'slide':
                    // Slide effect - text slides from side (already handled above)
                    break;
            }
        }

        // NEW: Apply text styling (glow vs shadow/stroke)
        this.ctx.save();

        // Apply glow if enabled
        if (this.textStyle.useGlow) {
            this.ctx.shadowColor = this.customColors.glow;
            this.ctx.shadowBlur = 25;
        }

        // Apply shadow if enabled
        if (this.textStyle.useShadow) {
            this.ctx.shadowColor = this.textStyle.shadowColor;
            this.ctx.shadowBlur = this.textStyle.shadowBlur;
            this.ctx.shadowOffsetX = this.textStyle.shadowOffsetX;
            this.ctx.shadowOffsetY = this.textStyle.shadowOffsetY;
        }

        // Use wrapped text with stroke settings
        const strokeWidth = this.textStyle.useStroke ? this.textStyle.strokeWidth : 0;
        const strokeColor = this.textStyle.useStroke ? this.textStyle.strokeColor : '#000';

        this.drawStrokedTextWrapped(
            text,
            this.width / 2,
            textY,
            'bold 70px Arial',
            this.customColors.text,
            strokeColor,
            strokeWidth,
            950,
            85
        );

        this.ctx.restore();

        if (showPercentage) {
            const color = percentage >= 50 ? this.customColors.percentageWin : this.customColors.percentageLose;
            const percentY = textY + 100;

            // Apply percentage styling
            this.ctx.save();

            if (this.textStyle.useGlow) {
                this.ctx.shadowColor = color;
                this.ctx.shadowBlur = 30;
            }

            if (this.textStyle.useShadow) {
                this.ctx.shadowColor = this.textStyle.shadowColor;
                this.ctx.shadowBlur = this.textStyle.shadowBlur;
                this.ctx.shadowOffsetX = this.textStyle.shadowOffsetX;
                this.ctx.shadowOffsetY = this.textStyle.shadowOffsetY;
            }

            this.drawStrokedText(
                `${percentage}%`,
                this.width / 2,
                percentY,
                'bold 90px Arial',
                color,
                strokeColor,
                strokeWidth
            );

            this.ctx.restore();
        }

        this.ctx.restore(); // Restore animation transform
        this.ctx.restore(); // Restore slide transform
    }

    drawRoundedImage(image, x, y, width, height, radius) {
        this.ctx.save();

        // Apply shadow if enabled
        if (this.imageShadow.enabled) {
            this.ctx.shadowColor = this.imageShadow.color;
            this.ctx.shadowBlur = this.imageShadow.blur;
            this.ctx.shadowOffsetX = this.imageShadow.offsetX;
            this.ctx.shadowOffsetY = this.imageShadow.offsetY;
        }

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

        // Background for badge (glow disabled)
        const badgeColor = this.getEngagementColor(engagementType);
        this.ctx.fillStyle = badgeColor;
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
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
            this.updateStatus('🔧 Initializing FFmpeg...', 0);
            this.downloadBtn.disabled = true;

            // Initialize FFmpeg
            const { FFmpeg } = FFmpegWASM;
            const { fetchFile, toBlobURL } = FFmpegUtil;
            const ffmpeg = new FFmpeg();

            // Load FFmpeg with progress
            ffmpeg.on('log', ({ message }) => {
                console.log(message);
            });

            ffmpeg.on('progress', ({ progress }) => {
                if (progress > 0 && progress < 1) {
                    this.updateStatus(`🎬 Encoding video... ${Math.floor(progress * 100)}%`, 50 + (progress * 40));
                }
            });

            // Use single-threaded version to avoid CORS/Worker issues
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            this.updateStatus('📹 Rendering frames...', 5);

            // Reset to start
            this.pause();
            this.currentTime = 0;

            // Render video frame by frame
            const fps = this.exportFPS || 30;
            const totalFrames = Math.ceil(this.timeline.totalDuration * fps);
            const frames = [];

            console.log(`🎬 Rendering ${totalFrames} frames at ${fps} FPS for ${this.timeline.totalDuration.toFixed(2)}s video`);

            for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
                const time = frameNum / fps;
                this.renderFrame(time);

                // Convert canvas to blob
                const blob = await new Promise(resolve => this.canvas.toBlob(resolve, 'image/png'));
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);

                // Write frame to FFmpeg
                const filename = `frame${frameNum.toString().padStart(6, '0')}.png`;
                await ffmpeg.writeFile(filename, uint8Array);
                frames.push(filename);

                // Update progress
                const progress = (frameNum / totalFrames) * 35;
                if (frameNum % 10 === 0) {
                    this.updateStatus(`📹 Rendering frames... ${frameNum}/${totalFrames}`, 5 + progress);
                }
            }

            this.updateStatus('🎵 Processing audio...', 42);

            // Extract and write audio files
            const audioFiles = [];

            // Background music (THIS WAS MISSING!)
            if (this.assets.music) {
                try {
                    const musicBlob = await fetch(this.assets.music.src).then(r => r.blob());
                    const musicData = new Uint8Array(await musicBlob.arrayBuffer());
                    await ffmpeg.writeFile('music.mp3', musicData);
                    audioFiles.push({
                        file: 'music.mp3',
                        volume: this.musicVolume || 0.3,
                        start: 0,
                        duration: this.timeline.totalDuration
                    });
                    console.log('✅ Music added to export');
                } catch (e) {
                    console.warn('Failed to load music:', e);
                }
            }

            // Question voices
            for (let i = 0; i < this.assets.questions.length; i++) {
                const question = this.assets.questions[i];
                const qt = this.timeline.questions[i];

                if (question.voice && question.voice.src) {
                    try {
                        const voiceBlob = await fetch(question.voice.src).then(r => r.blob());
                        const voiceData = new Uint8Array(await voiceBlob.arrayBuffer());
                        const voiceFilename = `voice${i}.mp3`;
                        await ffmpeg.writeFile(voiceFilename, voiceData);
                        audioFiles.push({
                            file: voiceFilename,
                            volume: this.voiceVolume || 1.0,
                            start: qt.voiceStart,
                            duration: question.voice.duration
                        });
                    } catch (e) {
                        console.warn(`Failed to load voice ${i}:`, e);
                    }
                }
            }

            // Sound effects
            const soundEffects = [
                { asset: this.assets.clockSound, name: 'clock' },
                { asset: this.assets.dingSound, name: 'ding' },
                { asset: this.assets.swooshSound, name: 'swoosh' }
            ];

            for (const { asset, name } of soundEffects) {
                if (asset && asset.src) {
                    try {
                        const blob = await fetch(asset.src).then(r => r.blob());
                        const data = new Uint8Array(await blob.arrayBuffer());
                        await ffmpeg.writeFile(`${name}.mp3`, data);
                    } catch (e) {
                        console.warn(`Failed to load ${name} sound:`, e);
                    }
                }
            }

            // Schedule sound effects
            for (let i = 0; i < this.timeline.questions.length; i++) {
                const qt = this.timeline.questions[i];
                const effectVol = this.effectsVolume || 0.7;

                if (this.assets.clockSound) {
                    audioFiles.push({
                        file: 'clock.mp3',
                        volume: effectVol,
                        start: qt.clockStart,
                        duration: 3.0
                    });
                }

                if (this.assets.dingSound) {
                    audioFiles.push({
                        file: 'ding.mp3',
                        volume: effectVol * 1.1,
                        start: qt.dingStart,
                        duration: 0.5
                    });
                }

                if (this.assets.swooshSound) {
                    audioFiles.push({
                        file: 'swoosh.mp3',
                        volume: effectVol * 0.9,
                        start: qt.swooshStart,
                        duration: 1.0
                    });
                }
            }

            this.updateStatus('🎬 Encoding video with audio...', 48);

            // Build FFmpeg audio filter for mixing
            let audioInputs = '';
            let filterComplex = '';
            let audioMapCount = 0;

            // Add each audio file with delay and trim
            for (let i = 0; i < audioFiles.length; i++) {
                const { file, volume, start, duration } = audioFiles[i];
                audioInputs += ` -i ${file}`;

                // Create audio stream with delay, volume, and duration
                const delayMs = Math.floor(start * 1000);
                filterComplex += `[${i + 1}:a]volume=${volume},adelay=${delayMs}|${delayMs}[a${i}];`;
                audioMapCount++;
            }

            // Mix all audio streams
            if (audioMapCount > 0) {
                const audioStreams = Array.from({ length: audioMapCount }, (_, i) => `[a${i}]`).join('');
                filterComplex += `${audioStreams}amix=inputs=${audioMapCount}:duration=longest:dropout_transition=2,volume=${audioMapCount}[aout]`;
            }

            console.log(`🎵 Mixing ${audioMapCount} audio tracks (including background music!)`);

            // Build FFmpeg command
            let ffmpegArgs = [
                '-framerate', fps.toString(),
                '-i', 'frame%06d.png'
            ];

            if (audioFiles.length > 0) {
                ffmpegArgs.push(...audioInputs.split(' ').filter(s => s));
                ffmpegArgs.push('-filter_complex', filterComplex);
                ffmpegArgs.push('-map', '0:v');
                ffmpegArgs.push('-map', '[aout]');
            }

            // Quality settings from UI
            const qualityBitrates = {
                low: 2000000,    // 2 Mbps
                medium: 5000000, // 5 Mbps
                high: 8000000,   // 8 Mbps
                ultra: 12000000  // 12 Mbps
            };

            const videoBitrate = qualityBitrates[this.exportQuality] || 8000000;

            ffmpegArgs.push(
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-b:v', videoBitrate.toString(),
                '-pix_fmt', 'yuv420p'
            );

            if (audioFiles.length > 0) {
                ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k');
            }

            ffmpegArgs.push(
                '-t', this.timeline.totalDuration.toString(),
                '-y',
                'output.mp4'
            );

            console.log('FFmpeg command:', ffmpegArgs.join(' '));

            // Run FFmpeg
            await ffmpeg.exec(ffmpegArgs);

            this.updateStatus('💾 Preparing download...', 95);

            // Read output file
            const data = await ffmpeg.readFile('output.mp4');
            const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(videoBlob);

            // Download
            const a = document.createElement('a');
            a.href = url;
            a.download = `would-you-rather-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Cleanup
            for (const frame of frames) {
                await ffmpeg.deleteFile(frame);
            }

            this.updateStatus('✅ Video downloaded!', 100);
            setTimeout(() => {
                this.statusPanel.classList.add('hidden');
                this.downloadBtn.disabled = false;
            }, 2000);

            console.log('✅ Video export completed successfully with ALL audio tracks!');

        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading video: ' + error.message + '\n\nCheck console for details.');
            this.downloadBtn.disabled = false;
            this.statusPanel.classList.add('hidden');
        }
    }

    // Enhanced player features
    updateTimeDisplay() {
        const currentTimeDisplay = document.getElementById('currentTimeDisplay');
        const totalTimeDisplay = document.getElementById('totalTimeDisplay');
        const questionCounter = document.getElementById('questionCounter');
        const timelineScrubber = document.getElementById('timelineScrubber');

        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = this.formatTime(this.currentTime);
        }

        if (totalTimeDisplay && this.timeline.totalDuration) {
            totalTimeDisplay.textContent = this.formatTime(this.timeline.totalDuration);
        }

        if (questionCounter && this.assets.questions.length > 0) {
            let currentQuestion = 0;
            for (let i = 0; i < this.timeline.questions.length; i++) {
                if (this.currentTime >= this.timeline.questions[i].startTime) {
                    currentQuestion = i + 1;
                }
            }
            questionCounter.textContent = `${currentQuestion} / ${this.assets.questions.length}`;
        }

        if (timelineScrubber && this.timeline.totalDuration > 0) {
            const progress = (this.currentTime / this.timeline.totalDuration) * 100;
            timelineScrubber.value = Math.min(progress, 100);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    seekTo(time) {
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.pause();

        this.currentTime = Math.max(0, Math.min(time, this.timeline.totalDuration));
        this.renderFrame(this.currentTime);
        this.updateTimeDisplay();

        if (wasPlaying) this.play();
    }

    seekRelative(seconds) {
        if (this.assets.questions.length > 0) {
            this.seekTo(this.currentTime + seconds);
        }
    }

    toggleLoop() {
        this.loopEnabled = !this.loopEnabled;
        const loopBtn = document.getElementById('loopBtn');
        if (loopBtn) {
            loopBtn.style.opacity = this.loopEnabled ? '1' : '0.6';
            loopBtn.style.background = this.loopEnabled ? 'var(--primary)' : '';
        }
        console.log(`Loop ${this.loopEnabled ? 'enabled' : 'disabled'}`);
        this.triggerAutoSave();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const muteBtn = document.getElementById('muteBtn');

        if (this.isMuted) {
            if (this.assets.music) this.assets.music.volume = 0;
            for (const question of this.assets.questions) {
                if (question.voice) question.voice.volume = 0;
            }
            if (muteBtn) {
                muteBtn.textContent = '🔈';
                muteBtn.style.background = 'var(--error)';
            }
        } else {
            if (this.assets.music) this.assets.music.volume = this.musicVolume;
            for (const question of this.assets.questions) {
                if (question.voice) question.voice.volume = this.voiceVolume;
            }
            if (muteBtn) {
                muteBtn.textContent = '🔇';
                muteBtn.style.background = '';
            }
        }
        console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
    }

    toggleFullscreen() {
        const previewWrapper = document.querySelector('.preview-wrapper');
        if (!previewWrapper) return;

        if (!document.fullscreenElement) {
            previewWrapper.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    loadPreset(presetName) {
        const presets = {
            fast: {
                questionDelay: 0.2,
                voiceDelay: 0.2,
                option1Delay: 0.1,
                clockDuration: 2.0,
                percentageDuration: 1.5,
                swooshDuration: 0.7,
                fadeInDuration: 0.3,
                afterVoicePause: 0.2
            },
            balanced: {
                questionDelay: 0.325,
                voiceDelay: 0.325,
                option1Delay: 0.13,
                clockDuration: 2.7,
                percentageDuration: 1.8,
                swooshDuration: 0.9,
                fadeInDuration: 0.45,
                afterVoicePause: 0.325
            },
            cinematic: {
                questionDelay: 0.8,
                voiceDelay: 0.6,
                option1Delay: 0.3,
                clockDuration: 4.0,
                percentageDuration: 3.0,
                swooshDuration: 1.5,
                fadeInDuration: 0.8,
                afterVoicePause: 0.7
            },
            minimal: {
                questionDelay: 0.1,
                voiceDelay: 0.1,
                option1Delay: 0.05,
                clockDuration: 1.5,
                percentageDuration: 1.0,
                swooshDuration: 0.5,
                fadeInDuration: 0.2,
                afterVoicePause: 0.1
            }
        };

        const preset = presets[presetName];
        if (preset) {
            Object.assign(this.timing, preset);

            // Update UI
            for (const [key, value] of Object.entries(preset)) {
                const slider = document.getElementById(key);
                const display = document.getElementById(`${key}Value`);
                if (slider) slider.value = value;
                if (display) display.textContent = `${value}s`;
            }

            console.log(`✅ Loaded ${presetName} preset`);
            alert(`Loaded "${presetName}" preset! Regenerate your video to apply changes.`);
            this.triggerAutoSave();
        }
    }

    triggerAutoSave() {
        if (!this.autoSaveEnabled) return;

        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveEnhancedSettings();
            this.showAutoSaveIndicator();
        }, 1000);
    }

    saveEnhancedSettings() {
        const settings = {
            playbackSpeed: this.playbackSpeed,
            canvasZoom: this.canvasZoom,
            musicVolume: this.musicVolume,
            voiceVolume: this.voiceVolume,
            effectsVolume: this.effectsVolume,
            loopEnabled: this.loopEnabled,
            exportQuality: this.exportQuality,
            exportFPS: this.exportFPS,
            imageShadow: this.imageShadow,
            timing: this.timing,
            foodOnlyMode: this.foodOnlyMode,
            backgroundColor: this.backgroundColor,
            textFont: this.textFont,
            keyboardShortcutsEnabled: this.keyboardShortcutsEnabled,
            textAnimation: this.textAnimation,
            textStyle: this.textStyle,
            customColors: this.customColors,
            canvasFilters: this.canvasFilters
        };

        localStorage.setItem('wouldYouRatherSettings', JSON.stringify(settings));
    }

    setDefaultUIValues() {
        // Set voice selection to Adam (pNInz6obpgDQGcFmaJgB)
        if (this.voiceSelect) {
            this.voiceSelect.value = 'pNInz6obpgDQGcFmaJgB';
        }

        // Set music volume slider
        if (this.musicVolumeSlider) {
            this.musicVolumeSlider.value = 15;
            if (this.volumeValueDisplay) {
                this.volumeValueDisplay.textContent = '15%';
            }
        }

        // Set question count
        if (this.questionCountSlider) {
            this.questionCountSlider.value = 7;
            if (this.questionCountValue) {
                this.questionCountValue.textContent = '7';
            }
        }

        // Set engagement settings
        // Comment engagement - ENABLED by default
        if (this.commentEngagementCB) this.commentEngagementCB.checked = true;
        if (this.commentOption1) this.commentOption1.value = "Comment 'I love God'";
        if (this.commentOption2) this.commentOption2.value = "Reject the offer";
        if (this.commentInsertAfter) this.commentInsertAfter.value = "2";

        // Share engagement - ENABLED by default
        if (this.shareEngagementCB) this.shareEngagementCB.checked = true;
        if (this.shareOption1) this.shareOption1.value = "Always be alone";
        if (this.shareOption2) this.shareOption2.value = "Marry the 3rd person who clicks share and more";
        if (this.shareInsertAfter) this.shareInsertAfter.value = "4";

        // Follow engagement - DISABLED by default
        if (this.followEngagementCB) this.followEngagementCB.checked = false;

        // Like engagement - DISABLED by default
        if (this.likeEngagementCB) this.likeEngagementCB.checked = false;

        // Set food-only mode checkbox
        const foodOnlyCheckbox = document.getElementById('foodOnlyMode');
        if (foodOnlyCheckbox) foodOnlyCheckbox.checked = true;

        // Set text animation settings
        const textAnimationEnabled = document.getElementById('textAnimationEnabled');
        if (textAnimationEnabled) textAnimationEnabled.checked = true;

        const textAnimationType = document.getElementById('textAnimationType');
        if (textAnimationType) textAnimationType.value = 'slide';

        // Set text styling
        const textUseGlow = document.getElementById('textUseGlow');
        if (textUseGlow) textUseGlow.checked = false;

        const textUseShadow = document.getElementById('textUseShadow');
        if (textUseShadow) textUseShadow.checked = true;

        const textUseStroke = document.getElementById('textUseStroke');
        if (textUseStroke) textUseStroke.checked = true;

        // Set custom colors
        const textColor = document.getElementById('textColor');
        if (textColor) textColor.value = '#ffffff';

        const glowColor = document.getElementById('glowColor');
        if (glowColor) glowColor.value = '#ffffff';

        const percentWinColor = document.getElementById('percentageWinColor');
        if (percentWinColor) percentWinColor.value = '#11ff00';

        const percentLoseColor = document.getElementById('percentageLoseColor');
        if (percentLoseColor) percentLoseColor.value = '#ff0040';

        // Set canvas filters
        const saturationSlider = document.getElementById('filterSaturation');
        if (saturationSlider) {
            saturationSlider.value = 142;
            const saturationValue = document.getElementById('filterSaturationValue');
            if (saturationValue) saturationValue.textContent = '142%';
        }

        // Apply canvas filters
        this.applyCanvasFilters();

        console.log('✅ Set default UI values (no saved settings found)');
    }

    loadEnhancedSettings() {
        const saved = localStorage.getItem('wouldYouRatherSettings');
        if (!saved) {
            // Set default UI values when no saved settings exist
            this.setDefaultUIValues();
            return;
        }

        try {
            const settings = JSON.parse(saved);

            // Apply settings
            if (settings.playbackSpeed) this.playbackSpeed = settings.playbackSpeed;
            if (settings.canvasZoom) this.canvasZoom = settings.canvasZoom;
            if (settings.musicVolume !== undefined) this.musicVolume = settings.musicVolume;
            if (settings.voiceVolume !== undefined) this.voiceVolume = settings.voiceVolume;
            if (settings.effectsVolume !== undefined) this.effectsVolume = settings.effectsVolume;
            if (settings.loopEnabled) this.loopEnabled = settings.loopEnabled;
            if (settings.exportQuality) this.exportQuality = settings.exportQuality;
            if (settings.exportFPS) this.exportFPS = settings.exportFPS;
            if (settings.imageShadow) Object.assign(this.imageShadow, settings.imageShadow);
            if (settings.timing) Object.assign(this.timing, settings.timing);

            // Load new settings
            if (settings.foodOnlyMode !== undefined) this.foodOnlyMode = settings.foodOnlyMode;
            if (settings.backgroundColor) this.backgroundColor = settings.backgroundColor;
            if (settings.textFont) this.textFont = settings.textFont;
            if (settings.keyboardShortcutsEnabled !== undefined) this.keyboardShortcutsEnabled = settings.keyboardShortcutsEnabled;
            if (settings.textAnimation) Object.assign(this.textAnimation, settings.textAnimation);
            if (settings.textStyle) Object.assign(this.textStyle, settings.textStyle);
            if (settings.customColors) Object.assign(this.customColors, settings.customColors);
            if (settings.canvasFilters) Object.assign(this.canvasFilters, settings.canvasFilters);

            // Update UI elements
            const foodOnlyCheckbox = document.getElementById('foodOnlyMode');
            if (foodOnlyCheckbox) foodOnlyCheckbox.checked = this.foodOnlyMode;

            const keyboardShortcutsCheckbox = document.getElementById('keyboardShortcutsToggle');
            if (keyboardShortcutsCheckbox) keyboardShortcutsCheckbox.checked = this.keyboardShortcutsEnabled;

            // Update text animation UI
            const textAnimationEnabled = document.getElementById('textAnimationEnabled');
            if (textAnimationEnabled) textAnimationEnabled.checked = this.textAnimation.enabled;

            const textAnimationType = document.getElementById('textAnimationType');
            if (textAnimationType) textAnimationType.value = this.textAnimation.type;

            // Update text styling UI
            const textUseGlow = document.getElementById('textUseGlow');
            if (textUseGlow) textUseGlow.checked = this.textStyle.useGlow;

            const textUseShadow = document.getElementById('textUseShadow');
            if (textUseShadow) textUseShadow.checked = this.textStyle.useShadow;

            const textUseStroke = document.getElementById('textUseStroke');
            if (textUseStroke) textUseStroke.checked = this.textStyle.useStroke;

            // Update color pickers
            const textColor = document.getElementById('textColor');
            if (textColor) textColor.value = this.customColors.text;

            const glowColor = document.getElementById('glowColor');
            if (glowColor) glowColor.value = this.customColors.glow;

            // Apply canvas filters
            this.applyCanvasFilters();

            // Update UI
            document.getElementById('playbackSpeed')?.setAttribute('value', this.playbackSpeed);
            document.getElementById('canvasZoom')?.setAttribute('value', this.canvasZoom);

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            try {
                this.favorites = JSON.parse(savedFavorites);
                console.log(`✅ Loaded ${this.favorites.length} favorites`);
            } catch (e) {
                console.error('Failed to load favorites:', e);
            }
        }
            document.getElementById('musicVolSlider')?.setAttribute('value', this.musicVolume * 100);
            document.getElementById('voiceVolSlider')?.setAttribute('value', this.voiceVolume * 100);
            document.getElementById('effectsVolSlider')?.setAttribute('value', this.effectsVolume * 100);
            document.getElementById('exportQuality')?.setAttribute('value', this.exportQuality);
            document.getElementById('exportFPS')?.setAttribute('value', this.exportFPS);

            if (this.loopEnabled) {
                const loopBtn = document.getElementById('loopBtn');
                if (loopBtn) loopBtn.style.opacity = '1';
            }

            console.log('✅ Loaded saved settings from localStorage');
        } catch (error) {
            console.warn('Failed to load saved settings:', error);
        }
    }

    showAutoSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (!indicator) return;

        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }

    // Theme Toggle
    toggleTheme() {
        document.body.classList.toggle('theme-deep-black');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const isDeepBlack = document.body.classList.contains('theme-deep-black');
            themeToggle.textContent = isDeepBlack ? '🌓 Matte Black' : '🌓 Deep Black';
        }
        localStorage.setItem('theme', document.body.classList.contains('theme-deep-black') ? 'deep-black' : 'matte-black');
    }

    // Canvas Filters
    setupFilter(sliderId, valueId, filterName, unit) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);

        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.canvasFilters[filterName] = value;
                valueDisplay.textContent = `${value}${unit}`;
                this.applyCanvasFilters();
                this.triggerAutoSave();
            });
        }
    }

    resetFilters() {
        this.canvasFilters = { brightness: 100, contrast: 100, saturation: 100, blur: 0 };

        document.getElementById('filterBrightness').value = 100;
        document.getElementById('filterBrightnessValue').textContent = '100%';
        document.getElementById('filterContrast').value = 100;
        document.getElementById('filterContrastValue').textContent = '100%';
        document.getElementById('filterSaturation').value = 100;
        document.getElementById('filterSaturationValue').textContent = '100%';
        document.getElementById('filterBlur').value = 0;
        document.getElementById('filterBlurValue').textContent = '0px';

        this.applyCanvasFilters();
        this.triggerAutoSave();
    }

    applyCanvasFilters() {
        const canvas = document.getElementById('previewCanvas');
        if (!canvas) return;

        const filterString = `brightness(${this.canvasFilters.brightness}%) contrast(${this.canvasFilters.contrast}%) saturate(${this.canvasFilters.saturation}%) blur(${this.canvasFilters.blur}px)`;
        canvas.style.filter = filterString;
    }

    // NEW: Preset System
    applyPreset(presetName) {
        this.currentPreset = presetName;

        const presets = {
            fast: {
                questionDelay: 0.2,
                voiceDelay: 0.2,
                option1Delay: 0.1,
                clockDuration: 2.0,
                percentageDuration: 1.5,
                swooshDuration: 0.7,
                fadeInDuration: 0.3,
                afterVoicePause: 0.2
            },
            balanced: {
                questionDelay: 0.325,
                voiceDelay: 0.325,
                option1Delay: 0.13,
                clockDuration: 2.7,
                percentageDuration: 1.8,
                swooshDuration: 0.9,
                fadeInDuration: 0.45,
                afterVoicePause: 0.325
            },
            cinematic: {
                questionDelay: 0.6,
                voiceDelay: 0.5,
                option1Delay: 0.3,
                clockDuration: 3.5,
                percentageDuration: 2.5,
                swooshDuration: 1.2,
                fadeInDuration: 0.7,
                afterVoicePause: 0.5
            },
            viral: {
                questionDelay: 0.15,
                voiceDelay: 0.15,
                option1Delay: 0.08,
                clockDuration: 1.8,
                percentageDuration: 1.2,
                swooshDuration: 0.5,
                fadeInDuration: 0.25,
                afterVoicePause: 0.15
            }
        };

        const preset = presets[presetName];
        if (!preset) return;

        // Apply timing settings
        Object.assign(this.timing, preset);

        // Update UI sliders
        Object.keys(preset).forEach(key => {
            const element = document.getElementById(key);
            const valueElement = document.getElementById(key + 'Value');
            if (element && valueElement) {
                element.value = preset[key];
                valueElement.textContent = preset[key] + 's';
            }
        });

        console.log(`✨ Applied preset: ${presetName}`);
        alert(`Preset "${presetName}" applied successfully!`);
        this.triggerAutoSave();
    }

    // NEW: Copy Settings to Clipboard
    copySettingsToClipboard() {
        const settings = {
            timing: this.timing,
            backgroundColor: this.backgroundColor,
            textFont: this.textFont,
            customColors: this.customColors,
            textAnimation: this.textAnimation,
            textStyle: this.textStyle,
            canvasFilters: this.canvasFilters,
            watermark: this.watermark
        };

        const json = JSON.stringify(settings, null, 2);
        navigator.clipboard.writeText(json).then(() => {
            console.log('✅ Settings copied to clipboard');
            this.showToast('Settings copied to clipboard!', 'success');
        }).catch(err => {
            console.error('❌ Failed to copy settings:', err);
            this.showToast('Failed to copy settings', 'error');
        });
    }

    // NEW: Paste Settings from Clipboard
    async pasteSettingsFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const settings = JSON.parse(text);

            // Apply settings
            if (settings.timing) Object.assign(this.timing, settings.timing);
            if (settings.backgroundColor) this.backgroundColor = settings.backgroundColor;
            if (settings.textFont) this.textFont = settings.textFont;
            if (settings.customColors) Object.assign(this.customColors, settings.customColors);
            if (settings.textAnimation) Object.assign(this.textAnimation, settings.textAnimation);
            if (settings.textStyle) Object.assign(this.textStyle, settings.textStyle);
            if (settings.canvasFilters) Object.assign(this.canvasFilters, settings.canvasFilters);
            if (settings.watermark) Object.assign(this.watermark, settings.watermark);

            // Update UI to reflect pasted settings
            this.updateUIFromSettings();

            console.log('✅ Settings pasted from clipboard');
            this.showToast('Settings pasted successfully!', 'success');
            this.triggerAutoSave();
        } catch (err) {
            console.error('❌ Failed to paste settings:', err);
            this.showToast('Failed to paste settings. Make sure clipboard contains valid settings.', 'error');
        }
    }

    // NEW: Update UI from current settings
    updateUIFromSettings() {
        // Update timing sliders
        Object.keys(this.timing).forEach(key => {
            const element = document.getElementById(key);
            const valueElement = document.getElementById(key + 'Value');
            if (element && valueElement) {
                element.value = this.timing[key];
                valueElement.textContent = this.timing[key] + (key.includes('Percent') ? '%' : 's');
            }
        });

        // Update canvas filters
        this.applyCanvasFilters();
    }

    // NEW: Show Toast Notification
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4466' : '#00d9ff'};
            color: #000;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInUp 0.3s ease;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.9);
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // NEW: Save to Favorites
    saveToFavorites(name) {
        const favorite = {
            name: name || `Favorite ${this.favorites.length + 1}`,
            timestamp: Date.now(),
            settings: {
                timing: { ...this.timing },
                backgroundColor: this.backgroundColor,
                textFont: this.textFont,
                customColors: { ...this.customColors },
                textAnimation: { ...this.textAnimation },
                textStyle: { ...this.textStyle },
                watermark: { ...this.watermark },
                questionCount: this.questionCount
            }
        };

        this.favorites.push(favorite);
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.showToast(`Saved to favorites: ${favorite.name}`, 'success');
        console.log('✅ Saved to favorites:', favorite);
    }

    // NEW: Load from Favorites
    loadFromFavorites(index) {
        if (index < 0 || index >= this.favorites.length) return;

        const favorite = this.favorites[index];
        const settings = favorite.settings;

        // Apply all settings
        if (settings.timing) Object.assign(this.timing, settings.timing);
        if (settings.backgroundColor) this.backgroundColor = settings.backgroundColor;
        if (settings.textFont) this.textFont = settings.textFont;
        if (settings.customColors) Object.assign(this.customColors, settings.customColors);
        if (settings.textAnimation) Object.assign(this.textAnimation, settings.textAnimation);
        if (settings.textStyle) Object.assign(this.textStyle, settings.textStyle);
        if (settings.watermark) Object.assign(this.watermark, settings.watermark);
        if (settings.questionCount) this.questionCount = settings.questionCount;

        this.updateUIFromSettings();
        this.showToast(`Loaded: ${favorite.name}`, 'success');
        console.log('✅ Loaded favorite:', favorite);
    }

    // NEW: Shuffle Questions (regenerate with same settings)
    async shuffleQuestions() {
        if (this.assets.questions.length === 0) {
            alert('Generate a video first before shuffling!');
            return;
        }

        console.log('🔀 Shuffling questions...');
        this.showToast('Shuffling questions...', 'info');

        // Re-generate with same settings but different random prompts
        await this.generateVideo();
    }

    // NEW: Open Prompt Manager
    openPromptManager() {
        const totalPrompts = this.promptManager.getAllPrompts().length;
        const foodPrompts = this.promptManager.getFoodOnlyPrompts().length;
        const customPrompts = this.promptManager.customPrompts.length;

        const modal = `
            <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                <div style="background: var(--bg-matte); border: 1px solid var(--border-strong); border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;" onclick="event.stopPropagation()">
                    <h2 style="margin: 0 0 1rem; color: var(--primary-accent); font-size: 1.5rem;">📝 Prompt Manager</h2>

                    <div style="background: rgba(0, 217, 255, 0.05); border-left: 3px solid var(--primary-accent); padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="margin: 0 0 0.5rem; font-size: 1rem;">Statistics</h3>
                        <p style="margin: 0.25rem 0; font-size: 0.9rem;">📊 Total Prompts: <strong>${totalPrompts}</strong></p>
                        <p style="margin: 0.25rem 0; font-size: 0.9rem;">🍕 Food Prompts: <strong>${foodPrompts}</strong></p>
                        <p style="margin: 0.25rem 0; font-size: 0.9rem;">✨ Custom Prompts: <strong>${customPrompts}</strong></p>
                    </div>

                    <div style="display: grid; gap: 0.75rem;">
                        <button class="btn btn-primary btn-block" onclick="videoGenerator.addCustomPrompt()">➕ Add Custom Prompt</button>
                        <button class="btn btn-secondary btn-block" onclick="videoGenerator.exportAllPrompts()">💾 Export All Prompts</button>
                        <button class="btn btn-secondary btn-block" onclick="videoGenerator.importPrompts()">📥 Import Prompts</button>
                        <button class="btn btn-ghost btn-block" onclick="this.closest('[style*=\"position: fixed\"]').remove()">✖ Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
    }

    // NEW: Add Custom Prompt
    addCustomPrompt() {
        const option1 = prompt('Enter first option:');
        if (!option1) return;

        const option2 = prompt('Enter second option:');
        if (!option2) return;

        this.promptManager.addPrompt(option1, option2);
        this.showToast(`Added: ${option1} vs ${option2}`, 'success');

        // Refresh the modal
        document.querySelector('[style*="position: fixed"]')?.remove();
        this.openPromptManager();
    }

    // NEW: Export All Prompts
    exportAllPrompts() {
        const prompts = this.promptManager.getAllPrompts();
        const json = JSON.stringify(prompts, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompts-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Prompts exported successfully!', 'success');
    }

    // NEW: Import Prompts
    importPrompts() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const text = await file.text();
                const prompts = JSON.parse(text);

                if (!Array.isArray(prompts)) {
                    throw new Error('Invalid prompts format');
                }

                this.promptManager.bulkAddPrompts(prompts);
                this.showToast(`Imported ${prompts.length} prompts!`, 'success');
                document.querySelector('[style*="position: fixed"]')?.remove();
                this.openPromptManager();
            } catch (err) {
                this.showToast('Failed to import prompts: ' + err.message, 'error');
            }
        };
        input.click();
    }

    // NEW: Open Favorites Manager
    openFavoritesManager() {
        const favoritesCount = this.favorites.length;

        let favoritesListHtml = '';
        if (favoritesCount === 0) {
            favoritesListHtml = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No favorites saved yet. Use "💾 Duplicate" to save your current settings!</p>';
        } else {
            favoritesListHtml = this.favorites.map((fav, index) => `
                <div style="background: rgba(0, 217, 255, 0.03); border: 1px solid var(--border-matte); border-radius: 8px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; min-width: 0;">
                        <h4 style="margin: 0 0 0.25rem; font-size: 0.95rem; color: var(--primary-accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ⭐ ${fav.name}
                        </h4>
                        <p style="margin: 0; font-size: 0.75rem; color: var(--text-tertiary);">
                            ${fav.timestamp ? new Date(fav.timestamp).toLocaleString() : 'Unknown date'}
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.3rem; flex-shrink: 0;">
                        <button class="btn btn-sm btn-primary" onclick="videoGenerator.loadFavorite(${index})" title="Load">📂</button>
                        <button class="btn btn-sm btn-ghost" onclick="videoGenerator.renameFavorite(${index})" title="Rename">✏️</button>
                        <button class="btn btn-sm btn-ghost" onclick="videoGenerator.exportFavorite(${index})" title="Export">💾</button>
                        <button class="btn btn-sm btn-ghost" onclick="videoGenerator.deleteFavorite(${index})" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('');
        }

        const modal = `
            <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                <div style="background: var(--bg-matte); border: 1px solid var(--border-strong); border-radius: 12px; padding: 2rem; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;" onclick="event.stopPropagation()">
                    <h2 style="margin: 0 0 1rem; color: var(--primary-accent); font-size: 1.5rem;">⭐ Favorites Manager</h2>

                    <div style="background: rgba(0, 217, 255, 0.05); border-left: 3px solid var(--primary-accent); padding: 1rem; margin-bottom: 1.5rem;">
                        <h3 style="margin: 0 0 0.5rem; font-size: 1rem;">Statistics</h3>
                        <p style="margin: 0.25rem 0; font-size: 0.9rem;">📊 Total Favorites: <strong>${favoritesCount}</strong></p>
                        <p style="margin: 0.25rem 0; font-size: 0.75rem; color: var(--text-tertiary);">💡 Tip: Use "💾 Duplicate" in Quick Tools to save your current settings as a favorite</p>
                    </div>

                    <div style="display: grid; gap: 0.5rem; margin-bottom: 1.5rem;">
                        ${favoritesListHtml}
                    </div>

                    <div style="display: grid; gap: 0.75rem;">
                        <button class="btn btn-primary btn-block" onclick="videoGenerator.duplicateCurrentSettings(); videoGenerator.openFavoritesManager();">➕ Save Current as Favorite</button>
                        <button class="btn btn-ghost btn-block" onclick="this.closest('[style*=\"position: fixed\"]').remove()">✖ Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
    }

    // NEW: Load Favorite
    loadFavorite(index) {
        if (index < 0 || index >= this.favorites.length) {
            this.showToast('Invalid favorite index', 'error');
            return;
        }

        const favorite = this.favorites[index];

        // Apply all settings from favorite
        if (favorite.timing) Object.assign(this.timing, favorite.timing);
        if (favorite.playbackSpeed !== undefined) this.playbackSpeed = favorite.playbackSpeed;
        if (favorite.foodOnlyMode !== undefined) this.foodOnlyMode = favorite.foodOnlyMode;
        if (favorite.backgroundColor) this.backgroundColor = favorite.backgroundColor;
        if (favorite.textFont) this.textFont = favorite.textFont;
        if (favorite.keyboardShortcutsEnabled !== undefined) this.keyboardShortcutsEnabled = favorite.keyboardShortcutsEnabled;
        if (favorite.textAnimation) Object.assign(this.textAnimation, favorite.textAnimation);
        if (favorite.textStyle) Object.assign(this.textStyle, favorite.textStyle);
        if (favorite.customColors) Object.assign(this.customColors, favorite.customColors);
        if (favorite.canvasFilters) Object.assign(this.canvasFilters, favorite.canvasFilters);

        // Update all UI elements
        this.updateUIFromSettings();

        this.showToast(`Loaded favorite: ${favorite.name}`, 'success');
        console.log('✅ Loaded favorite:', favorite);

        // Close modal and refresh
        document.querySelector('[style*="position: fixed"]')?.remove();
    }

    // NEW: Update UI from current settings
    updateUIFromSettings() {
        // Update all sliders and inputs to match current settings
        const updateSlider = (id, value, displayId) => {
            const slider = document.getElementById(id);
            const display = document.getElementById(displayId);
            if (slider) slider.value = value;
            if (display) {
                if (id.includes('Volume')) {
                    display.textContent = `${Math.round(value * 100)}%`;
                } else {
                    display.textContent = `${value}s`;
                }
            }
        };

        // Timing sliders
        updateSlider('questionDelaySlider', this.timing.questionDelay, 'questionDelayValue');
        updateSlider('voiceDelaySlider', this.timing.voiceDelay, 'voiceDelayValue');
        updateSlider('option1DelaySlider', this.timing.option1Delay, 'option1DelayValue');
        updateSlider('option2DelaySlider', this.timing.option2Delay, 'option2DelayValue');
        updateSlider('clockDurationSlider', this.timing.clockDuration, 'clockDurationValue');
        updateSlider('percentageDurationSlider', this.timing.percentageDuration, 'percentageDurationValue');
        updateSlider('swooshDurationSlider', this.timing.swooshDuration, 'swooshDurationValue');

        // Checkboxes
        const foodOnlyCheckbox = document.getElementById('foodOnlyMode');
        if (foodOnlyCheckbox) foodOnlyCheckbox.checked = this.foodOnlyMode;

        const keyboardShortcutsCheckbox = document.getElementById('keyboardShortcutsToggle');
        if (keyboardShortcutsCheckbox) keyboardShortcutsCheckbox.checked = this.keyboardShortcutsEnabled;

        // Text animation
        const textAnimationEnabled = document.getElementById('textAnimationEnabled');
        if (textAnimationEnabled) textAnimationEnabled.checked = this.textAnimation.enabled;

        const textAnimationType = document.getElementById('textAnimationType');
        if (textAnimationType) textAnimationType.value = this.textAnimation.type;

        // Text style
        const useGlow = document.getElementById('textUseGlow');
        if (useGlow) useGlow.checked = this.textStyle.useGlow;

        const useShadow = document.getElementById('textUseShadow');
        if (useShadow) useShadow.checked = this.textStyle.useShadow;

        const useStroke = document.getElementById('textUseStroke');
        if (useStroke) useStroke.checked = this.textStyle.useStroke;

        console.log('✅ UI updated from settings');
    }

    // NEW: Delete Favorite
    deleteFavorite(index) {
        if (index < 0 || index >= this.favorites.length) {
            this.showToast('Invalid favorite index', 'error');
            return;
        }

        const favorite = this.favorites[index];
        const confirmed = confirm(`Delete favorite "${favorite.name}"?`);

        if (confirmed) {
            this.favorites.splice(index, 1);
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            this.showToast(`Deleted: ${favorite.name}`, 'success');

            // Refresh the modal
            document.querySelector('[style*="position: fixed"]')?.remove();
            this.openFavoritesManager();
        }
    }

    // NEW: Rename Favorite
    renameFavorite(index) {
        if (index < 0 || index >= this.favorites.length) {
            this.showToast('Invalid favorite index', 'error');
            return;
        }

        const favorite = this.favorites[index];
        const newName = prompt(`Rename favorite "${favorite.name}" to:`, favorite.name);

        if (newName && newName.trim() && newName !== favorite.name) {
            favorite.name = newName.trim();
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            this.showToast(`Renamed to: ${newName}`, 'success');

            // Refresh the modal
            document.querySelector('[style*="position: fixed"]')?.remove();
            this.openFavoritesManager();
        }
    }

    // NEW: Export Single Favorite
    exportFavorite(index) {
        if (index < 0 || index >= this.favorites.length) {
            this.showToast('Invalid favorite index', 'error');
            return;
        }

        const favorite = this.favorites[index];
        const json = JSON.stringify(favorite, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `favorite-${favorite.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast(`Exported: ${favorite.name}`, 'success');
    }

    // NEW: Export Stats
    exportStats() {
        const stats = {
            timestamp: new Date().toISOString(),
            videoCount: this.assets.questions.length,
            totalDuration: this.timeline.totalDuration,
            settings: {
                questionCount: this.questionCount,
                voice: this.voiceSelect?.value,
                foodOnlyMode: this.foodOnlyMode,
                exportQuality: this.exportQuality,
                exportFPS: this.exportFPS
            },
            timing: this.timing,
            favorites: this.favorites.length
        };

        const json = JSON.stringify(stats, null, 2);
        navigator.clipboard.writeText(json).then(() => {
            this.showToast('Stats copied to clipboard!', 'success');
        });
    }

    // NEW: Reset All Settings
    resetAllSettings() {
        if (!confirm('Are you sure you want to reset ALL settings to defaults? This cannot be undone.')) {
            return;
        }

        // Clear localStorage
        localStorage.removeItem('wouldYouRatherSettings');
        localStorage.removeItem('favorites');

        this.showToast('All settings reset! Reloading...', 'info');

        // Reload page after 1 second
        setTimeout(() => location.reload(), 1000);
    }

    // NEW: Duplicate Current Settings
    duplicateCurrentSettings() {
        const settings = {
            timing: { ...this.timing },
            textAnimation: { ...this.textAnimation },
            textStyle: { ...this.textStyle },
            customColors: { ...this.customColors },
            canvasFilters: { ...this.canvasFilters },
            foodOnlyMode: this.foodOnlyMode,
            questionCount: this.questionCount
        };

        const name = prompt('Enter name for this configuration:', `Config ${Date.now()}`);
        if (!name) return;

        const config = {
            name,
            timestamp: Date.now(),
            settings
        };

        // Save to favorites
        this.favorites.push(config);
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.showToast(`Configuration "${name}" saved!`, 'success');
    }

    // NEW: Export Video Metadata
    exportVideoMetadata() {
        if (this.assets.questions.length === 0) {
            this.showToast('Generate a video first!', 'error');
            return;
        }

        const metadata = {
            title: 'Would You Rather Video',
            timestamp: new Date().toISOString(),
            duration: this.timeline.totalDuration,
            questions: this.assets.questions.map((q, i) => ({
                index: i + 1,
                option1: q.option1,
                option2: q.option2,
                isEngagement: q.isEngagement || false,
                type: q.type || 'regular'
            })),
            timeline: {
                totalDuration: this.timeline.totalDuration,
                questionCount: this.timeline.questions.length,
                engagementCount: this.assets.questions.filter(q => q.isEngagement).length
            },
            settings: {
                resolution: this.exportResolution,
                fps: this.exportFPS,
                quality: this.exportQuality
            }
        };

        const json = JSON.stringify(metadata, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-metadata-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Metadata exported!', 'success');
    }

    // NEW: Quick Export Video (with default settings)
    async quickExportVideo() {
        if (this.assets.questions.length === 0) {
            this.showToast('Generate a video first!', 'error');
            return;
        }

        this.showToast('Starting quick export...', 'info');
        await this.downloadVideo();
    }

    // Frame Navigation
    framePrevious() {
        if (this.assets.questions.length === 0) return;
        const frameTime = 1 / 30; // 30 FPS
        this.seekTo(Math.max(0, this.currentTime - frameTime));
    }

    frameNext() {
        if (this.assets.questions.length === 0) return;
        const frameTime = 1 / 30; // 30 FPS
        this.seekTo(Math.min(this.timeline.totalDuration, this.currentTime + frameTime));
    }

    // Bookmark System
    toggleBookmark() {
        const currentTime = this.currentTime;
        const index = this.bookmarks.indexOf(currentTime);

        if (index > -1) {
            this.bookmarks.splice(index, 1);
        } else {
            this.bookmarks.push(currentTime);
            this.bookmarks.sort((a, b) => a - b);
        }

        this.updateTimelineMarkers();
        this.triggerAutoSave();
    }

    clearBookmarks() {
        this.bookmarks = [];
        this.updateTimelineMarkers();
        this.triggerAutoSave();
    }

    updateTimelineMarkers() {
        const markersContainer = document.getElementById('timelineMarkers');
        if (!markersContainer || !this.timeline.totalDuration) return;

        markersContainer.innerHTML = '';

        // Add question markers
        for (let i = 0; i < this.timeline.questions.length; i++) {
            const qt = this.timeline.questions[i];
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.title = `Question ${i + 1}`;
            marker.addEventListener('click', () => {
                this.seekTo(qt.startTime);
            });
            markersContainer.appendChild(marker);
        }

        // Add bookmark indicators
        for (const bookmarkTime of this.bookmarks) {
            const percent = (bookmarkTime / this.timeline.totalDuration) * 100;
            const indicator = document.createElement('div');
            indicator.className = 'bookmark-indicator';
            indicator.style.left = `${percent}%`;
            indicator.title = `Bookmark at ${this.formatTime(bookmarkTime)}`;
            markersContainer.appendChild(indicator);
        }
    }

    // Undo/Redo System
    saveStateToHistory() {
        const state = {
            timing: { ...this.timing },
            imageShadow: { ...this.imageShadow },
            canvasFilters: { ...this.canvasFilters },
            customColors: { ...this.customColors },
            animationEasing: { ...this.animationEasing }
        };

        // Remove any states after current index
        this.settingsHistory = this.settingsHistory.slice(0, this.historyIndex + 1);

        // Add new state
        this.settingsHistory.push(state);

        // Limit history size
        if (this.settingsHistory.length > this.maxHistorySize) {
            this.settingsHistory.shift();
        } else {
            this.historyIndex++;
        }

        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex <= 0) return;

        this.historyIndex--;
        const state = this.settingsHistory[this.historyIndex];
        this.applyHistoryState(state);
        this.updateUndoRedoButtons();
    }

    redo() {
        if (this.historyIndex >= this.settingsHistory.length - 1) return;

        this.historyIndex++;
        const state = this.settingsHistory[this.historyIndex];
        this.applyHistoryState(state);
        this.updateUndoRedoButtons();
    }

    applyHistoryState(state) {
        Object.assign(this.timing, state.timing);
        Object.assign(this.imageShadow, state.imageShadow);
        Object.assign(this.canvasFilters, state.canvasFilters);
        Object.assign(this.customColors, state.customColors);
        Object.assign(this.animationEasing, state.animationEasing);

        // Update UI elements
        this.applyCanvasFilters();

        // Update color pickers
        document.getElementById('textColor').value = this.customColors.text;
        document.getElementById('glowColor').value = this.customColors.glow;
        document.getElementById('percentageWinColor').value = this.customColors.percentageWin;
        document.getElementById('percentageLoseColor').value = this.customColors.percentageLose;

        console.log('✅ Settings restored from history');
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
        if (redoBtn) redoBtn.disabled = this.historyIndex >= this.settingsHistory.length - 1;
    }
}
