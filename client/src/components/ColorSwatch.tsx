import { useBrand } from "@/contexts/BrandContext";
import { X, GripVertical } from "lucide-react";
import { useRef } from "react";

interface ColorSwatchProps {
  id: string;
  hex: string;
  name: string;
  index: number;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
}

export function ColorSwatch({
  id,
  hex,
  name,
  index,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: ColorSwatchProps) {
  const { updateColor, updateColorName, removeColor } = useBrand();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={() => onDrop(index)}
      className={`group relative flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDragging ? "opacity-30 scale-90" : ""
      } ${isDragOver ? "translate-x-3" : ""}`}
    >
      {/* Drag handle */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={10} className="text-muted-foreground" />
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-16 h-16 rounded-full border border-border transition-transform hover:scale-110"
        style={{ backgroundColor: hex }}
      >
        <input
          ref={inputRef}
          type="color"
          value={hex}
          onChange={(e) => updateColor(id, e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </button>
      <input
        type="text"
        value={hex}
        onChange={(e) => updateColor(id, e.target.value)}
        className="w-16 text-center text-[10px] font-mono bg-transparent text-muted-foreground border-none outline-none focus:text-foreground uppercase transition-colors duration-300"
      />
      <input
        type="text"
        value={name}
        onChange={(e) => updateColorName(id, e.target.value)}
        className="w-16 text-center text-[9px] font-mono bg-transparent text-muted-foreground border-none outline-none focus:text-secondary-foreground truncate transition-colors duration-300"
      />
      <button
        onClick={() => removeColor(id)}
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-border text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-primary hover:text-primary-foreground"
      >
        <X size={10} />
      </button>
    </div>
  );
}
