import { Theme } from '../lib/themes';
import { Palette } from 'lucide-react';

interface Props {
  themes: Theme[];
  currentTheme: Theme;
  onSelect: (theme: Theme) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ThemeSelector({ themes, currentTheme, onSelect, isOpen, onToggle }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 max-h-[70vh] overflow-y-auto rounded-2xl shadow-2xl bg-white border border-gray-200 p-4 mb-2">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Palette size={16} /> Choose a Design ({themes.length} options)
          </h3>
          <div className="space-y-2">
            {themes.map((t, i) => (
              <button
                key={t.id}
                onClick={() => { onSelect(t); onToggle(); }}
                className={`w-full text-left p-3 rounded-xl transition-all hover:scale-[1.02] ${
                  currentTheme.id === t.id ? 'ring-2 ring-offset-1' : ''
                }`}
                style={{
                  backgroundColor: t.colors.bg,
                  border: `1px solid ${currentTheme.id === t.id ? t.colors.accent : t.colors.border}`,
                  outlineColor: currentTheme.id === t.id ? t.colors.accent : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.colors.bgSecondary, border: `1px solid ${t.colors.border}` }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: t.colors.text }}>{i + 1}. {t.name}</p>
                    <p className="text-[10px]" style={{ color: t.colors.textSecondary }}>{t.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={onToggle}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          backgroundColor: currentTheme.colors.accent,
          color: currentTheme.colors.badgeText,
        }}
      >
        <Palette size={24} />
      </button>
    </div>
  );
}
