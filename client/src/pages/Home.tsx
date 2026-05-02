import { BrandProvider, useBrand } from "@/contexts/BrandContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { BrandPreview } from "@/components/BrandPreview";
import { CommandPalette } from "@/components/CommandPalette";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { MockupTemplateProvider } from "@/contexts/MockupTemplateContext";
import { MockupContentProvider } from "@/contexts/MockupContentContext";
import { Undo2, Redo2, Sun, Moon } from "lucide-react";

function BrandLab() {
  const { brand, undo, redo, canUndo, canRedo, historyLength, historyIndex } = useBrand();
  const { theme, toggleTheme } = useTheme();
  useThemeColors();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
              kika_lab
            </span>
            <span className="text-[10px] font-mono text-border">/</span>
            <span className="text-[10px] font-mono text-primary tracking-wider uppercase">
              brand playground
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-card border border-border rounded-md px-2 py-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-1 rounded transition-colors ${
                  canUndo
                    ? "text-foreground hover:text-primary hover:bg-primary/10"
                    : "text-muted-foreground/50 cursor-not-allowed"
                }`}
                title="Undo (Cmd+Z)"
              >
                <Undo2 size={14} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-1 rounded transition-colors ${
                  canRedo
                    ? "text-foreground hover:text-primary hover:bg-primary/10"
                    : "text-muted-foreground/50 cursor-not-allowed"
                }`}
                title="Redo (Cmd+Shift+Z)"
              >
                <Redo2 size={14} />
              </button>
              <span className="text-[8px] font-mono text-muted-foreground ml-1 tabular-nums">
                {historyIndex}/{historyLength - 1}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <HistoryTimeline />
            <CommandPalette />
          </div>
        </div>
      </header>

      <BrandPreview />

      <footer className="mt-8 text-center">
        <p className="text-[9px] font-mono text-muted-foreground/50 tracking-wider uppercase">
          built by kika · click any color to change · cmd+k for settings · cmd+z to undo
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <BrandProvider>
      <MockupTemplateProvider>
        <MockupContentProvider>
          <BrandLab />
        </MockupContentProvider>
      </MockupTemplateProvider>
    </BrandProvider>
  );
}