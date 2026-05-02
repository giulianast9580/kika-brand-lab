import { useBrand } from "@/contexts/BrandContext";
import { useState } from "react";
import { Eye } from "lucide-react";

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(full.substring(0, 2), 16),
    parseInt(full.substring(2, 4), 16),
    parseInt(full.substring(4, 6), 16),
  ];
}

// Calculate relative luminance (WCAG 2.1)
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG level checks
function getLevel(ratio: number): { aa: boolean; aaLarge: boolean; aaa: boolean; aaaLarge: boolean } {
  return {
    aaLarge: ratio >= 3,
    aa: ratio >= 4.5,
    aaaLarge: ratio >= 4.5,
    aaa: ratio >= 7,
  };
}

export function ContrastChecker() {
  const { brand } = useBrand();
  const [fgIndex, setFgIndex] = useState<number>(0);
  const [bgIndex, setBgIndex] = useState<number>(brand.colors.length > 4 ? 4 : brand.colors.length - 1);

  const fgColor = brand.colors[fgIndex]?.hex || "#000000";
  const bgColor = brand.colors[bgIndex]?.hex || "#FFFFFF";
  const ratio = contrastRatio(fgColor, bgColor);
  const levels = getLevel(ratio);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-4">
        <Eye size={10} />
        contrast checker
      </h3>

      {/* Color selectors */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">
            foreground
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {brand.colors.map((color, i) => (
              <button
                key={color.id}
                onClick={() => setFgIndex(i)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  fgIndex === i
                    ? "border-primary scale-125"
                    : "border-transparent hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: color.hex }}
                title={`${color.name} (${color.hex})`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground block mb-1.5">
            background
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {brand.colors.map((color, i) => (
              <button
                key={color.id}
                onClick={() => setBgIndex(i)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  bgIndex === i
                    ? "border-primary scale-125"
                    : "border-transparent hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: color.hex }}
                title={`${color.name} (${color.hex})`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className="rounded-md p-4 mb-4 border border-border"
        style={{ backgroundColor: bgColor }}
      >
        <p style={{ color: fgColor }} className="text-lg font-bold mb-1">
          Sample Heading
        </p>
        <p style={{ color: fgColor }} className="text-sm">
          Body text preview at normal size for readability testing.
        </p>
        <p style={{ color: fgColor }} className="text-xs mt-1 opacity-80">
          Small caption text — 12px equivalent.
        </p>
      </div>

      {/* Ratio + Levels */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground font-mono tabular-nums">
            {ratio.toFixed(2)}
          </div>
          <div className="text-[8px] font-mono uppercase text-muted-foreground mt-0.5">ratio</div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2">
          <LevelBadge label="AA" sublabel="normal" pass={levels.aa} />
          <LevelBadge label="AA" sublabel="large" pass={levels.aaLarge} />
          <LevelBadge label="AAA" sublabel="normal" pass={levels.aaa} />
          <LevelBadge label="AAA" sublabel="large" pass={levels.aaaLarge} />
        </div>
      </div>
    </div>
  );
}

function LevelBadge({ label, sublabel, pass }: { label: string; sublabel: string; pass: boolean }) {
  return (
    <div
      className={`rounded px-2 py-1 flex items-center justify-between border ${
        pass
          ? "border-green-800/50 bg-green-900/20"
          : "border-red-800/50 bg-red-900/20"
      }`}
    >
      <span className="text-[9px] font-mono text-foreground">
        {label} <span className="text-muted-foreground">{sublabel}</span>
      </span>
      <span className={`text-[9px] font-mono font-bold ${pass ? "text-green-400" : "text-red-400"}`}>
        {pass ? "PASS" : "FAIL"}
      </span>
    </div>
  );
}
