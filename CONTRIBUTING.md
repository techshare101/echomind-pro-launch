# Contributing to EchoMind

Thank you for your interest in contributing to EchoMind! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/echomind/issues)
2. If not, create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS
   - Screenshots (if applicable)

### Suggesting Features

1. Check existing feature requests
2. Create an issue with:
   - Clear use case
   - Expected behavior
   - Why it would benefit users
   - Possible implementation ideas

### Pull Requests

#### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/echomind.git
   cd echomind
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. Make your changes
2. Test thoroughly:
   - Build: `npm run build`
   - Load extension in Chrome Canary
   - Test all affected features
3. Follow code style:
   - Use TypeScript
   - Follow existing patterns
   - Add comments for complex logic
4. Commit with clear messages:
   ```bash
   git commit -m "feat: add translation support"
   ```

#### Commit Message Format

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

#### Before Submitting PR

- [ ] Code builds without errors
- [ ] Extension loads and works correctly
- [ ] No console errors
- [ ] Added/updated tests if applicable
- [ ] Updated documentation if needed
- [ ] Follows existing code style

#### Submitting PR

1. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Create Pull Request on GitHub
3. Fill out PR template
4. Link related issues

## Code Style Guidelines

### TypeScript

- Use strict type checking
- Avoid `any` type when possible
- Define interfaces for data structures
- Export types from `src/types/`

### React

- Use functional components
- Use hooks appropriately
- Keep components small and focused
- Extract reusable logic to custom hooks

### Styling

- Use TailwindCSS utility classes
- Follow cosmic theme color scheme
- Maintain responsive design
- Keep animations subtle and smooth

### File Organization

```
src/
├── popup/          # React components for popup
├── components/     # Reusable components
├── utils/          # Utility functions
├── types/          # TypeScript definitions
├── background.ts   # Service worker
├── content.ts      # Content script
└── styles/         # Global styles
```

## Testing

### Manual Testing

1. Test on multiple websites:
   - News sites (CNN, BBC)
   - Wikipedia articles
   - Technical documentation
   - Social media (Twitter, Reddit)

2. Test all features:
   - Text selection
   - Summarization
   - Explanation
   - Simplification
   - Saving insights
   - Search functionality
   - Delete operations

3. Test edge cases:
   - Very long text
   - Special characters
   - Different languages
   - Offline mode
   - Model not available

### Browser Testing

- Chrome Canary (primary)
- Chrome Dev
- Different OS (Windows, Mac, Linux)

## Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Update SETUP.md for configuration changes
- Keep DEVPOST.md in sync

## Questions?

- Open a discussion on GitHub
- Ask in pull request comments
- Check existing issues/discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to EchoMind! 🧠✨
