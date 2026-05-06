import { useBrand, BrandState } from "@/contexts/BrandContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ColorSwatch } from "@/components/ColorSwatch";
import { BrandMockup } from "@/components/BrandMockup";
import { useMockupContent } from "@/contexts/MockupContentContext";
import { RotateCcw, Check, X, Plus, Pencil, GripVertical } from "lucide-react";
import { useState, useCallback, useRef } from "react";

export function BrandPreview() {
  const { brand, stagedBrand, isShowingStaged, applyStaged, clearStaged, togglePreview, addColor, reorderColors } = useBrand();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const activeBrand = (isShowingStaged && stagedBrand) ? stagedBrand : brand;

  return (
    <div className="relative h-full">
      {stagedBrand && (
        <div className="absolute -top-0 left-0 right-0 z-10 flex items-center justify-between bg-card border border-border rounded-t-lg px-4 py-2">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isShowingStaged ? "bg-amber-400 animate-pulse" : "bg-primary"}`} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {isShowingStaged ? "previewing new" : "showing original"}
            </span>
            <button
              onClick={togglePreview}
              className="text-[9px] font-mono px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              <span className="flex items-center gap-1">
                <RotateCcw size={9} />
                {isShowingStaged ? "show original" : "show new"}
              </span>
            </button>
            <span className="text-[8px] font-mono text-border">
              spacebar to toggle
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={applyStaged}
              className="flex items-center gap-1 text-[9px] font-mono px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors"
            >
              <Check size={10} />
              apply
            </button>
            <button
              onClick={clearStaged}
              className="flex items-center gap-1 text-[9px] font-mono px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <X size={10} />
              discard
            </button>
          </div>
        </div>
      )}

      <PreviewBoard brand={activeBrand} hasStaged={!!stagedBrand} dragIndex={dragIndex} dragOverIndex={dragOverIndex} onDragStart={(i) => setDragIndex(i)} onDragOver={(e, i) => { e.preventDefault(); setDragOverIndex(i); }} onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }} onDrop={(toIndex) => { if (dragIndex !== null && dragIndex !== toIndex) { reorderColors(dragIndex, toIndex); } setDragIndex(null); setDragOverIndex(null); }} onAddColor={addColor} />
    </div>
  );
}

function PreviewBoard({
  brand,
  hasStaged,
  dragIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onAddColor,
}: {
  brand: BrandState;
  hasStaged: boolean;
  dragIndex: number | null;
  dragOverIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  onAddColor: () => void;
}) {
  const { theme } = useTheme();
  const { editing } = useMockupContent();
  const { updateLogoSize, updateIconSize } = useBrand();

  const sortedByLightness = [...brand.colors].sort((a, b) => {
    return getLightness(a.hex) - getLightness(b.hex);
  });

  const darkestColor = sortedByLightness[0]?.hex || "#0D0D0D";
  const lightestColor = sortedByLightness[sortedByLightness.length - 1]?.hex || "#D9D9D9";
  const midColor = sortedByLightness[Math.floor(sortedByLightness.length / 2)]?.hex || "#8C8C8C";
  const accentColor = brand.colors.find((c) => {
    const r = parseInt(c.hex.slice(1, 3), 16);
    const g = parseInt(c.hex.slice(3, 5), 16);
    const b = parseInt(c.hex.slice(5, 7), 16);
    return Math.max(r, g, b) - Math.min(r, g, b) > 30;
  })?.hex || brand.colors[brand.colors.length - 1]?.hex || "#6D80A6";

  const bgColor = theme === "dark" ? darkestColor : lightestColor;
  const textColor = theme === "dark" ? lightestColor : darkestColor;
  const mutedColor = midColor;

  const logoSize = brand.logoSize || 200;
  const iconSize = brand.iconSize || 56;

  return (
    <div
      className={`rounded-lg border border-border p-4 sm:p-8 flex flex-col gap-6 h-full transition-colors duration-300 relative ${hasStaged ? "mt-10 rounded-t-none" : ""}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Mode Label */}
      <div className="absolute top-4 left-6">
        <span
          className="text-[8px] font-mono uppercase tracking-widest"
          style={{ color: mutedColor }}
        >
          {theme}
        </span>
      </div>

      {/* Logo & Icon Row */}
      {(brand.logoUrl || brand.iconUrl) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-4 max-w-full">
          {brand.logoUrl && (
            <div className="flex flex-col items-center gap-1">
              <ResizableImage
                src={brand.logoUrl}
                alt="Logo"
                width={logoSize}
                onResize={editing ? updateLogoSize : undefined}
                editing={editing}
                minSize={40}
                maxSize={400}
                label="logo"
                mutedColor={mutedColor}
                monoFont={brand.monoFont}
                maxWidth={320}
              />
            </div>
          )}
          {brand.iconUrl && (
            <div className="flex flex-col items-center gap-1">
              <ResizableImage
                src={brand.iconUrl}
                alt="Icon"
                width={iconSize}
                onResize={editing ? updateIconSize : undefined}
                editing={editing}
                minSize={24}
                maxSize={128}
                label="icon"
                mutedColor={mutedColor}
                monoFont={brand.monoFont}
                maxWidth={128}
                rounded
              />
            </div>
          )}
        </div>
      )}

      {/* Brand Name */}
      <div className="text-center">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2 transition-colors duration-300"
          style={{ color: mutedColor, fontFamily: brand.monoFont }}
        >
          {brand.tagline}
        </p>
        <h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight transition-colors duration-300"
          style={{ color: textColor, fontFamily: brand.headingFont }}
        >
          {brand.brandName}
        </h1>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px transition-colors duration-300"
        style={{ backgroundColor: mutedColor, opacity: 0.3 }}
      />

      {/* Typography Preview */}
      <div className="flex flex-col gap-4">
        <div>
          <p
            className="text-[9px] uppercase tracking-widest mb-1 transition-colors duration-300"
            style={{ color: mutedColor, fontFamily: brand.monoFont }}
          >
            {brand.bodyFont.split(",")[0]?.replace(/"/g, "")}
          </p>
          <p
            className="text-2xl transition-colors duration-300"
            style={{ color: textColor, fontFamily: brand.bodyFont }}
          >
            Aa Bb Cc Dd 0123456789
          </p>
        </div>
        <div>
          <p
            className="text-[9px] uppercase tracking-widest mb-1 transition-colors duration-300"
            style={{ color: mutedColor, fontFamily: brand.monoFont }}
          >
            {brand.monoFont.split(",")[0]?.replace(/"/g, "")}
          </p>
          <p
            className="text-lg transition-colors duration-300"
            style={{ color: accentColor, fontFamily: brand.monoFont }}
          >
            const kika = true;
          </p>
        </div>
        <div>
          <p
            className="text-[9px] uppercase tracking-widest mb-1 transition-colors duration-300"
            style={{ color: mutedColor, fontFamily: brand.monoFont }}
          >
            {brand.headingFont.split(",")[0]?.replace(/"/g, "")}
          </p>
          <p
            className="text-xl font-black uppercase transition-colors duration-300"
            style={{ color: textColor, fontFamily: brand.headingFont }}
          >
            Digital Craft — macOS Systems
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px transition-colors duration-300"
        style={{ backgroundColor: mutedColor, opacity: 0.3 }}
      />

      {/* Divider before mockup */}
      <div
        className="w-full h-px transition-colors duration-300"
        style={{ backgroundColor: mutedColor, opacity: 0.3 }}
      />

      {/* Website Preview */}
      <div className="relative">
        <div className="rounded-lg overflow-hidden border transition-colors duration-300" style={{ borderColor: mutedColor + "40" }}>
          <BrandMockup />
        </div>
        {editing && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-mono uppercase tracking-wider" style={{ backgroundColor: accentColor, color: lightestColor }}>
            <Pencil size={8} />
            edit
          </div>
        )}
      </div>

      {/* Divider before colors */}
      <div
        className="w-full h-px transition-colors duration-300"
        style={{ backgroundColor: mutedColor, opacity: 0.3 }}
      />

      {/* Color Row — Editable */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {brand.colors.map((c, index) => (
          <ColorSwatch
            key={c.id}
            id={c.id}
            hex={c.hex}
            name={c.name}
            index={index}
            isDragging={dragIndex === index}
            isDragOver={dragOverIndex === index}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
          />
        ))}
        <button
          onClick={onAddColor}
          className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: mutedColor }}>
            <Plus size={16} style={{ color: mutedColor }} />
          </div>
          <span className="text-[9px] font-mono h-[18px]" style={{ color: mutedColor }}>
            add
          </span>
        </button>
      </div>
    </div>
  );
}

function ResizableImage({
  src,
  alt,
  width,
  onResize,
  editing,
  minSize,
  maxSize,
  label,
  mutedColor,
  monoFont,
  maxWidth,
  rounded,
}: {
  src: string;
  alt: string;
  width: number;
  onResize?: (size: number) => void;
  editing: boolean;
  minSize: number;
  maxSize: number;
  label: string;
  mutedColor: string;
  monoFont: string;
  maxWidth: number;
  rounded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!onResize) return;
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    const handlePointerMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startXRef.current;
      const newWidth = Math.min(maxSize, Math.max(minSize, startWidthRef.current + delta));
      onResize(newWidth);
    };
    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  }, [onResize, minSize, maxSize, width]);

  const clampedWidth = Math.min(width, maxWidth);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={containerRef}
        className={`relative group/logo inline-flex items-center justify-center max-w-full ${editing ? "cursor-default" : ""}`}
        style={{ width: clampedWidth }}
      >
        <img
          src={src}
          alt={alt}
          className={`max-w-full object-contain ${rounded ? "rounded-lg" : ""}`}
          style={{ width: rounded ? clampedWidth : undefined, height: rounded ? clampedWidth : undefined }}
          draggable={false}
        />
        {editing && onResize && (
          <div
            onPointerDown={handlePointerDown}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-10 flex items-center justify-center cursor-ew-resize opacity-0 group-hover/logo:opacity-100 transition-opacity touch-none"
            style={{ color: mutedColor }}
          >
            <GripVertical size={12} className="opacity-60" />
            <div className="absolute right-0 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: mutedColor, opacity: 0.3 }} />
          </div>
        )}
        {editing && onResize && (
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono opacity-0 group-hover/logo:opacity-100 transition-opacity pointer-events-none select-none"
            style={{ color: mutedColor, fontFamily: monoFont }}
          >
            {Math.round(width)}px
          </div>
        )}
      </div>
      <span
        className="text-[8px] uppercase tracking-widest"
        style={{ color: mutedColor, fontFamily: monoFont }}
      >
        {label}
      </span>
    </div>
  );
}

function getLightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 / 2.55;
}
