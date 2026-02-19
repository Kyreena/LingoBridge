# 🌉 LingoBridge

## Speech-to-Sign Language Translation for Inclusive Education

LingoBridge is a web-based real-time speech-to-sign language translation system designed to support inclusive classroom communication for learners with hearing impairments. The system captures spoken English, converts it to text, and displays corresponding American Sign Language (ASL) video signs in near real-time.

![LingoBridge Demo](https://img.shields.io/badge/Status-Active-success)
![Language](https://img.shields.io/badge/Language-JavaScript-yellow)
![ASL Signs](https://img.shields.io/badge/ASL%20Signs-56-blue)

## 🎯 Features

- **Real-time Speech Recognition**: Uses Web Speech API to capture spoken English continuously
- **Instant Text Transcription**: Displays spoken words as text in real-time
- **ASL Video Translation**: Maps recognized words to pre-recorded ASL video signs
- **Visual Feedback**: Highlights words with available ASL signs
- **Sequential Video Playback**: Plays ASL signs in order as they are spoken
- **Clean, Accessible UI**: Intuitive interface designed for classroom use
- **Browser-based**: No installation required - works directly in modern web browsers

## 🚀 Quick Start

### Prerequisites

- A modern web browser with Web Speech API support:
  - Google Chrome (recommended)
  - Microsoft Edge
  - Safari
- Microphone access
- Internet connection (for ASL video playback)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Kyreena/LingoBridge.git
cd LingoBridge
```

2. Open `index.html` in your web browser:
```bash
# On Linux/Mac
open index.html

# On Windows
start index.html

# Or simply double-click index.html
```

That's it! No build process or dependencies required.

## 📖 How to Use

1. **Open the Application**: Open `index.html` in your web browser
2. **Grant Microphone Permission**: Allow the browser to access your microphone when prompted
3. **Start Listening**: Click the "Start Listening" button
4. **Speak Clearly**: Speak into your microphone - words will appear in the transcript
5. **Watch ASL Signs**: ASL video signs will automatically play for recognized words
6. **Stop Recording**: Click the "Stop" button when finished
7. **Clear Transcript**: Use the "Clear" button to reset and start over

## 🎓 Educational Use Cases

LingoBridge is designed for:

- **Inclusive Classrooms**: Help deaf and hard-of-hearing students follow live lectures
- **Language Learning**: Teach ASL alongside spoken English
- **Accessibility Training**: Demonstrate real-time translation technology
- **Communication Support**: Bridge communication gaps in educational settings

## 🔧 Technical Details

### Architecture

The system consists of three main components:

1. **Speech Recognition Module** (`app.js`)
   - Uses Web Speech API for continuous speech recognition
   - Processes audio input and converts to text
   - Handles errors and reconnection

2. **ASL Library** (`asl-library.js`)
   - Maps English words to ASL video URLs
   - Currently includes 56 common words and phrases
   - Easily extensible with more signs

3. **User Interface** (`index.html`, `styles.css`)
   - Responsive design for various screen sizes
   - Visual feedback for user actions
   - Accessible color scheme and layout

### Supported Words

The current library includes:
- **Greetings**: hello, hi, goodbye, bye
- **Courtesy**: please, thank you, yes, no
- **Classroom**: teacher, student, learn, book, read, write, class, school
- **Questions**: what, where, when, who, why, how
- **Actions**: help, understand, know, think, want, need, like
- **Time**: today, tomorrow, yesterday, now, later
- **Numbers**: one through ten
- **Adjectives**: good, bad, big, small, happy, sad

### Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Edge | ✅ Full | Chromium-based |
| Safari | ✅ Full | iOS 14.5+ |
| Firefox | ❌ Limited | No Web Speech API |

## 🛠️ Customization

### Adding New ASL Signs

Edit `asl-library.js` to add more words:

```javascript
const ASL_LIBRARY = {
    // Add your word here
    "newword": {
        video: "URL_TO_VIDEO.mp4",
        description: "Description of sign"
    },
    // ... existing words
};
```

### Styling

Modify `styles.css` to customize:
- Color scheme
- Layout
- Fonts
- Animations

### Speech Recognition Settings

In `app.js`, adjust recognition parameters:

```javascript
this.recognition.continuous = true;    // Continuous recognition
this.recognition.interimResults = true; // Show interim results
this.recognition.lang = 'en-US';       // Language
```

## 📊 Performance

- **Recognition Latency**: < 1 second for speech-to-text
- **Video Loading**: Depends on internet connection
- **Supported Sign Library**: 56 words (expandable)
- **Browser Resource Usage**: Minimal

## 🔒 Privacy & Security

- All speech processing happens in the browser
- No audio data is stored or transmitted to external servers
- Video content is streamed from external CDN (signingsavvy.com)
- No user data collection or tracking
- Settings stored locally in browser (localStorage)

## 🚀 Deployment

### GitHub Pages (Automatic)

This repository includes a GitHub Actions workflow for automatic deployment to GitHub Pages:

1. Push to the `main` branch
2. GitHub Actions automatically deploys to GitHub Pages
3. Access at: `https://yourusername.github.io/LingoBridge/`

### Manual Deployment

#### Local Server
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js http-server
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

#### Static Hosting Services
- **Netlify**: Drag and drop the repository folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Enable in repository settings
- **Cloudflare Pages**: Connect GitHub repository

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Areas for improvement:

1. **Expand ASL Library**: Add more signs and phrases
2. **Multi-language Support**: Add support for other sign languages
3. **Phrase Recognition**: Implement context-aware phrase translation
4. **Offline Mode**: Add ability to work without internet
5. **Video Hosting**: Host ASL videos locally for better performance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ASL videos courtesy of [Signing Savvy](https://www.signingsavvy.com/)
- Web Speech API by W3C
- Designed for inclusive education

## 📧 Support

For questions or issues:
1. Check the browser console for error messages
2. Ensure microphone permissions are granted
3. Verify internet connection for video playback
4. Try using Google Chrome for best compatibility
5. Open an issue on [GitHub](https://github.com/Kyreena/LingoBridge/issues)

## 🔮 Future Enhancements

- [ ] Phrase and sentence level translation
- [ ] Custom sign library uploads
- [ ] Recording and playback features
- [ ] Multi-user classroom mode
- [ ] Integration with video conferencing platforms
- [ ] Mobile app versions
- [ ] Support for other sign languages (BSL, LSF, etc.)
- [ ] Real-time collaboration features
- [ ] Assessment and progress tracking tools

## 📈 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

---

**LingoBridge v1.0.0** - Breaking communication barriers through technology 🌉

Made with ❤️ for inclusive education