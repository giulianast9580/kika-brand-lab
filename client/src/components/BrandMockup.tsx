import { useBrand } from "@/contexts/BrandContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useMockupTemplate } from "@/contexts/MockupTemplateContext";
import { useMockupContent } from "@/contexts/MockupContentContext";
import { EditableText } from "@/components/EditableText";

interface TemplateProps {
  brand: ReturnType<typeof useBrand>["brand"];
  bg: string;
  fg: string;
  muted: string;
  cardBg: string;
  accentColor: string;
  lightest: string;
  editing: boolean;
}

function LandingTemplate({ brand, bg, fg, muted, cardBg, accentColor, lightest, editing }: TemplateProps) {
  const { content, updateField } = useMockupContent();
  const c = content.landing;

  return (
    <>
      <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b gap-2 sm:gap-0" style={{ borderColor: muted + "20" }}>
        <div className="flex items-center gap-2">
          {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" className="w-5 sm:w-6 h-5 sm:h-6 object-contain" />}
          <span className="text-xs sm:text-sm font-bold tracking-tight" style={{ fontFamily: brand.headingFont, color: fg }}>
            {brand.brandName}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          {["Work", "About", "Services", "Contact"].map((item) => (
            <span key={item} className="text-[10px] sm:text-[11px] tracking-wide" style={{ fontFamily: brand.bodyFont, color: muted }}>
              {item}
            </span>
          ))}
          <EditableText editing={editing} value={c.cta1} onChange={(v) => updateField("landing", "cta1", v)} className="text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-1 rounded-md font-medium" style={{ backgroundColor: accentColor, color: lightest, fontFamily: brand.bodyFont }} />
        </div>
      </nav>

      <section className="px-4 sm:px-6 py-8 sm:py-12 text-center">
        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] mb-3" style={{ fontFamily: brand.monoFont, color: accentColor }}>
          {brand.tagline}
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: brand.headingFont, color: fg }}>
          <EditableText editing={editing} value={c.heading} onChange={(v) => updateField("landing", "heading", v)} multiline style={{ fontFamily: brand.headingFont, color: fg }} className="text-2xl sm:text-4xl font-bold leading-tight" />
        </h1>
        <EditableText editing={editing} value={c.subheading} onChange={(v) => updateField("landing", "subheading", v)} multiline className="text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed block" style={{ fontFamily: brand.bodyFont, color: muted }} />
        <div className="flex items-center justify-center gap-3">
          <EditableText editing={editing} value={c.cta2} onChange={(v) => updateField("landing", "cta2", v)} className="text-[10px] sm:text-[11px] px-4 sm:px-5 py-2 rounded-md font-medium border" style={{ borderColor: muted + "40", color: fg, fontFamily: brand.bodyFont }} />
        </div>
      </section>

      <section className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {(
            [
              { titleKey: "card1Title" as const, descKey: "card1Desc" as const },
              { titleKey: "card2Title" as const, descKey: "card2Desc" as const },
              { titleKey: "card3Title" as const, descKey: "card3Desc" as const },
            ] as const
          )).map(({ titleKey, descKey }) => (
            <div key={titleKey} className="rounded-lg p-4 sm:p-5 border" style={{ backgroundColor: cardBg + "40", borderColor: muted + "20" }}>
              <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-md mb-3 flex items-center justify-center" style={{ backgroundColor: accentColor + "20" }}>
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-sm" style={{ backgroundColor: accentColor }} />
              </div>
              <EditableText editing={editing} value={c[titleKey]} onChange={(v) => updateField("landing", titleKey, v)} className="text-xs sm:text-sm font-bold mb-1.5 block" style={{ fontFamily: brand.headingFont, color: fg }} />
              <EditableText editing={editing} value={c[descKey]} onChange={(v) => updateField("landing", descKey, v)} multiline className="text-[10px] sm:text-[11px] leading-relaxed block" style={{ fontFamily: brand.bodyFont, color: muted }} />
            </div>
          ))}
        </div>
      </section>

      <footer className="px-4 sm:px-6 py-3 sm:py-4 border-t" style={{ borderColor: muted + "20" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <span className="text-[8px] sm:text-[9px] font-mono" style={{ color: muted }}>&copy; 2026 {brand.brandName}</span>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {["Twitter", "GitHub", "Dribbble"].map((s) => (
              <span key={s} className="text-[8px] sm:text-[9px]" style={{ fontFamily: brand.monoFont, color: muted }}>{s}</span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

function DashboardTemplate({ brand, bg, fg, muted, cardBg, accentColor, lightest, editing }: TemplateProps) {
  const { content, updateField } = useMockupContent();
  const c = content.dashboard;

  return (
    <div className="flex flex-col sm:flex-row h-auto sm:h-[420px]">
      <aside className="w-full sm:w-48 flex-shrink-0 border-r flex flex-row sm:flex-col py-3 sm:py-4 px-3 gap-2 sm:gap-0 overflow-x-auto sm:overflow-visible" style={{ borderColor: muted + "20", backgroundColor: cardBg + "30" }}>
        <div className="flex items-center gap-2 mb-0 sm:mb-6 px-2 shrink-0">
          {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" className="w-5 h-5 object-contain" />}
          <span className="text-[11px] font-bold" style={{ fontFamily: brand.headingFont, color: fg }}>
            {brand.brandName}
          </span>
        </div>
        {[
          { label: "Overview", active: true },
          { label: "Analytics", active: false },
          { label: "Projects", active: false },
          { label: "Team", active: false },
          { label: "Settings", active: false },
        ].map((item) => (
          <div
            key={item.label}
            className="text-[10px] px-3 py-2 rounded-md mb-0 sm:mb-1 whitespace-nowrap"
            style={{
              fontFamily: brand.bodyFont,
              color: item.active ? lightest : muted,
              backgroundColor: item.active ? accentColor + "25" : "transparent",
              borderLeft: item.active ? `2px solid ${accentColor}` : "2px solid transparent",
            }}
          >
            {item.label}
          </div>
        ))}
        <div className="mt-auto px-2 hidden sm:block">
          <div className="text-[8px] font-mono" style={{ color: muted }}>v2.4.1</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 border-b gap-2 sm:gap-0" style={{ borderColor: muted + "20" }}>
          <div>
            <EditableText editing={editing} value={c.pageTitle} onChange={(v) => updateField("dashboard", "pageTitle", v)} className="text-sm font-bold block" style={{ fontFamily: brand.headingFont, color: fg }} />
            <EditableText editing={editing} value={c.subtitle} onChange={(v) => updateField("dashboard", "subtitle", v)} className="text-[9px] block" style={{ fontFamily: brand.monoFont, color: muted }} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-6 rounded-md" style={{ backgroundColor: muted + "15" }} />
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: accentColor + "30" }} />
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-5 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {(["stat1", "stat2", "stat3", "stat4"] as const).map((key) => (
              <div key={key} className="rounded-lg p-3 border" style={{ backgroundColor: cardBg + "30", borderColor: muted + "15" }}>
                <EditableText editing={editing} value={c[`${key}Label` as keyof typeof c]} onChange={(v) => updateField("dashboard", `${key}Label` as keyof typeof c, v)} className="text-[8px] uppercase tracking-wider mb-1 block" style={{ fontFamily: brand.monoFont, color: muted }} />
                <EditableText editing={editing} value={c[`${key}Value` as keyof typeof c]} onChange={(v) => updateField("dashboard", `${key}Value` as keyof typeof c, v)} className="text-lg font-bold block" style={{ fontFamily: brand.monoFont, color: fg }} />
                <EditableText editing={editing} value={c[`${key}Change` as keyof typeof c]} onChange={(v) => updateField("dashboard", `${key}Change` as keyof typeof c, v)} className="text-[9px] mt-0.5 block" style={{ fontFamily: brand.monoFont, color: c[`${key}Change` as keyof typeof c].startsWith("+") ? "#22c55e" : "#ef4444" }} />
              </div>
            ))}
          </div>

          <div className="rounded-lg border p-4 mb-4" style={{ backgroundColor: cardBg + "20", borderColor: muted + "15" }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0">
              <span className="text-[10px] font-bold" style={{ fontFamily: brand.headingFont, color: fg }}>Performance</span>
              <div className="flex gap-2">
                {["7D", "30D", "90D"].map((t) => (
                  <span key={t} className="text-[8px] px-2 py-0.5 rounded" style={{ fontFamily: brand.monoFont, color: muted, backgroundColor: t === "30D" ? accentColor + "20" : "transparent" }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, backgroundColor: i === 11 ? accentColor : accentColor + "40" }} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden" style={{ borderColor: muted + "15" }}>
            <div className="hidden sm:grid grid-cols-4 gap-0 text-[9px] border-b" style={{ borderColor: muted + "15", backgroundColor: cardBg + "30" }}>
              {["Project", "Status", "Progress", "Due"].map((h) => (
                <div key={h} className="px-3 py-2 font-bold uppercase tracking-wider" style={{ fontFamily: brand.monoFont, color: muted }}>{h}</div>
              ))}
            </div>
            {(["project1", "project2", "project3"] as const).map((key) => (
              <div key={key} className="grid grid-cols-2 sm:grid-cols-4 gap-0 text-[9px] border-b last:border-0" style={{ borderColor: muted + "10" }}>
                <div className="px-3 py-2" style={{ fontFamily: brand.bodyFont, color: fg }}>
                  <EditableText editing={editing} value={c[`${key}Name` as keyof typeof c]} onChange={(v) => updateField("dashboard", `${key}Name` as keyof typeof c, v)} className="block" style={{ fontFamily: brand.bodyFont, color: fg }} />
                </div>
                <div className="px-3 py-2">
                  <span className="px-1.5 py-0.5 rounded text-[8px]" style={{ backgroundColor: accentColor + "20", color: accentColor, fontFamily: brand.monoFont }}>
                    <EditableText editing={editing} value={c[`${key}Status` as keyof typeof c]} onChange={(v) => updateField("dashboard", `${key}Status` as keyof typeof c, v)} />
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: muted + "20" }}>
                    <div className="h-full rounded-full" style={{ width: `${key === "project1" ? 75 : key === "project2" ? 90 : 45}%`, backgroundColor: accentColor }} />
                  </div>
                  <span style={{ fontFamily: brand.monoFont, color: muted }}>{key === "project1" ? "75%" : key === "project2" ? "90%" : "45%"}</span>
                </div>
                <div className="px-3 py-2" style={{ fontFamily: brand.monoFont, color: muted }}>
                  {key === "project1" ? "May 15" : key === "project2" ? "May 08" : "Jun 01"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioTemplate({ brand, bg, fg, muted, cardBg, accentColor, lightest, editing }: TemplateProps) {
  const { content, updateField } = useMockupContent();
  const c = content.portfolio;

  return (
    <>
      <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-3 sm:py-5 gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" className="w-5 h-5 object-contain" />}
          <span className="text-xs font-bold tracking-tight" style={{ fontFamily: brand.headingFont, color: fg }}>
            {brand.brandName}
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          {["Work", "Info", "Contact"].map((item) => (
            <span key={item} className="text-[10px] sm:text-[11px]" style={{ fontFamily: brand.monoFont, color: muted }}>{item}</span>
          ))}
        </div>
      </nav>

      <section className="px-4 sm:px-8 py-6 sm:py-8">
        <p className="text-[9px] uppercase tracking-[0.4em] mb-2" style={{ fontFamily: brand.monoFont, color: accentColor }}>
          {brand.tagline}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2" style={{ fontFamily: brand.headingFont, color: fg }}>
          <EditableText editing={editing} value={c.headingLine1} onChange={(v) => updateField("portfolio", "headingLine1", v)} className="block" style={{ fontFamily: brand.headingFont, color: fg }} /><br />
          <EditableText editing={editing} value={c.headingLine2} onChange={(v) => updateField("portfolio", "headingLine2", v)} className="block" style={{ fontFamily: brand.headingFont, color: fg }} /><br />
          <EditableText editing={editing} value={c.headingLine3} onChange={(v) => updateField("portfolio", "headingLine3", v)} className="block" style={{ fontFamily: brand.headingFont, color: fg }} />
        </h1>
        <EditableText editing={editing} value={c.description} onChange={(v) => updateField("portfolio", "description", v)} multiline className="text-[10px] sm:text-[11px] max-w-full sm:max-w-xs leading-relaxed block" style={{ fontFamily: brand.bodyFont, color: muted }} />
      </section>

      <section className="px-4 sm:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
          <span className="text-[9px] uppercase tracking-[0.3em]" style={{ fontFamily: brand.monoFont, color: muted }}>Selected Work</span>
          <span className="text-[9px]" style={{ fontFamily: brand.monoFont, color: accentColor }}>View All →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["project1", "project2", "project3", "project4"] as const).map((key, i) => (
            <div key={key} className="rounded-lg overflow-hidden border group" style={{ borderColor: muted + "15" }}>
              <div
                className="h-20 sm:h-24 flex items-center justify-center"
                style={{ backgroundColor: i % 2 === 0 ? accentColor + "12" : cardBg + "50" }}
              >
                <div className="w-10 sm:w-12 h-6 sm:h-8 rounded" style={{ backgroundColor: i % 2 === 0 ? accentColor + "30" : muted + "20" }} />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <EditableText editing={editing} value={c[`${key}Title` as keyof typeof c]} onChange={(v) => updateField("portfolio", `${key}Title` as keyof typeof c, v)} className="text-[10px] sm:text-[11px] font-bold" style={{ fontFamily: brand.headingFont, color: fg }} />
                  <span className="text-[8px]" style={{ fontFamily: brand.monoFont, color: muted }}>{2026 - i}</span>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: accentColor + "15", color: accentColor, fontFamily: brand.monoFont }}>
                  <EditableText editing={editing} value={c[`${key}Tag` as keyof typeof c]} onChange={(v) => updateField("portfolio", `${key}Tag` as keyof typeof c, v)} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-4 sm:px-8 py-4 sm:py-5 mt-4 border-t" style={{ borderColor: muted + "15" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            {brand.iconUrl && <img src={brand.iconUrl} alt="Icon" className="w-3 h-3 object-contain" />}
            <span className="text-[8px] font-mono" style={{ color: muted }}>&copy; 2026 {brand.brandName}</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {["GitHub", "Dribbble", "LinkedIn", "Email"].map((s) => (
              <span key={s} className="text-[8px]" style={{ fontFamily: brand.monoFont, color: muted }}>{s}</span>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

export function BrandMockup() {
  const { brand } = useBrand();
  const { theme } = useTheme();
  const { template } = useMockupTemplate();
  const { editing } = useMockupContent();

  const darkest = brand.colors.reduce((a, b) => (getLightness(a.hex) < getLightness(b.hex) ? a : b), brand.colors[0]);
  const lightest = brand.colors.reduce((a, b) => (getLightness(a.hex) > getLightness(b.hex) ? a : b), brand.colors[0]);
  const accent = brand.colors.find((c) => {
    const r = parseInt(c.hex.slice(1, 3), 16);
    const g = parseInt(c.hex.slice(3, 5), 16);
    const b = parseInt(c.hex.slice(5, 7), 16);
    return Math.max(r, g, b) - Math.min(r, g, b) > 30;
  }) || brand.colors[brand.colors.length - 1];
  const midColors = brand.colors.filter((c) => c.id !== darkest.id && c.id !== lightest.id && c.id !== accent.id);

  const bg = theme === "dark" ? darkest.hex : lightest.hex;
  const fg = theme === "dark" ? lightest.hex : darkest.hex;
  const muted = midColors[1]?.hex || "#8C8C8C";
  const cardBg = theme === "dark" ? (midColors[midColors.length - 1]?.hex || "#1a1a1a") : (midColors[0]?.hex || "#f0f0f0");
  const accentColor = accent.hex;

  const templateProps: TemplateProps = { brand, bg, fg, muted, cardBg, accentColor, lightest: lightest.hex, editing };

  return (
    <div
      className="w-full overflow-hidden rounded-lg transition-colors duration-300"
      style={{ backgroundColor: bg, color: fg }}
    >
      {template === "landing" && <LandingTemplate {...templateProps} />}
      {template === "dashboard" && <DashboardTemplate {...templateProps} />}
      {template === "portfolio" && <PortfolioTemplate {...templateProps} />}
    </div>
  );
}

function getLightness(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}