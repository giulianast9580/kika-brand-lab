import { useBrand } from "@/contexts/BrandContext";
import { ImageIcon, Upload, X } from "lucide-react";
import { useRef } from "react";

export function LogoUploader() {
  const { brand, updateLogo, updateIcon } = useBrand();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File, type: "logo" | "icon") => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (type === "logo") updateLogo(url);
      else updateIcon(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <ImageIcon size={12} />
        logo & icon
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Logo upload */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Logo</span>
          <div className="relative group">
            {brand.logoUrl ? (
              <div className="w-24 h-24 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden">
                <img src={brand.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                <button
                  onClick={() => updateLogo(undefined)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:border-destructive"
                >
                  <X size={10} className="text-muted-foreground hover:text-destructive-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-24 h-24 rounded-lg border border-dashed border-border hover:border-primary bg-card flex flex-col items-center justify-center gap-1.5 transition-colors"
                title="Upload logo"
              >
                <Upload size={18} className="text-muted-foreground" />
                <span className="text-[8px] font-mono text-muted-foreground">logo</span>
              </button>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f, "logo");
                if (logoInputRef.current) logoInputRef.current.value = "";
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Icon upload */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Icon</span>
          <div className="relative group">
            {brand.iconUrl ? (
              <div className="w-24 h-24 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden">
                <img src={brand.iconUrl} alt="Icon" className="max-w-full max-h-full object-contain p-1" />
                <button
                  onClick={() => updateIcon(undefined)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:border-destructive"
                >
                  <X size={10} className="text-muted-foreground hover:text-destructive-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => iconInputRef.current?.click()}
                className="w-24 h-24 rounded-lg border border-dashed border-border hover:border-primary bg-card flex flex-col items-center justify-center gap-1.5 transition-colors"
                title="Upload icon"
              >
                <Upload size={18} className="text-muted-foreground" />
                <span className="text-[8px] font-mono text-muted-foreground">icon</span>
              </button>
            )}
            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f, "icon");
                if (iconInputRef.current) iconInputRef.current.value = "";
              }}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}