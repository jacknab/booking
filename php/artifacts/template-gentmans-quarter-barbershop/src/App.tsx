import { useState, useEffect, useCallback, Component } from 'react';
import { themes, Theme } from './lib/themes';
import { Navbar, Hero, Services, About, Hours, Contact, Footer } from './components/Sections';
import CheckInWidget from './components/CheckInWidget';
import ThemeSelector from './components/ThemeSelector';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: 16 }}>{this.state.error}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: '' })}
            style={{ padding: '8px 24px', background: '#333', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);

  const applyThemeFonts = useCallback((theme: Theme) => {
    const fontFamilies = [
      theme.fonts.heading.split(',')[0].trim().replace(/'/g, ''),
      theme.fonts.body.split(',')[0].trim().replace(/'/g, ''),
    ];
    const uniqueFonts = [...new Set(fontFamilies)];
    const existingLinks = document.querySelectorAll('link[data-font]');
    existingLinks.forEach(l => l.remove());
    uniqueFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
      link.setAttribute('data-font', font);
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => { applyThemeFonts(currentTheme); }, [currentTheme, applyThemeFonts]);

  const handleCheckInClick = () => {
    document.getElementById('checkin')?.scrollIntoView({ behavior: 'smooth' });
  };

  const c = currentTheme.colors;

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: c.bg, color: c.text }}>
      <style>{`
        * { font-family: ${currentTheme.fonts.body}; }
        h1, h2, h3, h4, h5, h6, .font-heading { font-family: ${currentTheme.fonts.heading}; }
        ::selection { background: ${c.accent}; color: ${c.badgeText}; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${c.bgSecondary}; }
        ::-webkit-scrollbar-thumb { background: ${c.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${c.accent}; }
        html { scroll-behavior: smooth; }
        input:focus, select:focus, textarea:focus { outline-color: ${c.accent}; }
      `}</style>

      <Navbar theme={currentTheme} onCheckInClick={handleCheckInClick} />
      <Hero theme={currentTheme} onCheckInClick={handleCheckInClick} />
      <Services theme={currentTheme} />
      <CheckInWidget theme={currentTheme} />
      <About theme={currentTheme} />
      <Hours theme={currentTheme} />
      <Contact theme={currentTheme} />
      <Footer theme={currentTheme} />

      <ThemeSelector
        themes={themes}
        currentTheme={currentTheme}
        onSelect={setCurrentTheme}
        isOpen={themeSelectorOpen}
        onToggle={() => setThemeSelectorOpen(!themeSelectorOpen)}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
