import { useBrand, builtInPresets } from "@/contexts/BrandContext";
import { Save, X, Bookmark, Pencil, RefreshCw } from "lucide-react";
import { useState } from "react";

export function PresetSelector() {
  const {
    loadPreset,
    savedPresets,
    saveCustomPreset,
    deleteCustomPreset,
    renameCustomPreset,
    updateCustomPreset,
  } = useBrand();
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleSave = () => {
    if (presetName.trim()) {
      saveCustomPreset(presetName.trim());
      setPresetName("");
      setShowSaveInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setShowSaveInput(false);
      setPresetName("");
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, oldName: string) => {
    if (e.key === "Enter") {
      renameCustomPreset(oldName, editName);
      setEditingPreset(null);
      setEditName("");
    }
    if (e.key === "Escape") {
      setEditingPreset(null);
      setEditName("");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Built-in presets row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          presets:
        </span>
        {builtInPresets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => loadPreset(preset.data)}
            className="text-[10px] font-mono px-3 py-1.5 rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-card"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Custom presets row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          saved:
        </span>

        {savedPresets.length === 0 && !showSaveInput && (
          <span className="text-[10px] font-mono text-border italic">
            none yet
          </span>
        )}

        {savedPresets.map((preset) => (
          <div key={preset.name} className="group relative flex items-center">
            {editingPreset === preset.name ? (
              /* Rename input */
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => handleRenameKeyDown(e, preset.name)}
                  onBlur={() => {
                    if (editName.trim()) renameCustomPreset(preset.name, editName);
                    setEditingPreset(null);
                    setEditName("");
                  }}
                  autoFocus
                  className="w-24 bg-background border border-primary rounded px-2 py-1 text-[10px] font-mono text-foreground outline-none"
                />
              </div>
            ) : (
              <>
                {/* Load preset */}
                <button
                  onClick={() => loadPreset(preset.data)}
                  className="text-[10px] font-mono px-3 py-1.5 rounded-l border border-primary/40 text-primary hover:border-primary hover:bg-primary/10 transition-colors bg-card flex items-center gap-1.5"
                >
                  <Bookmark size={9} />
                  {preset.name}
                </button>

                {/* Edit actions */}
                <button
                  onClick={() => {
                    setEditingPreset(preset.name);
                    setEditName(preset.name);
                  }}
                  className="text-[10px] font-mono px-1.5 py-1.5 border border-l-0 border-primary/40 text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors bg-card"
                  title="Rename preset"
                >
                  <Pencil size={9} />
                </button>

                {/* Overwrite with current */}
                <button
                  onClick={() => updateCustomPreset(preset.name)}
                  className="text-[10px] font-mono px-1.5 py-1.5 border border-l-0 border-primary/40 text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors bg-card"
                  title="Overwrite with current design"
                >
                  <RefreshCw size={9} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteCustomPreset(preset.name)}
                  className="text-[10px] font-mono px-1.5 py-1.5 rounded-r border border-l-0 border-primary/40 text-muted-foreground hover:text-red-400 hover:border-red-400/50 transition-colors bg-card"
                  title="Delete preset"
                >
                  <X size={10} />
                </button>
              </>
            )}
          </div>
        ))}

        {/* Save button / input */}
        {showSaveInput ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="preset name..."
              autoFocus
              className="w-32 bg-background border border-primary rounded px-2 py-1 text-[10px] font-mono text-foreground outline-none placeholder:text-border"
            />
            <button
              onClick={handleSave}
              disabled={!presetName.trim()}
              className="text-[10px] font-mono px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              save
            </button>
            <button
              onClick={() => {
                setShowSaveInput(false);
                setPresetName("");
              }}
              className="text-[10px] font-mono px-1.5 py-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSaveInput(true)}
            className="text-[10px] font-mono px-3 py-1.5 rounded border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Save size={10} />
            save current
          </button>
        )}
      </div>
    </div>
  );
}
