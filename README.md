# Would You Rather Generator

Create viral "Would You Rather" videos with AI-powered voiceovers, animations, and high-quality images automatically.

## Features

### 🎥 Video Generator (NEW)
- **Automated Video Creation**: Generate unique "Would You Rather" videos in seconds
- **AI Voiceovers**: Natural-sounding voice using ElevenLabs API
- **Dynamic Animations**: Smooth slide-in animations with precise timing
- **Smart Percentages**: Random percentage reveals with color-coded results
- **High-Quality Images**: Automatic image fetching from Unsplash
- **9:16 Vertical Format**: Perfect for TikTok, Instagram Reels, and YouTube Shorts

### 🖼️ Image Finder
- **High-Quality Images**: Search millions of professional photos from Unsplash
- **Clean Interface**: Modern, responsive design
- **Image Preview**: Full-size viewing with photographer credits
- **Download Support**: Direct image downloads

## Quick Start

### 1. Get API Keys

**Unsplash API (Required for both tools)**
1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your **Access Key**

**ElevenLabs API (Required for video generator)**
1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up for an account (free tier available)
3. Navigate to your profile settings
4. Copy your **API Key**

### 2. Configure API Keys

**Option A: Using config files (Recommended)**

For Image Finder:
```bash
cd image-finder
cp config.example.js config.js
# Edit config.js and add your Unsplash key
```

For Video Generator:
```bash
cd video-generator
cp config.example.js config.js
# Edit config.js and add both API keys
```

**Option B: Using the UI**
Just open the tool and enter your API keys in the provided fields.

### 3. Add Audio Assets (Optional but Recommended)

For the best video experience, add these audio files to `assets/audio/`:
- `music.mp3` - Background music
- `clock.mp3` - Clock ticking sound (3 seconds)
- `ding.mp3` - Ding sound effect
- `swoosh.mp3` - Transition sound effect

See [assets/README.md](assets/README.md) for detailed requirements and free resources.

### 4. Start Creating!

Open `index.html` in your browser and choose:
- **Video Generator** - Create viral videos
- **Image Finder** - Search for images

## Project Structure

```
Whatwouldyourather/
├── index.html              # Main landing page
├── README.md              # This file
├── .gitignore            # Git ignore rules
│
├── video-generator/       # Video generation tool
│   ├── index.html        # Generator interface
│   ├── style.css         # Styling
│   ├── script.js         # Video generation logic
│   ├── config.js         # Your API keys (gitignored)
│   └── config.example.js # Configuration template
│
├── image-finder/          # Image search tool
│   ├── index.html        # Finder interface
│   ├── style.css         # Styling
│   ├── script.js         # Search logic
│   ├── config.js         # Your API key (gitignored)
│   └── config.example.js # Configuration template
│
└── assets/               # Media assets
    ├── README.md         # Assets documentation
    ├── audio/            # Audio files (user-provided)
    │   ├── music.mp3
    │   ├── clock.mp3
    │   ├── ding.mp3
    │   └── swoosh.mp3
    └── images/           # Background images
        └── or.png
```

## Video Generator Usage

### Basic Workflow

1. **Enter Options**: Type two choices (e.g., "Pizza" or "Burger")
2. **Configure Voice**: Select preferred voice from ElevenLabs
3. **Generate**: Click "Generate Video"
4. **Preview**: Watch the animated preview
5. **Export**: Download or screen record

### Animation Timeline

The video follows this sequence:

1. **0.0s** - Video starts with background
2. **0.5s** - Voice begins: "Pizza or Burger?"
3. **0.7s** - First option slides in from left (200ms after voice)
4. **Mid-voice** - Second option slides in from right
5. **+0.5s** - Clock ticking starts (after voice ends)
6. **+3.0s** - Ding sound plays
7. **Same time** - Percentages revealed (green >50%, red <50%)
8. **+2.0s** - Swoosh transition sound
9. **End** - Video completes

### Text Styling

- All text has **black stroke** for readability
- Percentages are color-coded:
  - **Green** = Above 50%
  - **Red** = Below 50%
- Bold, large fonts for maximum impact

## Technologies Used

- **HTML5 Canvas**: Video rendering and animations
- **JavaScript ES6+**: Application logic
- **Unsplash API**: High-quality image sourcing
- **ElevenLabs API**: AI voice generation
- **CSS3**: Modern UI with animations

## API Rate Limits

### Unsplash (Free Tier)
- 50 requests per hour
- Sufficient for most use cases

### ElevenLabs (Free Tier)
- 10,000 characters per month
- ~100-200 short prompts
- Upgrade for higher limits

## Browser Compatibility

Works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note**: For best performance, use Chrome or Edge.

## Privacy & Security

- **Local Storage**: API keys stored in browser localStorage or config files
- **No Backend**: All processing happens client-side
- **Gitignored Keys**: config.js files are excluded from version control
- **Secure**: Only communicates with Unsplash and ElevenLabs APIs

## Troubleshooting

### Video Generator Issues

**"Failed to generate voice"**
- Check your ElevenLabs API key
- Verify you haven't exceeded rate limits
- Ensure internet connection is stable

**"Failed to fetch images"**
- Check your Unsplash API key
- Try different search terms
- Verify rate limits not exceeded

**No audio playing**
- Add audio files to `assets/audio/` directory
- Check file names match exactly (music.mp3, clock.mp3, etc.)
- Verify audio files are in MP3 format

**Animation timing off**
- This is expected if voice duration varies
- Timeline auto-adjusts based on voice length

### General Issues

**API Key Not Saving**
- Check browser localStorage is enabled
- Try using config.js files instead
- Clear browser cache and retry

## Future Enhancements

- [ ] Video export/download functionality
- [ ] More voice options and languages
- [ ] Custom background images
- [ ] Text customization options
- [ ] Batch video generation
- [ ] Templates and themes
- [ ] Social media direct sharing
- [ ] Video history and management

## Contributing

Contributions welcome! Areas for improvement:
- Video encoding/export functionality
- Additional animation styles
- More voice provider integrations
- Custom font support
- Advanced editing features

## License

This project is open source and available for personal and educational use.

**Important**:
- Unsplash images: [License terms](https://unsplash.com/license)
- ElevenLabs: [Terms of service](https://elevenlabs.io/terms)
- Audio assets: Ensure compliance with respective licenses

## Credits

- **Images**: [Unsplash](https://unsplash.com)
- **Voice AI**: [ElevenLabs](https://elevenlabs.io)
- **Design**: Custom UI with modern aesthetics

---

**Ready to go viral? Start creating!** 🎬✨
