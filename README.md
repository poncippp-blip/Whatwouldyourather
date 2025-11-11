# WouldYouRather.ai - SaaS Video Generator

A professional-grade SaaS platform for generating viral "Would You Rather" videos with AI-powered voiceovers, engagement hooks, and automated content creation.

## 🔥 Latest Updates (Nov 2025)

### ✅ Video Export FIXED
- **Added background music** to MP4 exports (was completely missing!)
- **Fixed FFmpeg Worker CORS** errors with custom server.py
- **Fixed audio volume controls** - voice and effects volumes now properly applied
- **Replaced broken MediaRecorder** with FFmpeg.wasm for perfect sync
- **Professional MP4 export** with H.264 video + AAC audio @ 192kbps

### ⚠️ IMPORTANT: Server Required
You **MUST** use `python3 server.py` to run this app. Opening `index.html` directly will NOT work due to FFmpeg.wasm requirements.

## 🚀 Features

### Core Features
- **🎬 3-Question Video Generation**: Automatically generates 3 unique "Would You Rather" questions per video
- **🎤 AI Voice Generation**: Powered by ElevenLabs with 8 voice options
- **🖼️ Auto Image Fetching**: Pulls high-quality images from Unsplash API
- **🎵 Audio Integration**: Background music, clock ticking, ding sounds, and swoosh transitions
- **📊 Engagement Hooks**: Built-in engagement prompts to boost viewer interaction

### Engagement Features

#### Comment Engagement
- **Option 1**: "Comment 'I love God'" (uses `comment.png`)
- **Option 2**: "Reject the offer" (uses `reject.png`)

#### Share Engagement
- **Option 1**: "Get a curse" (random curse selection)
  - Always be alone
  - Have bad luck forever
  - Lose your legs
  - Go bald instantly
  - Stuck in elevator for 24h
  - Never taste food again
  - And more...
- **Option 2**: "Marry the 3rd person when you click share" (uses `marry.png`)

### Prompt Management
- **Auto-Generate**: Randomly selects from 20+ default prompts
- **Custom Prompts**: Add, edit, and delete your own prompts
- **Import/Export**: Share prompt libraries with JSON files
- **Persistent Storage**: Prompts saved in localStorage

## 📁 Project Structure

```
/
├── src/                          # New SaaS application
│   ├── index.html               # Main UI (modern SaaS design)
│   ├── css/
│   │   └── style.css           # Modern dark theme with glass morphism
│   └── js/
│       ├── app.js              # Application initialization
│       ├── video-generator.js  # Main video generation engine
│       ├── prompt-manager.js   # Prompt management system
│       └── engagement-manager.js # Engagement hook system
│
├── assets/
│   ├── images/
│   │   ├── or.png              # Background image (9:16)
│   │   └── engagement/
│   │       ├── comment.png     # "I love God" engagement
│   │       ├── reject.png      # "Reject offer" engagement
│   │       └── marry.png       # "Marry 3rd person" engagement
│   └── audio/
│       ├── music.mp3           # Background music (loops)
│       ├── clock.mp3           # Clock ticking sound (3s)
│       ├── ding.mp3            # Percentage reveal sound
│       └── swoosh.mp3          # Transition sound
│
├── video-generator/             # Legacy version (deprecated)
└── README.md                    # This file
```

## 🎨 UI/UX Design

