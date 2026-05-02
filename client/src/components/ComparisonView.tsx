import { useBrand, BrandState } from "@/contexts/BrandContext";
import { X, ArrowRight, Upload, FileText } from "lucide-react";
import { useState, useRef } from "react";

function MiniPreview({ data, label }: { data: BrandState; label: string }) {
  const sortedByLightness = [...data.colors].sort((a, b) => {
    const lA = getLightness(a.hex);
    const lB = getLightness(b.hex);
    return lA - lB;
  });

  const bgColor = sortedByLightness[0]?.hex || "#0D0D0D";
  const textColor = sortedByLightness[sortedByLightness.length - 1]?.hex || "#D9D9D9";
  const mutedColor = sortedByLightness[Math.floor(sortedByLightness.length / 2)]?.hex || "#8C8C8C";
  const accentColor = data.colors.find((c) => {
    const r = parseInt(c.hex.slice(1, 3), 16);
    const g = parseInt(c.hex.slice(3, 5), 16);
    const b = parseInt(c.hex.slice(5, 7), 16);
    return Math.max(r, g, b) - Math.min(r, g, b) > 30;
  })?.hex || data.colors[data.colors.length - 1]?.hex || "#6D80A6";

  return (
    <div className="flex flex-col h-full">
      {/* Label */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-[9px] font-mono text-border">
          {data.brandName}
        </span>
      </div>

      {/* Preview Card */}
      <div
        className="rounded-lg border border-border p-5 flex flex-col gap-4 flex-1 transition-colors duration-200"
        style={{ backgroundColor: bgColor }}
      >
        {/* Brand Name */}
        <div className="text-center">
          <p
            className="text-[8px] tracking-[0.3em] uppercase mb-1"
            style={{ color: mutedColor, fontFamily: data.monoFont }}
          >
            {data.tagline}
          </p>
          <h2
            className="text-3xl md:text-4xl font-black tracking-tight"
            style={{ color: textColor, fontFamily: data.headingFont }}
          >
            {data.brandName}
          </h2>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ backgroundColor: mutedColor, opacity: 0.3 }} />

        {/* Typography */}
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: mutedColor, fontFamily: data.monoFont }}>
              {data.bodyFont.split(",")[0]?.replace(/"/g, "")}
            </p>
            <p className="text-sm" style={{ color: textColor, fontFamily: data.bodyFont }}>
              Aa Bb Cc Dd 0123456789
            </p>
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: mutedColor, fontFamily: data.monoFont }}>
              {data.monoFont.split(",")[0]?.replace(/"/g, "")}
            </p>
            <p className="text-xs" style={{ color: accentColor, fontFamily: data.monoFont }}>
              const brand = true;
            </p>
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: mutedColor, fontFamily: data.monoFont }}>
              {data.headingFont.split(",")[0]?.replace(/"/g, "")}
            </p>
            <p className="text-sm font-black uppercase" style={{ color: textColor, fontFamily: data.headingFont }}>
              Heading Display
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ backgroundColor: mutedColor, opacity: 0.3 }} />

        {/* Color Row */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {data.colors.slice(0, 12).map((c) => (
            <div key={c.id} className="flex flex-col items-center gap-0.5">
              <div
                className="w-6 h-6 rounded-full border"
                style={{
                  backgroundColor: c.hex,
                  borderColor: getLightness(c.hex) < 20 ? mutedColor : "transparent",
                }}
              />
              <span className="text-[6px]" style={{ color: mutedColor, fontFamily: data.monoFont }}>
                {c.hex}
              </span>
            </div>
          ))}
          {data.colors.length > 12 && (
            <span className="text-[8px] font-mono" style={{ color: mutedColor }}>
              +{data.colors.length - 12}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ComparisonView() {
  const { brand, comparisonBrand, importForComparison, clearComparison, adoptComparison } = useBrand();
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importForComparison(content);
      if (!success) {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // If no comparison is active, show the upload prompt
  if (!comparisonBrand) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
          <FileText size={10} />
          compare palettes
        </h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
            status === "error"
              ? "border-red-500/60 bg-red-500/5"
              : isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-border/30 flex items-center justify-center">
            <Upload size={14} className="text-muted-foreground" />
          </div>
          <span className="text-[10px] font-mono text-center text-muted-foreground">
            {status === "error"
              ? <span className="text-red-400">parse error — check format</span>
              : "drop .md / .html to compare"
            }
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.html,.htm,text/markdown,text/plain,text/html"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // Side-by-side comparison view
  return (
    <div className="rounded-lg border border-primary/40 bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-mono uppercase tracking-wider text-primary flex items-center gap-1.5">
          <FileText size={10} />
          comparison mode
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={adoptComparison}
            className="flex items-center gap-1 text-[9px] font-mono text-green-400 hover:text-green-300 transition-colors border border-green-500/30 rounded px-2 py-1 hover:border-green-400/50 hover:bg-green-500/5"
          >
            <ArrowRight size={10} />
            adopt imported
          </button>
          <button
            onClick={clearComparison}
            className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground hover:text-red-400 transition-colors border border-border rounded px-2 py-1 hover:border-red-400/50"
          >
            <X size={10} />
            close
          </button>
        </div>
      </div>

      {/* Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniPreview data={brand} label="current" />
        <MiniPreview data={comparisonBrand} label="imported" />
      </div>

      {/* Upload new comparison */}
      <div className="mt-3 flex items-center justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-[9px] font-mono text-muted-foreground hover:text-primary transition-colors border border-dashed border-border rounded px-3 py-1.5 hover:border-primary"
        >
          upload different file to compare
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.html,.htm,text/markdown,text/plain,text/html"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (fileInputRef.current) fileInputRef.current.value = ""; }}
          className="hidden"
        />
      </div>
    </div>
  );
}

function getLightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 / 2.55;
}
