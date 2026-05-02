import { useBrand, BrandState } from "@/contexts/BrandContext";
import { History, X, ChevronRight } from "lucide-react";
import { useState } from "react";

export function HistoryTimeline() {
  const { history, historyIndex, jumpToHistory } = useBrand();
  const [isOpen, setIsOpen] = useState(false);

  if (history.length <= 1) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors duration-300 bg-card"
        title="View history timeline"
      >
        <History size={12} />
        <span className="hidden sm:inline">history</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-sm bg-background border-l border-border flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <History size={14} className="text-primary" />
                <h2 className="text-[11px] font-mono uppercase tracking-wider text-foreground">
                  History Timeline
                </h2>
                <span className="text-[9px] font-mono text-border">
                  {history.length} states
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-border/30 transition-colors duration-300"
              >
                <X size={14} />
              </button>
            </div>

            {/* Timeline List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {history.map((state, index) => (
                <HistoryEntry
                  key={index}
                  state={state}
                  index={index}
                  isCurrent={index === historyIndex}
                  isLatest={index === history.length - 1}
                  onClick={() => {
                    jumpToHistory(index);
                  }}
                />
              )).reverse()}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-border">
              <p className="text-[8px] font-mono text-border text-center uppercase tracking-wider">
                click any state to jump · cmd+z / cmd+shift+z to navigate
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HistoryEntry({
  state,
  index,
  isCurrent,
  isLatest,
  onClick,
}: {
  state: BrandState;
  index: number;
  isCurrent: boolean;
  isLatest: boolean;
  onClick: () => void;
}) {
  // Generate a label based on what changed
  const label = getStateLabel(state, index);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-all group ${
        isCurrent
          ? "bg-primary/15 border border-primary/40"
          : "border border-transparent hover:bg-card hover:border-border"
      }`}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
             isCurrent
               ? "bg-primary border-primary"
               : "bg-transparent border-border group-hover:border-muted-foreground"
          }`}
        />
      </div>

      {/* Color swatches preview */}
      <div className="flex items-center gap-0.5 shrink-0">
        {state.colors.slice(0, 6).map((c, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-sm border border-border/50"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[9px] font-mono truncate ${
              isCurrent ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
          {isLatest && (
            <span className="text-[7px] font-mono px-1 py-0.5 rounded bg-primary/10 text-primary shrink-0">
              latest
            </span>
          )}
          {isCurrent && !isLatest && (
            <span className="text-[7px] font-mono px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 shrink-0">
              current
            </span>
          )}
        </div>
         <span className="text-[8px] font-mono text-border">
          #{index} · {state.colors.length} colors · {state.headingFont.split(",")[0]}
        </span>
      </div>

      {/* Jump arrow */}
      {!isCurrent && (
        <ChevronRight
          size={12}
          className="text-border group-hover:text-muted-foreground shrink-0 transition-colors duration-300"
        />
      )}
    </button>
  );
}

function getStateLabel(state: BrandState, index: number): string {
  if (index === 0) return "Initial state";
  return `${state.brandName} · ${state.tagline.slice(0, 20)}${state.tagline.length > 20 ? "…" : ""}`;
}
