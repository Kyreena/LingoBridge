# Contributing to LingoBridge

Thank you for your interest in contributing to LingoBridge! We welcome contributions from the community to help make this inclusive education tool even better.

## 🎯 Ways to Contribute

### 1. Expand the ASL Library
- Add new ASL signs by updating `asl-library.js`
- Contribute videos for underrepresented words
- Add support for other sign languages (BSL, LSF, etc.)

### 2. Improve Documentation
- Fix typos or clarify instructions
- Add examples or tutorials
- Translate documentation to other languages

### 3. Report Bugs
- Use the GitHub Issues tab
- Provide clear reproduction steps
- Include browser version and OS

### 4. Suggest Features
- Open an issue with the "enhancement" label
- Describe the use case and benefits
- Consider educational impact

### 5. Code Contributions
- Follow the coding standards below
- Write tests for new features
- Update documentation as needed

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/LingoBridge.git
   cd LingoBridge
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Edit files as needed
   - Test thoroughly in multiple browsers

4. **Test your changes**
   - Open `index.html` in your browser
   - Open `test.html` and run all tests
   - Verify in Chrome, Edge, and Safari if possible

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes clearly

## 📝 Coding Standards

### JavaScript
- Use ES6+ features (classes, arrow functions, const/let)
- Add JSDoc comments for functions
- Handle errors gracefully
- Use meaningful variable names

### HTML/CSS
- Use semantic HTML5 elements
- Follow accessibility best practices (ARIA labels)
- Maintain responsive design
- Keep styles organized and commented

### ASL Library
When adding new signs:
```javascript
"word": {
    video: "URL_TO_VIDEO",
    description: "Clear description of the sign"
}
```

## 🧪 Testing

- Test in Chrome, Edge, and Safari
- Verify microphone permissions work
- Check video playback functionality
- Ensure responsive design works on tablets
- Run the test suite in `test.html`

## 📋 Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Changes have been tested in multiple browsers
- [ ] Documentation has been updated
- [ ] Commit messages are clear and descriptive
- [ ] No console errors or warnings
- [ ] Accessibility has been maintained/improved

## 🎓 Educational Focus

Remember that LingoBridge is designed for inclusive education. Consider:
- **Accessibility**: Is it usable by all learners?
- **Clarity**: Is the interface intuitive?
- **Performance**: Does it work smoothly in real-time?
- **Educational Value**: Does it enhance learning?

## 💡 Adding ASL Signs

### Video Requirements
- High quality (at least 480p)
- Clear demonstration of the sign
- Neutral background
- Proper lighting
- 2-5 seconds duration

### Finding ASL Videos
- [Signing Savvy](https://www.signingsavvy.com/)
- [Lifeprint](https://www.lifeprint.com/)
- [HandSpeak](https://www.handspeak.com/)

## 🤝 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Be respectful and considerate
- Welcome newcomers warmly
- Give and receive constructive feedback gracefully
- Focus on the educational mission

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or inflammatory comments
- Publishing others' private information
- Other unprofessional conduct

## 📞 Questions?

- Open an issue for technical questions
- Check existing issues first
- Be patient - maintainers are volunteers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make education more inclusive! 🌉