### Modern SaaS Theme
- **Black Matte Design**: Professional dark theme (#0a0a0a base)
- **Glass Morphism**: Translucent panels with backdrop blur
- **Soft Transparent White**: Accent colors with opacity variations
- **Responsive Layout**: Works on desktop and mobile
- **Smooth Animations**: CSS transitions and transforms

### Color System
- **Background**: Pure black (#0a0a0a)
- **Surfaces**: White with 3-9% opacity
- **Borders**: White with 6-18% opacity
- **Text**: White (primary), #b4b4b4 (secondary), #737373 (tertiary)
- **Accents**: White for primary actions

## 🛠️ Setup Instructions

### 1. Required Images

Add these images to `assets/images/engagement/`:
- `comment.png` - For "I love God" prompt (400x400px recommended)
- `reject.png` - For "Reject the offer" prompt (400x400px recommended)
- `marry.png` - For "Marry 3rd person" prompt (400x400px recommended)

### 2. API Keys

You'll need:
1. **Unsplash API Key** - Get from [Unsplash Developers](https://unsplash.com/developers)
2. **ElevenLabs API Key** - Get from [ElevenLabs](https://elevenlabs.io)

### 3. Configuration

Option 1: Create `video-generator/config.js`:
```javascript
const CONFIG = {
    unsplashAccessKey: 'YOUR_UNSPLASH_KEY',
    elevenlabsApiKey: 'YOUR_ELEVENLABS_KEY',
    defaultVoiceId: '21m00Tcm4TlvDq8ikWAM'
};
```

Option 2: Enter keys directly in the UI (saved to localStorage)

### 4. Launch

**CRITICAL:** You MUST use the provided `server.py` script for FFmpeg.wasm to work:

```bash
cd src
python3 server.py
```

Then navigate to **http://localhost:8080**

**⚠️ DO NOT open index.html directly (`file://`) - it will NOT work!**

Why? FFmpeg.wasm requires:
- SharedArrayBuffer (needs special CORS headers)
- Web Workers (blocked on `file://` protocol)
- Proper CORS for CDN resources

The `server.py` script sets up these headers automatically.

## 📝 How It Works

### Video Generation Flow

1. **Prompt Selection**
   - Auto-generate: Picks 3 random prompts from library
   - Custom: Use user-provided prompt + 2 random prompts

2. **Asset Loading**
   - Background image (or.png)
   - Audio files (music, clock, ding, swoosh)

3. **Question Generation** (x3)
   - Fetch images from Unsplash
   - Generate AI voice with ElevenLabs
   - Assign random percentages (30-70%)
   - Add engagement hook (last question only)

4. **Timeline Building**
   - Question 1: 0s - 8s
   - Question 2: 8s - 16s
   - Question 3: 16s - 24s
   - Each question: voice → images → clock (3s) → ding → percentages → swoosh (1s)

5. **Rendering**
   - Canvas-based 9:16 video (1080x1920)
   - Slide animations (left/right)
   - Swoosh transitions between questions
   - Engagement overlays

## 🎯 Engagement System

### How Engagement Hooks Work

1. **Selection**: Only the last question (3/3) gets an engagement hook
2. **Randomization**: System randomly picks between enabled engagement types
3. **Display**: Engagement prompt appears after percentages are revealed
4. **Types**:
   - Comment: Choose between "I love God" or "Reject"
   - Share: Choose between "Curse" or "Marry 3rd person"
   - Follow: Simple follow prompt
   - Like: Simple like prompt

### Configuration

Toggle engagement types in the UI:
- ✅ Enabled: Hook may appear
- ❌ Disabled: Hook will never appear

## 🚀 Future Roadmap

- [ ] Backend server for video encoding
- [ ] User authentication system
- [ ] Video export to MP4
- [ ] Bulk video generation
- [ ] Analytics dashboard
- [ ] Template marketplace
- [ ] Custom fonts and themes
- [ ] Social media auto-posting
- [ ] Webhook integrations

## 📦 Dependencies

### External APIs
- **Unsplash API**: Image fetching
- **ElevenLabs API**: AI voice generation

### Browser APIs
- Canvas API (video rendering)
- Web Audio API (sound playback)
- localStorage (settings persistence)
- Fetch API (external requests)

## 🐛 Troubleshooting

### Background Image Not Showing
- Ensure `assets/images/or.png` exists
- Check browser console for CORS errors

### Voices Not Generating
- Verify ElevenLabs API key is correct
- Check if you're using `eleven_turbo_v2` model (free tier compatible)
- Monitor browser console for API errors

### Images Not Loading
- Verify Unsplash API key is valid
- Check daily API rate limits (50 requests/hour for free tier)

### Audio Not Playing
- Ensure all audio files exist in `assets/audio/`
- Check browser autoplay policies
- Try clicking play manually after generation

## 📄 License

This project is for educational and commercial use. Please ensure you comply with:
- Unsplash API Terms of Service
- ElevenLabs Terms of Service
- Any applicable content licensing

## 🤝 Contributing

This is a SaaS platform. For feature requests or bug reports, please open an issue.

---

**Built with ❤️ for viral content creators**
