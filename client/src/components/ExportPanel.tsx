import { useBrand, type BrandState } from "@/contexts/BrandContext";
import { Copy, Check, Download, Maximize2, X, Package } from "lucide-react";
import JSZip from "jszip";
import { useState, useCallback } from "react";

type TabType = "css" | "json" | "design.md";

function lightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 / 2.55;
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const parts = dataUrl.split(",");
  if (parts.length < 2) return null;
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function generateBrandBoardImage(brand: BrandState, mode: "dark" | "light" = "dark"): string | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const width = 1200;
  const height = 800;
  canvas.width = width;
  canvas.height = height;

  const sorted = [...brand.colors].sort((a, b) => lightness(a.hex) - lightness(b.hex));
  const darkestColor = sorted[0]?.hex || "#0D0D0D";
  const lightestColor = sorted[sorted.length - 1]?.hex || "#D9D9D9";
  const midColor = sorted[Math.floor(sorted.length / 2)]?.hex || "#8C8C8C";
  const accentColor =
    brand.colors.find((c) => {
      const r = parseInt(c.hex.slice(1, 3), 16);
      const g = parseInt(c.hex.slice(3, 5), 16);
      const b = parseInt(c.hex.slice(5, 7), 16);
      return Math.max(r, g, b) - Math.min(r, g, b) > 30;
    })?.hex || brand.colors[brand.colors.length - 1]?.hex || "#6D80A6";

  let bgColor: string;
  let textColor: string;
  let mutedColor: string;

  if (mode === "dark") {
    bgColor = darkestColor;
    textColor = lightestColor;
    mutedColor = midColor;
  } else {
    bgColor = lightestColor;
    textColor = darkestColor;
    mutedColor = midColor;
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  const modeLabel = mode === "dark" ? "DARK MODE" : "LIGHT MODE";

  ctx.fillStyle = mutedColor;
  ctx.font = "10px monospace";
  ctx.textAlign = "right";
  ctx.fillText(modeLabel, width - 60, 50);
  ctx.textAlign = "left";

  ctx.fillStyle = mutedColor;
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(brand.tagline.toUpperCase(), width / 2, 80);

  ctx.fillStyle = textColor;
  ctx.font = "bold 96px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(brand.brandName, width / 2, 180);

  ctx.strokeStyle = mutedColor;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(100, 220);
  ctx.lineTo(width - 100, 220);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.textAlign = "left";
  const bodyFont = brand.bodyFont.split(",")[0]?.trim() || "sans-serif";
  const monoFont = brand.monoFont.split(",")[0]?.trim() || "monospace";
  const headingFont = brand.headingFont.split(",")[0]?.trim() || "sans-serif";

  ctx.fillStyle = mutedColor;
  ctx.font = "10px monospace";
  ctx.fillText(bodyFont.toUpperCase(), 100, 270);
  ctx.fillStyle = textColor;
  ctx.font = "28px sans-serif";
  ctx.fillText("Aa Bb Cc Dd 0123456789", 100, 305);

  ctx.fillStyle = mutedColor;
  ctx.font = "10px monospace";
  ctx.fillText(monoFont.toUpperCase(), 100, 360);
  ctx.fillStyle = accentColor;
  ctx.font = "20px monospace";
  ctx.fillText("const kika = true;", 100, 395);

  ctx.fillStyle = mutedColor;
  ctx.font = "10px monospace";
  ctx.fillText(headingFont.toUpperCase(), 100, 450);
  ctx.fillStyle = textColor;
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("DIGITAL CRAFT — MACOS SYSTEMS", 100, 485);

  ctx.strokeStyle = mutedColor;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(100, 540);
  ctx.lineTo(width - 100, 540);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const swatchSize = 60;
  const gap = 30;
  const totalWidth = brand.colors.length * swatchSize + (brand.colors.length - 1) * gap;
  const startX = (width - totalWidth) / 2;

  brand.colors.forEach((color, i) => {
    const x = startX + i * (swatchSize + gap);
    const y = 590;

    ctx.beginPath();
    ctx.arc(x + swatchSize / 2, y + swatchSize / 2, swatchSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = color.hex;
    ctx.fill();

    if (lightness(color.hex) < 20 || (mode === "light" && lightness(color.hex) > 85)) {
      ctx.strokeStyle = mutedColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = mutedColor;
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(color.hex.toUpperCase(), x + swatchSize / 2, y + swatchSize + 20);
  });

  return canvas.toDataURL("image/png");
}

export function ExportPanel() {
  const { exportCSS, exportJSON, exportDesignMd, brand } = useBrand();
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("design.md");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getContent = useCallback(
    (tab: TabType) => {
      switch (tab) {
        case "css":
          return exportCSS();
        case "json":
          return exportJSON();
        case "design.md":
          return exportDesignMd();
      }
    },
    [exportCSS, exportJSON, exportDesignMd]
  );

  const handleCopy = (type: TabType) => {
    const text = getContent(type);
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    const content = getContent(activeTab);
    const filename =
      activeTab === "design.md"
        ? "DESIGN.md"
        : activeTab === "css"
        ? "brand-tokens.css"
        : "brand-tokens.json";
    const mimeType = activeTab === "json" ? "application/json" : "text/plain";
    downloadFile(content, filename, mimeType);
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const brandSlug = brand.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand";
      const folder = zip.folder(brandSlug)!;

      folder.file("DESIGN.md", exportDesignMd());
      folder.file("brand-tokens.css", exportCSS());
      folder.file("brand-tokens.json", exportJSON());

      const darkDataUrl = generateBrandBoardImage(brand, "dark");
      const lightDataUrl = generateBrandBoardImage(brand, "light");

      if (darkDataUrl) {
        const darkBlob = dataUrlToBlob(darkDataUrl);
        if (darkBlob) folder.file("brand-board-dark.png", darkBlob);
      }
      if (lightDataUrl) {
        const lightBlob = dataUrlToBlob(lightDataUrl);
        if (lightBlob) folder.file("brand-board-light.png", lightBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${brandSlug}-design-system.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const content = getContent(activeTab);

  const minimizedView = (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          export
        </span>
        <div className="flex gap-1">
          {(["design.md", "css", "json"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors duration-300 ${
                activeTab === tab
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-border hover:text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportZip}
          disabled={isExporting}
          className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground hover:text-primary transition-colors duration-300 disabled:opacity-50"
          title="Export as ZIP"
        >
          <Package size={10} />
        </button>
        <button
          onClick={() => handleCopy(activeTab)}
          className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground hover:text-primary transition-colors duration-300"
        >
          {copied === activeTab ? <Check size={10} /> : <Copy size={10} />}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground hover:text-primary transition-colors duration-300"
        >
          <Download size={10} />
        </button>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground hover:text-primary transition-colors duration-300"
        >
          <Maximize2 size={10} />
        </button>
      </div>
    </div>
  );

  const expandedView = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsExpanded(false)}
      />

      <div className="relative w-full h-[70vh] rounded-lg border border-border bg-card flex flex-col overflow-hidden transition-colors duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              export
            </span>
            <div className="flex gap-1">
              {(["design.md", "css", "json"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded transition-colors duration-300 ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors duration-300 disabled:opacity-50"
              title="Export everything as ZIP"
            >
              <Package size={12} />
              {isExporting ? "exporting..." : "zip"}
            </button>
            <button
              onClick={() => handleCopy(activeTab)}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {copied === activeTab ? <Check size={12} /> : <Copy size={12} />}
              {copied === activeTab ? "copied" : "copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              <Download size={12} />
              download
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors duration-300"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <pre className="text-[12px] font-mono text-secondary-foreground bg-background rounded p-4 border border-border whitespace-pre-wrap min-h-full">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {minimizedView}
      {isExpanded && expandedView}
    </>
  );
}