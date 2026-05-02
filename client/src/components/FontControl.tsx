import { useBrand } from "@/contexts/BrandContext";

const fontOptions = [
  "Arial Black, Impact, sans-serif",
  "Fira Sans, system-ui, sans-serif",
  "Fira Code, monospace",
  "Georgia, serif",
  "Courier New, monospace",
  "Helvetica Neue, Helvetica, sans-serif",
  "system-ui, sans-serif",
  "Verdana, sans-serif",
  "Trebuchet MS, sans-serif",
];

export function FontControl() {
  const { brand, updateFont, updateBrandName, updateTagline } = useBrand();

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-4">
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        Typography
      </h3>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1 block">
            Heading Font
          </label>
          <select
            value={brand.headingFont}
            onChange={(e) => updateFont("headingFont", e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-[11px] font-mono text-foreground focus:border-primary outline-none"
          >
            {fontOptions.map((f) => (
              <option key={f} value={f}>
                {f.split(",")[0]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1 block">
            Body Font
          </label>
          <select
            value={brand.bodyFont}
            onChange={(e) => updateFont("bodyFont", e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-[11px] font-mono text-foreground focus:border-primary outline-none"
          >
            {fontOptions.map((f) => (
              <option key={f} value={f}>
                {f.split(",")[0]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1 block">
            Mono Font
          </label>
          <select
            value={brand.monoFont}
            onChange={(e) => updateFont("monoFont", e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-[11px] font-mono text-foreground focus:border-primary outline-none"
          >
            {fontOptions.map((f) => (
              <option key={f} value={f}>
                {f.split(",")[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full h-px bg-border opacity-50" />

      <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        Brand Text
      </h3>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1 block">
            Brand Name
          </label>
          <input
            type="text"
            value={brand.brandName}
            onChange={(e) => updateBrandName(e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-[11px] font-mono text-foreground focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1 block">
            Tagline
          </label>
          <input
            type="text"
            value={brand.tagline}
            onChange={(e) => updateTagline(e.target.value)}
            className="w-full bg-background border border-border rounded px-2 py-1.5 text-[11px] font-mono text-foreground focus:border-primary outline-none"
          />
        </div>
      </div>
    </div>
  );
}
