import { useState } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { ColorSwatch } from "@/components/ColorSwatch";
import { Plus } from "lucide-react";

export function ColorPaletteManager() {
  const { brand, addColor, reorderColors } = useBrand();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Color Palette
        </h3>
        <button
          onClick={addColor}
          className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors border border-border rounded px-2 py-1 hover:border-primary"
        >
          <Plus size={10} />
          add color
        </button>
      </div>
      <div className="flex items-start justify-center gap-6 md:gap-8 flex-wrap">
        {brand.colors.map((color, index) => (
          <ColorSwatch
            key={color.id}
            id={color.id}
            hex={color.hex}
            name={color.name}
            index={index}
            isDragging={dragIndex === index}
            isDragOver={dragOverIndex === index}
            onDragStart={(i) => setDragIndex(i)}
            onDragOver={(e, i) => {
              e.preventDefault();
              setDragOverIndex(i);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            onDrop={(toIndex) => {
              if (dragIndex !== null && dragIndex !== toIndex) {
                reorderColors(dragIndex, toIndex);
              }
              setDragIndex(null);
              setDragOverIndex(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}
