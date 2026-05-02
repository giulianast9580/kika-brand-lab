import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

export interface ColorSwatch {
  id: string;
  hex: string;
  name: string;
}

export interface BrandState {
  colors: ColorSwatch[];
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  brandName: string;
  tagline: string;
  logoUrl?: string;
  iconUrl?: string;
  logoSize?: number;  // px - width of logo in preview
  iconSize?: number;  // px - width/height of icon in preview
}

export interface SavedPreset {
  name: string;
  data: BrandState;
  createdAt: number;
}

interface BrandContextType {
  brand: BrandState;
  updateColor: (id: string, hex: string) => void;
  updateColorName: (id: string, name: string) => void;
  addColor: () => void;
  removeColor: (id: string) => void;
  reorderColors: (fromIndex: number, toIndex: number) => void;
  updateFont: (key: "headingFont" | "bodyFont" | "monoFont", value: string) => void;
  updateBrandName: (name: string) => void;
  updateTagline: (tagline: string) => void;
  loadPreset: (preset: BrandState) => void;
  exportCSS: () => string;
  exportJSON: () => string;
  exportDesignMd: () => string;
  savedPresets: SavedPreset[];
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (name: string) => void;
  renameCustomPreset: (oldName: string, newName: string) => void;
  updateCustomPreset: (name: string) => void;
  importDesignMd: (content: string) => boolean;
  updateLogo: (url: string | undefined) => void;
  updateIcon: (url: string | undefined) => void;
  updateLogoSize: (size: number) => void;
  updateIconSize: (size: number) => void;
  // Staged preview
  stagedBrand: BrandState | null;
  stageDesign: (content: string) => boolean;
  stageFromImage: (colors: { hex: string; name: string }[]) => void;
  clearStaged: () => void;
  applyStaged: () => void;
  isShowingStaged: boolean;
  togglePreview: () => void;
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  historyIndex: number;
  history: BrandState[];
  jumpToHistory: (index: number) => void;
  // Comparison
  comparisonBrand: BrandState | null;
  importForComparison: (content: string) => boolean;
  clearComparison: () => void;
  adoptComparison: () => void;
}

const defaultBrand: BrandState = {
  colors: [
    { id: "1", hex: "#D9D9D9", name: "Light Silver" },
    { id: "2", hex: "#BFBFBF", name: "Silver Gray" },
    { id: "3", hex: "#8C8C8C", name: "Mid Gray" },
    { id: "4", hex: "#404040", name: "Dark Charcoal" },
    { id: "5", hex: "#0D0D0D", name: "Near Black" },
    { id: "6", hex: "#6D80A6", name: "Steel Blue" },
  ],
  headingFont: "Arial Black, Impact, sans-serif",
  bodyFont: "Fira Sans, system-ui, sans-serif",
  monoFont: "Fira Code, monospace",
  brandName: "KIKA",
  tagline: "DIGITAL CRAFT — MACOS SYSTEMS",
};

const STORAGE_KEY = "kika-brand-lab-presets";

