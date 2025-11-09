# WouldYouRather.ai - SaaS Application

This is the main SaaS application for WouldYouRather.ai video generator.

## Quick Start

1. **Open** `index.html` in your browser
2. **Enter** your API keys in the UI
3. **Select** Auto-generate or Custom mode
4. **Click** Generate Video

## Folder Structure

```
src/
├── index.html              # Main application UI
├── config.js              # API keys (gitignored - copy from config.example.js)
├── config.example.js      # Template for API configuration
│
├── css/
│   └── style.css         # Complete design system
│
└── js/
    ├── app.js            # Application initialization
    ├── video-generator.js # Video generation engine
    ├── prompt-manager.js  # Prompt management system
    └── engagement-manager.js # Engagement hook system
```

## Configuration

### First Time Setup

1. Copy the example config:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and add your API keys:
   ```javascript
   const CONFIG = {
       unsplashAccessKey: 'YOUR_UNSPLASH_KEY',
       elevenlabsApiKey: 'YOUR_ELEVENLABS_KEY',
       defaultVoiceId: '21m00Tcm4TlvDq8ikWAM'
   };
   ```

3. Alternatively, just open the UI and enter keys directly (they'll be saved to localStorage)

## Features

### 🎬 Video Generation
- 3 questions per video
- AI voiceovers with ElevenLabs
- Auto image fetching from Unsplash
- Smooth animations and transitions

### 📝 Prompt Management
- **Auto-generate**: Random selection from 20+ prompts
- **Custom mode**: Your prompt + 2 random prompts
- **Manage Prompts**: Add/Edit/Delete custom prompts
- **Import/Export**: Share prompt libraries as JSON

### 🎯 Engagement Hooks
- **Comment**: "I love God" vs "Reject offer"
- **Share**: "Get a curse" vs "Marry 3rd person"
- **Follow/Like**: Simple engagement prompts
- Appears on last question only

## Asset Requirements

Ensure these exist:
- `../assets/images/or.png` - Background image
- `../assets/audio/music.mp3` - Background music
- `../assets/audio/clock.mp3` - Clock sound
- `../assets/audio/ding.mp3` - Ding sound
- `../assets/audio/swoosh.mp3` - Transition sound
- `../assets/images/engagement/comment.png` - Comment engagement
- `../assets/images/engagement/reject.png` - Reject engagement
- `../assets/images/engagement/marry.png` - Marry engagement

## Development

### File Loading Order

Scripts are loaded in this order:
1. `config.js` - API configuration
2. `js/prompt-manager.js` - Prompt system
3. `js/engagement-manager.js` - Engagement hooks
4. `js/video-generator.js` - Video engine
5. `js/app.js` - UI initialization

### Key Classes

**PromptManager**
- Manages all "Would You Rather" prompts
- Handles localStorage persistence
- Import/Export functionality

**EngagementManager**
- Manages engagement hooks
- Random curse selection
- Engagement type toggling

**VideoGenerator**
- Main video generation engine
- Canvas rendering
- Audio synchronization
- Timeline management

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note:** Modern browser required for Canvas API and Web Audio API

## Troubleshooting

### Images Not Loading
- Check that `../assets/images/or.png` exists
- Verify image paths are correct relative to `src/index.html`

### Engagement Images Missing
- Add the 3 required PNG images to `../assets/images/engagement/`
- App works without them, but prompts won't have visuals

### Config Not Found
- Copy `config.example.js` to `config.js`
- Or enter keys directly in the UI

### Audio Not Playing
- Check browser autoplay policies
- Ensure all MP3 files exist in `../assets/audio/`

## Production Notes

For production deployment:
- Serve with a web server (not file://)
- Configure CORS if needed
- Consider adding backend for video encoding
- Implement user authentication if building SaaS

---

**This is the main application. The `video-generator/` folder is the legacy version.**
