import { useBrand } from "@/contexts/BrandContext";
import { Upload, ImageIcon, Pipette, X, Check } from "lucide-react";
import { useState, useRef, useCallback } from "react";

interface ExtractedColor {
  hex: string;
  count: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Quantize a color to reduce similar colors
function quantize(r: number, g: number, b: number, step: number): string {
  const qr = Math.round(r / step) * step;
  const qg = Math.round(g / step) * step;
  const qb = Math.round(b / step) * step;
  return `${Math.min(255, qr)},${Math.min(255, qg)},${Math.min(255, qb)}`;
}

// Calculate color distance
function colorDistance(c1: number[], c2: number[]): number {
  return Math.sqrt(
    (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2
  );
}

// Extract dominant colors from image using canvas
function extractColors(imageData: ImageData, numColors: number = 6): ExtractedColor[] {
  const data = imageData.data;
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

  // Sample pixels (skip every 4th pixel for performance)
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    // Skip very dark and very light (near white/black)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness < 10 || brightness > 245) continue;

    const key = quantize(r, g, b, 24);
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
      // Running average
      existing.r = Math.round((existing.r * (existing.count - 1) + r) / existing.count);
      existing.g = Math.round((existing.g * (existing.count - 1) + g) / existing.count);
      existing.b = Math.round((existing.b * (existing.count - 1) + b) / existing.count);
    } else {
      colorMap.set(key, { r, g, b, count: 1 });
    }
  }

  // Sort by frequency
  const sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);

  // Pick diverse colors
  const selected: { r: number; g: number; b: number; count: number }[] = [];
  const minDistance = 50;

  for (const color of sorted) {
    if (selected.length >= numColors) break;

    const isTooClose = selected.some(
      (s) => colorDistance([color.r, color.g, color.b], [s.r, s.g, s.b]) < minDistance
    );

    if (!isTooClose) {
      selected.push(color);
    }
  }

  // If we didn't get enough, lower the threshold
  if (selected.length < numColors) {
    for (const color of sorted) {
      if (selected.length >= numColors) break;
      const isTooClose = selected.some(
        (s) => colorDistance([color.r, color.g, color.b], [s.r, s.g, s.b]) < 25
      );
      if (!isTooClose) {
        selected.push(color);
      }
    }
  }

  return selected.map((c) => ({
    hex: rgbToHex(c.r, c.g, c.b),
    count: c.count,
  }));
}

function getColorName(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  if (saturation < 0.15) {
    if (brightness > 200) return "Light";
    if (brightness > 150) return "Silver";
    if (brightness > 100) return "Gray";
    if (brightness > 50) return "Charcoal";
    return "Dark";
  }

  // Determine hue
  let hue = 0;
  if (max === r) hue = ((g - b) / (max - min)) * 60;
  else if (max === g) hue = (2 + (b - r) / (max - min)) * 60;
  else hue = (4 + (r - g) / (max - min)) * 60;
  if (hue < 0) hue += 360;

  if (hue < 15 || hue >= 345) return "Red";
  if (hue < 45) return "Orange";
  if (hue < 70) return "Yellow";
  if (hue < 150) return "Green";
  if (hue < 195) return "Teal";
  if (hue < 255) return "Blue";
  if (hue < 285) return "Purple";
  if (hue < 345) return "Pink";
  return "Red";
}

export function ImagePaletteExtractor() {
  const { stageFromImage } = useBrand();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Scale down for performance
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractColors(imageData, 6);
        setExtractedColors(colors);
        setIsProcessing(false);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        processImage(file);
      }
    },
    [processImage]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processImage(file);
      }
    },
    [processImage]
  );

  const applyPalette = () => {
    if (extractedColors.length === 0) return;

    const newColors = extractedColors.map((c) => ({
      hex: c.hex,
      name: getColorName(c.hex),
    }));

    stageFromImage(newColors);
  };

  const clearImage = () => {
    setImageUrl(null);
    setExtractedColors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Pipette size={10} />
          extract from image
        </h3>
        {imageUrl && (
          <button
            onClick={clearImage}
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {!imageUrl ? (
        /* Drop zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-border/30 flex items-center justify-center">
            {isDragging ? (
              <ImageIcon size={14} className="text-primary" />
            ) : (
              <Upload size={14} className="text-muted-foreground" />
            )}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {isDragging ? "drop image" : "drop or click to upload"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        /* Image preview + extracted colors */
        <div className="space-y-3">
          {/* Image thumbnail */}
          <div className="relative rounded overflow-hidden border border-border">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-24 object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <span className="text-[10px] font-mono text-primary animate-pulse">
                  extracting...
                </span>
              </div>
            )}
          </div>

          {/* Extracted colors */}
          {extractedColors.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 flex-wrap">
                {extractedColors.map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 h-8 rounded-sm border border-border"
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    />
                    <span className="text-[7px] font-mono text-muted-foreground">
                      {color.hex.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Apply button */}
              <button
                onClick={applyPalette}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Check size={10} />
                preview palette
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