function loadSavedPresets(): SavedPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function persistPresets(presets: SavedPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

let nextId = 7;

const MAX_HISTORY = 50;

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandRaw] = useState<BrandState>(defaultBrand);
  const [comparisonBrand, setComparisonBrand] = useState<BrandState | null>(null);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(loadSavedPresets);

  // Undo/Redo history
  const [history, setHistory] = useState<BrandState[]>([defaultBrand]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const skipHistoryRef = useRef(false);

  // Wrap setBrand to push to history
  const setBrand = (updater: BrandState | ((prev: BrandState) => BrandState)) => {
    setBrandRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!skipHistoryRef.current) {
        setHistory((h) => {
          const newHistory = h.slice(0, historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(next)));
          if (newHistory.length > MAX_HISTORY) newHistory.shift();
          return newHistory;
        });
        setHistoryIndex((i) => Math.min(i + 1, MAX_HISTORY - 1));
      }
      skipHistoryRef.current = false;
      return next;
    });
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      skipHistoryRef.current = true;
      setBrandRaw(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      skipHistoryRef.current = true;
      setBrandRaw(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const jumpToHistory = (index: number) => {
    if (index >= 0 && index < history.length && index !== historyIndex) {
      setHistoryIndex(index);
      skipHistoryRef.current = true;
      setBrandRaw(JSON.parse(JSON.stringify(history[index])));
    }
  };

  useEffect(() => {
    persistPresets(savedPresets);
  }, [savedPresets]);

  // Keyboard shortcuts: Cmd+Z / Ctrl+Z for undo, Cmd+Shift+Z / Ctrl+Y for redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "Z" || e.key === "y")) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history.length]);

  const updateColor = (id: string, hex: string) => {
    setBrand((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => (c.id === id ? { ...c, hex } : c)),
    }));
  };

  const updateColorName = (id: string, name: string) => {
    setBrand((prev) => ({
      ...prev,
      colors: prev.colors.map((c) => (c.id === id ? { ...c, name } : c)),
    }));
  };

  const addColor = () => {
    setBrand((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        { id: String(nextId++), hex: "#666666", name: "New Color" },
      ],
    }));
  };

  const removeColor = (id: string) => {
    setBrand((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.id !== id),
    }));
  };

  const reorderColors = (fromIndex: number, toIndex: number) => {
    setBrand((prev) => {
      const newColors = [...prev.colors];
      const [moved] = newColors.splice(fromIndex, 1);
      newColors.splice(toIndex, 0, moved);
      return { ...prev, colors: newColors };
    });
  };

  const updateFont = (key: "headingFont" | "bodyFont" | "monoFont", value: string) => {
    setBrand((prev) => ({ ...prev, [key]: value }));
  };

  const updateBrandName = (name: string) => {
    setBrand((prev) => ({ ...prev, brandName: name }));
  };

  const updateTagline = (tagline: string) => {
    setBrand((prev) => ({ ...prev, tagline }));
  };

  const updateLogo = (url: string | undefined) => {
    setBrand((prev) => ({ ...prev, logoUrl: url }));
  };
  const updateIcon = (url: string | undefined) => {
    setBrand((prev) => ({ ...prev, iconUrl: url }));
  };
  const updateLogoSize = (size: number) => {
    setBrand((prev) => ({ ...prev, logoSize: size }));
  };
  const updateIconSize = (size: number) => {
    setBrand((prev) => ({ ...prev, iconSize: size }));
  };

  const loadPreset = (preset: BrandState) => {
    setBrand(preset);
  };

  const saveCustomPreset = (name: string) => {
    const newPreset: SavedPreset = {
      name,
      data: JSON.parse(JSON.stringify(brand)),
      createdAt: Date.now(),
    };
    setSavedPresets((prev) => {
      // Replace if same name exists
      const filtered = prev.filter((p) => p.name !== name);
      return [...filtered, newPreset];
    });
  };

  const deleteCustomPreset = (name: string) => {
    setSavedPresets((prev) => prev.filter((p) => p.name !== name));
  };

  const renameCustomPreset = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    setSavedPresets((prev) =>
      prev.map((p) => (p.name === oldName ? { ...p, name: newName.trim() } : p))
    );
  };

  const updateCustomPreset = (name: string) => {
    setSavedPresets((prev) =>
      prev.map((p) =>
        p.name === name
          ? { ...p, data: JSON.parse(JSON.stringify(brand)), createdAt: Date.now() }
          : p
      )
    );
  };

  const importDesignMd = (content: string): boolean => {
    try {
      // Normalize: strip BOM, convert CRLF to LF, trim
      const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

      // === HTML / TAILWIND CONFIG MODE ===
      // Detect if this is an HTML file with a tailwind.config
      const twConfigMatch = normalized.match(/tailwind\.config\s*=\s*\{([\s\S]*?)\}\s*<\/script>/)
        || normalized.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/);
      if (twConfigMatch || normalized.includes('tailwind.config')) {
        const colors: { id: string; hex: string; name: string }[] = [];
        let headingFont = brand.headingFont;
        let bodyFont = brand.bodyFont;
        let monoFont = brand.monoFont;
        let parsedName = "";

        // Extract colors from "colors": { ... } block
        const colorsBlockMatch = normalized.match(/"colors"\s*:\s*\{([^}]+)\}/);
        if (colorsBlockMatch) {
          const colorEntries = colorsBlockMatch[1];
          const colorPairRegex = /"([\w-]+)"\s*:\s*"(#[0-9A-Fa-f]{6})"/g;
          let cp: RegExpExecArray | null;
          while ((cp = colorPairRegex.exec(colorEntries)) !== null) {
            colors.push({
              id: String(colors.length + 1),
              hex: cp[2].toUpperCase(),
              name: cp[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            });
          }
        }

        // Extract fontFamily
        const fontFamilyMatch = normalized.match(/"fontFamily"\s*:\s*\{([^}]+)\}/);
        if (fontFamilyMatch) {
          const fontBlock = fontFamilyMatch[1];
          const headlineMatch = fontBlock.match(/"headline"\s*:\s*\["([^"]+)"\]/);
          const bodyMatch = fontBlock.match(/"body"\s*:\s*\["([^"]+)"\]/);
          const labelMatch = fontBlock.match(/"label"\s*:\s*\["([^"]+)"\]/);
          const monoMatch = fontBlock.match(/"mono"\s*:\s*\["([^"]+)"\]/);

          if (headlineMatch) headingFont = headlineMatch[1] + ", sans-serif";
          if (bodyMatch) bodyFont = bodyMatch[1] + ", system-ui, sans-serif";
          else if (labelMatch) bodyFont = labelMatch[1] + ", system-ui, sans-serif";
          if (monoMatch) monoFont = monoMatch[1] + ", monospace";
        }

        // Try to get title from <title> tag
        const titleTagMatch = normalized.match(/<title>([^<]+)<\/title>/);
        if (titleTagMatch) parsedName = titleTagMatch[1].trim();

        if (colors.length === 0) return false;

        setBrand({
          colors,
          headingFont,
          bodyFont,
          monoFont,
          brandName: parsedName || brand.brandName,
          tagline: brand.tagline,
        });
        return true;
      }

      // Try YAML front matter first
      const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---/);

      const colors: { id: string; hex: string; name: string }[] = [];
      let headingFont = brand.headingFont;
      let bodyFont = brand.bodyFont;
      let monoFont = brand.monoFont;
      let parsedName = "";
      let parsedTagline = "";

      if (fmMatch) {
        // === YAML FRONT MATTER MODE ===
        const yaml = fmMatch[1];

        const nameMatch = yaml.match(/^name:\s*["']?(.+?)["']?$/m);
        const descMatch = yaml.match(/^description:\s*["']?(.+?)["']?$/m);
        parsedName = nameMatch?.[1]?.trim() || "";
        parsedTagline = descMatch?.[1]?.trim() || "";

        // Parse colors block
        const colorBlockMatch = yaml.match(/^colors:\n((?:[ \t]+.+\n?)*)/m);
        if (colorBlockMatch) {
          const lines = colorBlockMatch[1].split("\n");
          lines.forEach((line) => {
            const m = line.match(/^\s+([\w-]+):\s*["']?(#[0-9A-Fa-f]{3,8})["']?/);
            if (m) {
              let hex = m[2];
              if (hex.length === 4) {
                hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
              }
              colors.push({
                id: String(colors.length + 1),
                hex: hex.slice(0, 7),
                name: m[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              });
            }
          });
        }

        // Fallback: scan yaml for hex patterns
        if (colors.length === 0) {
          const colorRegex = /^\s+([\w-]+):\s*["']?(#[0-9A-Fa-f]{6})["']?/gm;
          let cm: RegExpExecArray | null;
          while ((cm = colorRegex.exec(yaml)) !== null) {
            colors.push({
              id: String(colors.length + 1),
              hex: cm[2],
              name: cm[1].replace(/-/g, " ").replace(/\b\w/g, (ch: string) => ch.toUpperCase()),
            });
          }
        }

        // Parse typography from fontFamily keys
        const allFontMatches: RegExpExecArray[] = [];
        const fontRegex = /fontFamily:\s*(.+)/gm;
        let fmr: RegExpExecArray | null;
        while ((fmr = fontRegex.exec(yaml)) !== null) {
          allFontMatches.push(fmr);
        }
        if (allFontMatches.length > 0) headingFont = allFontMatches[0][1].trim() + ", sans-serif";
        if (allFontMatches.length > 1) bodyFont = allFontMatches[1][1].trim() + ", system-ui, sans-serif";
        if (allFontMatches.length > 2) monoFont = allFontMatches[2][1].trim() + ", monospace";

      } else {
        // === PLAIN MARKDOWN MODE ===
        // Extract all unique hex colors from the document
        const hexSet = new Set<string>();
        const hexRegex = /#[0-9A-Fa-f]{6}\b/g;
        let hm: RegExpExecArray | null;
        while ((hm = hexRegex.exec(normalized)) !== null) {
          hexSet.add(hm[0].toUpperCase());
        }

        // Try to extract color names from context like `name` (#HEX) or `name`: #HEX
        const namedColorRegex = /[`'"]?([\w-]+)[`'"]?\s*(?:\(|:\s*)\s*(#[0-9A-Fa-f]{6})\b/g;
        const namedColors = new Map<string, string>();
        let ncm: RegExpExecArray | null;
        while ((ncm = namedColorRegex.exec(normalized)) !== null) {
          const name = ncm[1].replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const hex = ncm[2].toUpperCase();
          if (!namedColors.has(hex)) {
            namedColors.set(hex, name);
          }
        }

        // Build colors array — prefer named, fill unnamed with generic labels
        let colorIndex = 0;
        hexSet.forEach((hex) => {
          colorIndex++;
          const name = namedColors.get(hex) || `Color ${colorIndex}`;
          colors.push({
            id: String(colorIndex),
            hex,
            name,
          });
        });

        // Extract fonts from markdown — look for font names in parentheses or bold
        const fontMentions = normalized.match(/\*\*?\(?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\)?\*\*?/g);
        const fontCandidates: string[] = [];
        if (fontMentions) {
          const knownFonts = ["Space Grotesk", "Inter", "Fira Sans", "Fira Code", "Arial Black",
            "Roboto", "Roboto Mono", "JetBrains Mono", "IBM Plex Mono", "IBM Plex Sans",
            "Manrope", "Outfit", "Poppins", "Montserrat", "DM Sans", "DM Mono",
            "Source Code Pro", "Geist", "Geist Mono", "SF Mono", "Courier New"];
          fontMentions.forEach((mention) => {
            const clean = mention.replace(/\*+/g, "").replace(/[()]/g, "").trim();
            if (knownFonts.some((f) => clean.includes(f))) {
              fontCandidates.push(clean);
            }
          });
        }

        // Also scan for font names in parentheses like "(Space Grotesk)"
        const parenFontRegex = /\(([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\)/g;
        let pfm: RegExpExecArray | null;
        while ((pfm = parenFontRegex.exec(normalized)) !== null) {
          const knownFonts = ["Space Grotesk", "Inter", "Fira Sans", "Fira Code", "Arial Black",
            "Roboto", "Roboto Mono", "JetBrains Mono", "IBM Plex Mono", "IBM Plex Sans",
            "Manrope", "Outfit", "Poppins", "Montserrat", "DM Sans", "DM Mono",
            "Source Code Pro", "Geist", "Geist Mono", "SF Mono", "Courier New"];
          if (knownFonts.some((f) => pfm![1].includes(f))) {
            if (!fontCandidates.includes(pfm[1])) {
              fontCandidates.push(pfm[1]);
            }
          }
        }

        if (fontCandidates.length > 0) headingFont = fontCandidates[0] + ", sans-serif";
        if (fontCandidates.length > 1) bodyFont = fontCandidates[1] + ", system-ui, sans-serif";
        if (fontCandidates.length > 2) monoFont = fontCandidates[2] + ", monospace";

        // Try to get a title from the first heading
        const titleMatch = normalized.match(/^#\s+(.+)$/m);
        if (titleMatch) parsedName = titleMatch[1].replace(/[*_`]/g, "").trim();
      }

      if (colors.length === 0) return false;

      // Only apply colors — preserve existing brand name, tagline, and fonts
      setBrand((prev) => ({
        ...prev,
        colors,
      }));

      return true;
    } catch {
      return false;
    }
  };

  // === STAGED PREVIEW FUNCTIONS ===
  const [stagedBrand, setStagedBrand] = useState<BrandState | null>(null);
  const [isShowingStaged, setIsShowingStaged] = useState(false);

  const stageDesign = (content: string): boolean => {
    try {
      const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      const colors: { id: string; hex: string; name: string }[] = [];

      // HTML / Tailwind config mode
      if (normalized.includes('tailwind.config')) {
        const colorRegex = /'([^']+)':\s*'(#[0-9A-Fa-f]{3,8})'/g;
        let cm: RegExpExecArray | null;
        while ((cm = colorRegex.exec(normalized)) !== null) {
          colors.push({
            id: String(colors.length + 1),
            hex: cm[2].length === 4 ? `#${cm[2][1]}${cm[2][1]}${cm[2][2]}${cm[2][2]}${cm[2][3]}${cm[2][3]}` : cm[2],
            name: cm[1].replace(/-/g, " ").replace(/\b\w/g, (ch: string) => ch.toUpperCase()),
          });
        }
      } else {
        // Plain markdown — extract hex colors
        const hexSet = new Set<string>();
        const hexRegex = /#[0-9A-Fa-f]{6}\b/g;
        let hm: RegExpExecArray | null;
        while ((hm = hexRegex.exec(normalized)) !== null) {
          hexSet.add(hm[0].toUpperCase());
        }
        const namedColorRegex = /[`'"]?([\w-]+)[`'"]?\s*(?:\(|:\s*)\s*(#[0-9A-Fa-f]{6})\b/g;
        const namedColors = new Map<string, string>();
        let ncm: RegExpExecArray | null;
        while ((ncm = namedColorRegex.exec(normalized)) !== null) {
          const name = ncm[1].replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          if (!namedColors.has(ncm[2].toUpperCase())) namedColors.set(ncm[2].toUpperCase(), name);
        }
        let idx = 0;
        hexSet.forEach((hex) => {
          idx++;
          colors.push({ id: String(idx), hex, name: namedColors.get(hex) || `Color ${idx}` });
        });
      }

      if (colors.length === 0) return false;

      // Stage as a preview — keep current brand name/tagline/fonts, only swap colors
      setStagedBrand({ ...brand, colors });
      setIsShowingStaged(true);
      return true;
    } catch {
      return false;
    }
  };

  const stageFromImage = (colors: { hex: string; name: string }[]) => {
    const newColors = colors.map((c, i) => ({ id: String(i + 1), hex: c.hex, name: c.name }));
    setStagedBrand({ ...brand, colors: newColors });
    setIsShowingStaged(true);
  };

  const clearStaged = () => {
    setStagedBrand(null);
    setIsShowingStaged(false);
  };

  const applyStaged = () => {
    if (stagedBrand) {
      setBrand(stagedBrand);
    }
    setStagedBrand(null);
    setIsShowingStaged(false);
  };

  const togglePreview = () => {
    if (stagedBrand) {
      setIsShowingStaged((prev) => !prev);
    }
  };

  // Keyboard shortcut: Space to toggle between original and staged
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
      if (e.key === " " && stagedBrand) {
        e.preventDefault();
        setIsShowingStaged((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stagedBrand]);

  // === COMPARISON FUNCTIONS ===
  const importForComparison = (content: string): boolean => {
    try {
      const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      const colors: { id: string; hex: string; name: string }[] = [];
      let headingFont = brand.headingFont;
      let bodyFont = brand.bodyFont;
      let monoFont = brand.monoFont;
      let parsedName = "";
      let parsedTagline = "";

      // HTML / Tailwind config mode
      if (normalized.includes('tailwind.config')) {
        const colorsBlockMatch = normalized.match(/"colors"\s*:\s*\{([^}]+)\}/);
        if (colorsBlockMatch) {
          const colorPairRegex = /"([\w-]+)"\s*:\s*"(#[0-9A-Fa-f]{6})"/g;
          let cp: RegExpExecArray | null;
          while ((cp = colorPairRegex.exec(colorsBlockMatch[1])) !== null) {
            colors.push({
              id: String(colors.length + 1),
              hex: cp[2].toUpperCase(),
              name: cp[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            });
          }
        }
        const fontFamilyMatch = normalized.match(/"fontFamily"\s*:\s*\{([^}]+)\}/);
        if (fontFamilyMatch) {
          const headlineMatch = fontFamilyMatch[1].match(/"headline"\s*:\s*\["([^"]+)"\]/);
          const bodyMatch = fontFamilyMatch[1].match(/"body"\s*:\s*\["([^"]+)"\]/);
          const monoMatch = fontFamilyMatch[1].match(/"mono"\s*:\s*\["([^"]+)"\]/);
          if (headlineMatch) headingFont = headlineMatch[1] + ", sans-serif";
          if (bodyMatch) bodyFont = bodyMatch[1] + ", system-ui, sans-serif";
          if (monoMatch) monoFont = monoMatch[1] + ", monospace";
        }
        const titleTagMatch = normalized.match(/<title>([^<]+)<\/title>/);
        if (titleTagMatch) parsedName = titleTagMatch[1].trim();
      } else {
        // Plain markdown mode
        const hexSet = new Set<string>();
        const hexRegex = /#[0-9A-Fa-f]{6}\b/g;
        let hm: RegExpExecArray | null;
        while ((hm = hexRegex.exec(normalized)) !== null) {
          hexSet.add(hm[0].toUpperCase());
        }
        const namedColorRegex = /[`'"]?([\w-]+)[`'"]?\s*(?:\(|:\s*)\s*(#[0-9A-Fa-f]{6})\b/g;
        const namedColors = new Map<string, string>();
        let ncm: RegExpExecArray | null;
        while ((ncm = namedColorRegex.exec(normalized)) !== null) {
          const name = ncm[1].replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          if (!namedColors.has(ncm[2].toUpperCase())) namedColors.set(ncm[2].toUpperCase(), name);
        }
        let colorIndex = 0;
        hexSet.forEach((hex) => {
          colorIndex++;
          colors.push({ id: String(colorIndex), hex, name: namedColors.get(hex) || `Color ${colorIndex}` });
        });
        const parenFontRegex = /\(([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\)/g;
        let pfm: RegExpExecArray | null;
        const knownFonts = ["Space Grotesk", "Inter", "Fira Sans", "Fira Code", "Arial Black",
          "Roboto", "JetBrains Mono", "IBM Plex Mono", "Manrope", "Poppins", "Montserrat"];
        const fontCandidates: string[] = [];
        while ((pfm = parenFontRegex.exec(normalized)) !== null) {
          if (knownFonts.some((f) => pfm![1].includes(f)) && !fontCandidates.includes(pfm[1])) {
            fontCandidates.push(pfm[1]);
          }
        }
        if (fontCandidates.length > 0) headingFont = fontCandidates[0] + ", sans-serif";
        if (fontCandidates.length > 1) bodyFont = fontCandidates[1] + ", system-ui, sans-serif";
        const titleMatch = normalized.match(/^#\s+(.+)$/m);
        if (titleMatch) parsedName = titleMatch[1].replace(/[*_`]/g, "").trim();
      }

      if (colors.length === 0) return false;

      setComparisonBrand({
        colors,
        headingFont,
        bodyFont,
        monoFont,
        brandName: parsedName || "Imported",
        tagline: parsedTagline || "imported palette",
      });
      return true;
    } catch {
      return false;
    }
  };

  const clearComparison = () => {
    setComparisonBrand(null);
  };

  const adoptComparison = () => {
    if (comparisonBrand) {
      setBrand(comparisonBrand);
      setComparisonBrand(null);
    }
  };

  const exportCSS = () => {
    let css = `:root {\n`;
    brand.colors.forEach((c) => {
      const varName = c.name.toLowerCase().replace(/\s+/g, "-");
      css += `  --color-${varName}: ${c.hex};\n`;
    });
    css += `  --font-heading: ${brand.headingFont};\n`;
    css += `  --font-body: ${brand.bodyFont};\n`;
    css += `  --font-mono: ${brand.monoFont};\n`;
    css += `}\n`;
    return css;
  };

  const exportJSON = () => {
    return JSON.stringify(
      {
        colors: brand.colors.map((c) => ({ name: c.name, hex: c.hex })),
        typography: {
          heading: brand.headingFont,
          body: brand.bodyFont,
          mono: brand.monoFont,
        },
        brand: {
          name: brand.brandName,
          tagline: brand.tagline,
        },
      },
      null,
      2
    );
  };

  const exportDesignMd = () => {
    const headingFamily = brand.headingFont.split(",")[0]?.trim().replace(/"/g, "") || "Inter";
    const bodyFamily = brand.bodyFont.split(",")[0]?.trim().replace(/"/g, "") || "Inter";
    const monoFamily = brand.monoFont.split(",")[0]?.trim().replace(/"/g, "") || "JetBrains Mono";

    const sorted = [...brand.colors].sort((a, b) => getLightness(a.hex) - getLightness(b.hex));
    const darkest = sorted[0];
    const lightest = sorted[sorted.length - 1];
    const accent = brand.colors.find((c) => {
      const r = parseInt(c.hex.slice(1, 3), 16);
      const g = parseInt(c.hex.slice(3, 5), 16);
      const b = parseInt(c.hex.slice(5, 7), 16);
      return Math.max(r, g, b) - Math.min(r, g, b) > 30;
    }) || brand.colors[brand.colors.length - 1];

    const hasChromaticAccent = accent && (() => {
      const r = parseInt(accent.hex.slice(1, 3), 16);
      const g = parseInt(accent.hex.slice(3, 5), 16);
      const b = parseInt(accent.hex.slice(5, 7), 16);
      return Math.max(r, g, b) - Math.min(r, g, b) > 30;
    })();

    const midGrays = sorted.filter((c) => {
      const l = getLightness(c.hex);
      return l > 15 && l < 75 && c !== accent;
    });

    const colorLines = (colors: ColorSwatch[], mode: "dark" | "light") => {
      const sortedColors = [...colors].sort((a, b) => getLightness(a.hex) - getLightness(b.hex));
      const dark = sortedColors[0];
      const light = sortedColors[sortedColors.length - 1];
      const mids = sortedColors.filter((c) => {
        const l = getLightness(c.hex);
        return l > 15 && l < 75;
      });
      const acc = colors.find((c) => {
        const r = parseInt(c.hex.slice(1, 3), 16);
        const g = parseInt(c.hex.slice(3, 5), 16);
        const b = parseInt(c.hex.slice(5, 7), 16);
        return Math.max(r, g, b) - Math.min(r, g, b) > 30;
      }) || colors[colors.length - 1];

      if (mode === "dark") {
        let lines = `### Dark Mode\n\n`;
        lines += `- **Background**: ${dark.hex.toUpperCase()} (${dark.name})\n`;
        lines += `- **Surface**: ${mids[0]?.hex.toUpperCase() || dark.hex.toUpperCase()} (${mids[0]?.name || dark.name})\n`;
        lines += `- **Primary Text**: ${light.hex.toUpperCase()} (${light.name})\n`;
        lines += `- **Secondary Text**: ${mids[1]?.hex.toUpperCase() || midGrays[0]?.hex.toUpperCase() || "#8C8C8C"} (${mids[1]?.name || "Muted"})\n`;
        lines += `- **Accent**: ${acc.hex.toUpperCase()} (${acc.name})\n`;
        lines += `- **Border**: ${mids[0]?.hex.toUpperCase() || "#404040"} (${mids[0]?.name || "Border"})\n`;
        return lines;
      } else {
        let lines = `### Light Mode\n\n`;
        lines += `- **Background**: ${light.hex.toUpperCase()} (${light.name})\n`;
        lines += `- **Surface**: ${mids.length > 1 ? mids[mids.length - 1]?.hex.toUpperCase() : "#F5F5F5"} (${mids.length > 1 ? mids[mids.length - 1]?.name : "Surface"})\n`;
        lines += `- **Primary Text**: ${dark.hex.toUpperCase()} (${dark.name})\n`;
        lines += `- **Secondary Text**: ${mids[0]?.hex.toUpperCase() || midGrays[0]?.hex.toUpperCase() || "#666666"} (${mids[0]?.name || "Muted"})\n`;
        lines += `- **Accent**: ${acc.hex.toUpperCase()} (${acc.name})\n`;
        lines += `- **Border**: ${mids.length > 1 ? mids[1]?.hex.toUpperCase() : mids[0]?.hex.toUpperCase() || "#E0E0E0"} (${mids.length > 1 ? mids[1]?.name : "Border"})\n`;
        return lines;
      }
    };

    const md = `# Design System — ${brand.brandName}

${brand.tagline}

## 1. Visual Theme & Atmosphere

${brand.brandName}'s interface is built on contrast and restraint — a monochromatic foundation${hasChromaticAccent ? " punctuated by a single accent color" : ""} that gives every element purpose. The design feels authored rather than assembled: ${darkest.name.toLowerCase()} backgrounds create depth, ${lightest.name.toLowerCase()} text creates clarity, and ${accent.name.toLowerCase()} draws the eye exactly where it needs to go.

The typographic system runs on three voices — ${headingFamily} for impact, ${bodyFamily} for readability, and ${monoFamily} for precision. Together they create a rhythm that shifts between expressive display and quiet utility.

**Key Characteristics:**
- ${hasChromaticAccent ? "Monochromatic foundation with a single accent color for interactive elements" : "Pure monochromatic palette — no accent color, just contrast"}
- ${darkest.name} (${darkest.hex.toUpperCase()}) as the primary dark surface
- ${lightest.name} (${lightest.hex.toUpperCase()}) as the primary light surface
- Three-voice typographic system: ${headingFamily}, ${bodyFamily}, ${monoFamily}
- Bento-grid layout with generous spacing (8px base unit)
- Minimal borders, zero shadows — depth through color value, not decoration
- Monospace labels and metadata for a terminal-inspired precision

## 2. Color Palette & Roles

### Full Palette

${brand.colors.map((c) => `- **${c.name}** (\`${c.hex.toUpperCase()}\`): ${getColorDescription(c, brand.colors)}`).join("\n")}

${colorLines(brand.colors, "dark")}

${colorLines(brand.colors, "light")}

## 3. Typography Rules

### Font Families

- **${headingFamily}** — Headlines, brand wordmark, and display text. Maximum impact at heavy weights.
- **${bodyFamily}** — Body text, readable content, and paragraphs. Clean and legible.
- **${monoFamily}** — UI labels, code snippets, metadata, and small-caps navigation markers. Terminal-inspired precision.

### Type Scale

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | ${headingFamily} | 3rem (48px) | 900 | 1.1 | -0.02em | Brand wordmark, hero headlines |
| Section Heading | ${headingFamily} | 2.25rem (36px) | 800 | 1.1 | -0.01em | Feature section titles |
| Sub-heading | ${headingFamily} | 1.5rem (24px) | 700 | 1.2 | normal | Card headings, sub-sections |
| Body | ${bodyFamily} | 1rem (16px) | 400 | 1.5 | normal | Standard body text, paragraphs |
| Body Small | ${bodyFamily} | 0.875rem (14px) | 400 | 1.5 | normal | Secondary body text |
| Label / Caps | ${monoFamily} | 0.625rem (10px) | 500 | 1.4 | 0.3em | Uppercase labels, section markers |
| Code / Mono | ${monoFamily} | 0.875rem (14px) | 400 | 1.6 | normal | Code blocks, technical content |

### Principles

- **Three voices, one system**: Display headings demand attention, body text invites reading, monospace provides structural rhythm.
- **Weight contrast creates hierarchy**: 900 for headlines, 400 for body, 500 for labels — the shift is deliberate.
- **Uppercase labels with tracking**: All-caps monospace labels at 0.3em letter-spacing create navigational signposts.
- **Tight display, loose body**: Hero text at 1.1 line-height, body at 1.5 — each tuned for its role.

## 4. Component Stylings

### Buttons

- **Primary**: Accent background (${accent.hex.toUpperCase()}), darkest text (${darkest.hex.toUpperCase()}), small radius (4px), generous horizontal padding (16–24px)
- **Primary Hover**: Lighter accent or lightest color (${lightest.hex.toUpperCase()})
- **Secondary**: Transparent background, border in muted tone, text in primary color
- **Size**: 14px label text in ${monoFamily}, weight 500, uppercase, 0.3em tracking

### Cards & Containers

- **Dark Mode**: ${darkest.hex.toUpperCase()} background with ${lightest.hex.toUpperCase()} text
- **Light Mode**: ${lightest.hex.toUpperCase()} background with ${darkest.hex.toUpperCase()} text
- **Border**: 1px solid muted tone — barely visible containment
- **Radius**: 4px (sharp), 8px (standard), 12px (comfortable)
- **Shadow**: None — depth comes from surface color value, not drop shadows

### Navigation

- Horizontal top navigation, transparent over content
- Brand wordmark in ${headingFamily} at display weight
- Links in ${monoFamily} at 10px, uppercase, 0.3em tracking
- Hover: shift to accent color (${accent.hex.toUpperCase()})

### Color Swatches

- Circular or rounded-rect swatches showing each palette color
- Hex label below in monospace (${monoFamily})
- Arranged horizontally with even spacing (24–32px gaps)

## 5. Layout Principles

### Spacing System

- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Section spacing: 48–64px vertical
- Component gaps: 16–24px

### Grid

- Bento grid: asymmetric cells with generous gutters
- Content is either tightly grouped (related) or pushed far apart (distinct)
- Max content width: 1200px, centered
- Mobile: single column, stacked

### Whitespace Philosophy

- Dark surfaces feel expansive, not empty — negative space is intentional
- Grouped items stay tight (8–12px); distinct sections breathe (48–64px)
- The monospace labels and metadata act as spatial punctuation

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow, no border | Primary surfaces, content areas |
| Bordered | 1px solid muted tone | Cards, containers, input fields |
| Elevated | Darker surface on dark, lighter surface on light | Modals, dropdowns, overlays |
| Accent | Accent color fill | CTAs, active states, highlights |

**Shadow Philosophy**: Zero drop shadows. Depth is communicated through color value: darker = deeper, lighter = elevated. The accent color marks interactive and active states.

## 7. Do's and Don'ts

### Do
- Use ${darkest.name.toLowerCase()} (${darkest.hex.toUpperCase()}) as the primary dark surface
- Use ${lightest.name.toLowerCase()} (${lightest.hex.toUpperCase()}) as the primary text on dark backgrounds
- Use ${accent.name.toLowerCase()} (${accent.hex.toUpperCase()}) for interactive elements and CTAs
- Use ${monoFamily} for all labels, metadata, and code — it's the structural voice
- Maintain high contrast between text and background at all times
- Use the bento grid for layout — asymmetric, purposeful, breathable
- Support both dark and light modes with inverted color roles

### Don't
- Don't add decorative colors beyond the accent
- Don't use drop shadows — depth through color value only
- Don't use rounded corners larger than 12px
- Don't use warm colors unless they're part of the accent
- Don't mix typefaces outside the three-voice system
- Don't use body line-height below 1.4 — readability matters
- Don't add decorative elements — function is the form

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, stacked cards, reduced type scale |
| Tablet | 640–768px | 2-column bento grid |
| Desktop | 768–1280px | Full bento grid, expanded hero |
| Large | >1280px | Max-width 1200px, generous margins |

### Touch Targets

- Minimum 44px tap targets
- Color swatches at 40px minimum
- Buttons with 12px vertical padding

## 9. Agent Prompt Guide

### Quick Color Reference

**Dark Mode:**
- Background: ${darkest.name} (${darkest.hex.toUpperCase()})
- Surface: ${sorted[1]?.name || "Dark Surface"} (${sorted[1]?.hex.toUpperCase() || "#1A1A1A"})
- Primary Text: ${lightest.hex.toUpperCase()} (${lightest.name})
- Secondary Text: ${midGrays[0]?.hex.toUpperCase() || "#8C8C8C"} (${midGrays[0]?.name || "Muted"})
- Accent: ${accent.hex.toUpperCase()} (${accent.name})
- Border: ${midGrays[0]?.hex.toUpperCase() || "#404040"} (${midGrays[0]?.name || "Border"})

**Light Mode:**
- Background: ${lightest.name} (${lightest.hex.toUpperCase()})
- Surface: ${midGrays.length > 1 ? midGrays[midGrays.length - 1]?.name : "Light Surface"} (${midGrays.length > 1 ? midGrays[midGrays.length - 1]?.hex.toUpperCase() : "#F5F5F5"})
- Primary Text: ${darkest.hex.toUpperCase()} (${darkest.name})
- Secondary Text: ${midGrays[0]?.hex.toUpperCase() || "#666666"} (${midGrays[0]?.name || "Muted"})
- Accent: ${accent.hex.toUpperCase()} (${accent.name})
- Border: ${midGrays.length > 1 ? midGrays[1]?.hex.toUpperCase() : midGrays[0]?.hex.toUpperCase() || "#E0E0E0"} (${midGrays.length > 1 ? midGrays[1]?.name : "Border"})

### Example Prompts

- "Create a hero section with ${darkest.hex.toUpperCase()} background, 48px ${headingFamily} headline in ${lightest.hex.toUpperCase()}, and a 10px uppercase label in ${monoFamily} with 0.3em tracking."
- "Design a bento grid card with ${sorted[1]?.hex.toUpperCase() || "#1A1A1A"} surface, ${lightest.hex.toUpperCase()} text, and ${accent.hex.toUpperCase()} accent for interactive elements."
- "Build a color palette display: circles for each color, hex labels in ${monoFamily} at 10px, arranged horizontally with 24px gaps, on ${darkest.hex.toUpperCase()} background."
- "Create a light mode variant: swap to ${lightest.hex.toUpperCase()} background, ${darkest.hex.toUpperCase()} text, keep ${accent.hex.toUpperCase()} as the accent."

### CSS Variables

\`\`\`css
:root {
${brand.colors.map((c) => `  --color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.hex.toUpperCase()};`).join("\n")}
  --font-heading: ${brand.headingFont};
  --font-body: ${brand.bodyFont};
  --font-mono: ${brand.monoFont};
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
\`\`\`
`;

    return md;
  };

  return (
    <BrandContext.Provider
      value={{
        brand,
        updateColor,
        updateColorName,
        addColor,
        removeColor,
        reorderColors,
        updateFont,
        updateBrandName,
        updateTagline,
        loadPreset,
        exportCSS,
        exportJSON,
        exportDesignMd,
        savedPresets,
        saveCustomPreset,
        deleteCustomPreset,
        renameCustomPreset,
        updateCustomPreset,
        importDesignMd,
        updateLogo,
        updateIcon,
        updateLogoSize,
        updateIconSize,
        stagedBrand,
        stageDesign,
        stageFromImage,
        clearStaged,
        applyStaged,
        isShowingStaged,
        togglePreview,
        undo,
        redo,
        canUndo,
        canRedo,
        historyLength: history.length,
        historyIndex,
        history,
        jumpToHistory,
        comparisonBrand,
        importForComparison,
        clearComparison,
        adoptComparison,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useBrand must be used within BrandProvider");
  return context;
}

// Helper functions
function getLightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 / 2.55;
}

function getColorDescription(color: ColorSwatch, allColors: ColorSwatch[]): string {
  const lightness = getLightness(color.hex);
  const r = parseInt(color.hex.slice(1, 3), 16);
  const g = parseInt(color.hex.slice(3, 5), 16);
  const b = parseInt(color.hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const isChromatic = max - min > 30;

  if (isChromatic) return "The accent color — sole driver for interaction and visual emphasis.";
  if (lightness > 80) return "Light tone for primary text and headings on dark backgrounds.";
  if (lightness > 60) return "Mid-light tone for secondary text and subtle UI elements.";
  if (lightness > 35) return "Mid-tone for muted text, borders, and metadata.";
  if (lightness > 15) return "Dark tone for elevated surfaces and structural borders.";
  return "Near-black foundation — primary background canvas.";
}

// Built-in Presets
export const builtInPresets: { name: string; data: BrandState }[] = [
  {
    name: "KIKA Default",
    data: defaultBrand,
  },
  {
    name: "Warm Noir",
    data: {
      colors: [
        { id: "1", hex: "#F5E6D3", name: "Cream" },
        { id: "2", hex: "#D4A574", name: "Warm Sand" },
        { id: "3", hex: "#8B6914", name: "Amber" },
        { id: "4", hex: "#3D2B1F", name: "Dark Brown" },
        { id: "5", hex: "#1A1A1A", name: "Charcoal" },
        { id: "6", hex: "#C75B39", name: "Burnt Orange" },
      ],
      headingFont: "Arial Black, Impact, sans-serif",
      bodyFont: "Fira Sans, system-ui, sans-serif",
      monoFont: "Fira Code, monospace",
      brandName: "KIKA",
      tagline: "DIGITAL CRAFT — MACOS SYSTEMS",
    },
  },
  {
    name: "Cyber Cold",
    data: {
      colors: [
        { id: "1", hex: "#E0F7FA", name: "Ice White" },
        { id: "2", hex: "#80DEEA", name: "Cyan" },
        { id: "3", hex: "#4DB6AC", name: "Teal" },
        { id: "4", hex: "#263238", name: "Dark Slate" },
        { id: "5", hex: "#0A0F14", name: "Void" },
        { id: "6", hex: "#00BCD4", name: "Electric Cyan" },
      ],
      headingFont: "Arial Black, Impact, sans-serif",
      bodyFont: "Fira Sans, system-ui, sans-serif",
      monoFont: "Fira Code, monospace",
      brandName: "KIKA",
      tagline: "DIGITAL CRAFT — MACOS SYSTEMS",
    },
  },
  {
    name: "Neon Punk",
    data: {
      colors: [
        { id: "1", hex: "#F0F0F0", name: "White" },
        { id: "2", hex: "#C8FF00", name: "Neon Yellow" },
        { id: "3", hex: "#FF006E", name: "Hot Pink" },
        { id: "4", hex: "#2D2D2D", name: "Dark Gray" },
        { id: "5", hex: "#0D0D0D", name: "Black" },
        { id: "6", hex: "#8B5CF6", name: "Violet" },
      ],
      headingFont: "Arial Black, Impact, sans-serif",
      bodyFont: "Fira Sans, system-ui, sans-serif",
      monoFont: "Fira Code, monospace",
      brandName: "KIKA",
      tagline: "DIGITAL CRAFT — MACOS SYSTEMS",
    },
  },
  {
    name: "Minimal Mono",
    data: {
      colors: [
        { id: "1", hex: "#FFFFFF", name: "White" },
        { id: "2", hex: "#E5E5E5", name: "Light Gray" },
        { id: "3", hex: "#999999", name: "Gray" },
        { id: "4", hex: "#333333", name: "Dark" },
        { id: "5", hex: "#000000", name: "Black" },
        { id: "6", hex: "#555555", name: "Mid" },
      ],
      headingFont: "Arial Black, Impact, sans-serif",
      bodyFont: "Fira Sans, system-ui, sans-serif",
      monoFont: "Fira Code, monospace",
      brandName: "KIKA",
      tagline: "DIGITAL CRAFT — MACOS SYSTEMS",
    },
  },
];
