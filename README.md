# Image Finder - High Quality Image Search

A beautiful, modern web application for searching and discovering high-quality images using the Unsplash API.

## Features

- **High-Quality Images**: Search millions of professional photos from Unsplash
- **Clean Interface**: Modern, responsive design that works on all devices
- **Image Preview**: Click any image to view full-size with details
- **Infinite Scroll**: Load more results with a single click
- **Photographer Credits**: Properly attributes photos to their creators
- **Download Support**: Direct download links for images
- **Persistent API Key**: Save your API key locally for convenience

## Quick Start

### 1. Get a Free Unsplash API Key

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Sign up or log in to your account
3. Click "Your apps" → "New Application"
4. Accept the terms and conditions
5. Fill in the application details:
   - **Application name**: Image Finder (or any name you prefer)
   - **Description**: Personal image search application
6. Click "Create application"
7. Copy your **Access Key** (this is your API key)

### 2. Set Up the Application

**Option A: Using config.js (Recommended for local development)**

1. Clone or download this repository
2. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   ```
3. Open `config.js` and add your API key:
   ```javascript
   const CONFIG = {
       unsplashAccessKey: 'YOUR_ACCESS_KEY_HERE',
       imagesPerPage: 12,
       defaultSearchTerm: 'nature'
   };
   ```
4. Open `index.html` in a web browser
5. Your API key will be automatically loaded!

**Option B: Using the UI (Quick and easy)**

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Enter your Unsplash API key in the "API Key" field
4. Start searching for images!

**Security Note**: The `config.js` file is gitignored to keep your API key private. Never commit your actual API key to version control!

### 3. Using the Application

**Search for Images:**
- Type your search term (e.g., "nature", "technology", "cats")
- Press Enter or click the Search button
- Browse through the results

**View Full Image:**
- Click on any image card to open a modal
- View the full-size image
- Read the description
- Download the image
- Visit the photographer's profile

**Load More Results:**
- Scroll to the bottom
- Click "Load More" to see additional images

## File Structure

```
image-finder/
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Application logic and API integration
├── config.example.js   # Configuration template
├── config.js           # Your API key (gitignored - create from example)
├── .gitignore          # Git ignore file for security
└── README.md           # This file
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox/grid, animations
- **JavaScript (ES6+)**: Fetch API, async/await, classes
- **Unsplash API**: High-quality image database

## API Limits

Unsplash's free tier includes:
- **50 requests per hour**
- **Demo applications**: Up to 50 requests/hour
- **Production applications**: Contact Unsplash for higher limits

If you exceed the rate limit, you'll see an error message. Wait an hour or upgrade your Unsplash plan.

## Browser Compatibility

Works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Privacy & Security

- **API Key Storage**: Your API key can be stored in `config.js` (gitignored) or browser localStorage
- **No Backend**: All processing happens client-side in your browser
- **Secure**: No data is sent to any server except the official Unsplash API
- **Git Protection**: `config.js` is automatically excluded from git commits via `.gitignore`
- **Never Share**: Keep your API keys private and never commit them to version control

## Customization

### Change Images Per Page

Edit `config.js`:
```javascript
const CONFIG = {
    unsplashAccessKey: 'YOUR_KEY',
    imagesPerPage: 20,  // Change this
    defaultSearchTerm: 'nature'
};
```

### Change Default Search Term

Edit `config.js`:
```javascript
const CONFIG = {
    unsplashAccessKey: 'YOUR_KEY',
    imagesPerPage: 12,
    defaultSearchTerm: 'technology'  // Change this
};
```

### Modify Color Scheme

Edit `style.css` root variables:
```css
:root {
    --primary-color: #6366f1; /* Change this */
    --primary-hover: #4f46e5;  /* And this */
}
```

### Add Different Orientations

Edit the search query in `script.js`:
```javascript
url.searchParams.append('orientation', 'portrait'); // or 'squarish'
```

## Troubleshooting

### "Invalid API key" Error
- Double-check your API key from Unsplash dashboard
- Make sure there are no extra spaces
- Try creating a new application on Unsplash

### "No images found" Error
- Try a different search term
- Check your internet connection
- Verify Unsplash API status

### Images Not Loading
- Check browser console for errors
- Ensure you have an active internet connection
- Verify your API key is valid

### Rate Limit Exceeded
- You've made 50+ requests in an hour
- Wait for the limit to reset
- Consider upgrading your Unsplash plan

## Credits

- **Images**: [Unsplash](https://unsplash.com)
- **Photographers**: Individual credits shown with each image
- **Design**: Modern, gradient-based UI

## License

This project is open source and available for personal and educational use.

**Note**: Unsplash images have their own [license terms](https://unsplash.com/license). Always check the specific license for each image.

## Contributing

Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Future Enhancements

Potential improvements:
- [ ] Add filters (color, orientation, etc.)
- [ ] Save favorite images
- [ ] Create collections
- [ ] Advanced search options
- [ ] Image size selection
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Share functionality

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review [Unsplash API Documentation](https://unsplash.com/documentation)
3. Open an issue on GitHub

---

**Enjoy discovering beautiful images!** 📸
