# Kika Brand Lab

A real-time brand design system playground. Configure colors, fonts, logos, and export a complete brand specification — with every part of the UI visually responding to your chosen palette so your brand is felt everywhere.

## Quick Start

```bash
pnpm install
pnpm dev
```

Opens on `http://localhost:3002`.

## Architecture

```
client/src/
├── App.tsx                      — Root app (ThemeProvider, Router, TooltipProvider, Toaster)
├── pages/
│   └── Home.tsx                 — Main layout (brand preview + command palette)
├── contexts/
│   ├── BrandContext.tsx          — Brand state (colors, fonts, name, tagline, logos, undo/redo, presets)
│   ├── ThemeContext.tsx          — Global dark/light theme toggle
│   ├── MockupTemplateContext.tsx — Selected mockup template (landing/dashboard/portfolio)
│   └── MockupContentContext.tsx  — Editable mockup text, edit mode toggle, localStorage persistence
├── hooks/
│   ├── useThemeColors.ts        — Maps brand palette → CSS custom properties (light + dark)
│   ├── useComposition.ts        — IME composition awareness for CJK input
│   ├── useMobile.tsx             — Responsive breakpoint detection
│   └── usePersistFn.ts           — Persistent function reference hook
├── components/
│   ├── CommandPalette.tsx        — Keyboard-driven command palette (⌘K)
│   ├── BrandPreview.tsx          — Live brand preview with resizable logo/icon in edit mode
│   ├── BrandMockup.tsx           — Mockup templates (landing, dashboard, portfolio)
│   ├── ColorPaletteManager.tsx  — Color palette CRUD with drag-to-reorder
│   ├── ColorSwatch.tsx           — Individual color swatch component
│   ├── ContrastChecker.tsx      — WCAG contrast ratio checker
│   ├── ComparisonView.tsx       — Side-by-side palette comparison
│   ├── DesignMdUploader.tsx     — Import DESIGN.md to populate brand
│   ├── ExportPanel.tsx          — Export brand as ZIP (DESIGN.md, CSS, JSON, brand boards)
│   ├── FontControl.tsx          — Font picker (heading, body, mono)
│   ├── ImagePaletteExtractor.tsx— Extract palette from uploaded images
│   ├── LogoUploader.tsx          — Upload logo + icon with resize in edit mode
│   ├── PresetSelector.tsx       — Brand presets (starter palettes)
│   ├── HistoryTimeline.tsx      — Undo/redo timeline
│   ├── EditableText.tsx         — Inline-editable text (only in edit mode)
│   ├── ManusDialog.tsx           — Manus dialog wrapper
│   ├── Map.tsx                   — Static map component
│   ├── ErrorBoundary.tsx         — React error boundary
│   └── ui/                      — shadcn/ui primitives (dialog, command, button, etc.)
├── index.css                    — CSS custom properties, Tailwind v4 config, font-family
└── main.tsx                     — Entry point
```

## Command Palette

Press **⌘K** (or the ⚙ icon in the top-right corner) to open the command palette.

### Panels (4 groups)

| Group | Command | Panel Content |
|------|---------|---------------|
| **Brand & Typography** | Font Settings | Google Font picker for heading, body, mono |
| | Logo & Icon Upload | Upload logo/icon images, resize in edit mode |
| **Colors** | Color Palette & Contrast | Color palette manager + WCAG contrast checker (merged) |
| | Extract from Image | Upload image → extract palette |
| **Import / Export** | Import / Export Brand | Import DESIGN.md + export as ZIP (merged) |
| | Extract from Image | Drag & drop image to extract colors |
| **Mockup** | Edit Mockup Text | Toggle inline edit mode (⌘E) |
| | Landing Page | Switch mockup template (⌘1) |
| | Dashboard | Switch mockup template (⌘2) |
| | Portfolio | Switch mockup template (⌘3) |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open/close command palette |
| `⌘E` | Toggle mockup edit mode |
| `⌘1` | Landing page template |
| `⌘2` | Dashboard template |
| `⌘3` | Portfolio template |
| `⌘Z` | Undo |
| `⌘⇧Z` | Redo |
| `Esc` | Close panel / close palette |

## Theming System

The entire UI reflects the brand palette through CSS custom properties set by `useThemeColors.ts`:

- **Light mode**: Brand accent → `--primary`, lightest mid-color → `--card`, borders from `mix(bg, accent, ratio)`
- **Dark mode**: Inverted — darkest colors become surfaces, `mix()` used for subtle elevation
- All UI chrome uses semantic Tailwind classes (`text-foreground`, `bg-card`, `border-border`, etc.)
- Brand palette hex values are content/data, not UI chrome — they stay as hex in `BrandContext`

### Key CSS Variables (set dynamically)

```css
--primary, --primary-foreground
--background, --foreground
--card, --card-foreground
--popover, --popover-foreground
--border, --input
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--ring
```

## Brand State

```typescript
interface BrandState {
  colors: ColorSwatch[];     // { id, hex, name }
  headingFont: string;       // Google Font name
  bodyFont: string;           // Google Font name
  monoFont: string;           // Google Font name
  brandName: string;
  tagline: string;
  logoUrl?: string;
  iconUrl?: string;
  logoSize?: number;          // px — resizable in edit mode
  iconSize?: number;           // px — resizable in edit mode
}
```

## Export

Export produces a ZIP file containing:

1. **DESIGN.md** — 9-section brand specification (inspired by Runway's getdesign.md)
2. **brand.css** — CSS custom properties for the brand palette
3. **brand.json** — Full brand state as JSON
4. **brand-board-light.png** — Light mode brand board screenshot
5. **brand-board-dark.png** — Dark mode brand board screenshot

## Design Decisions

- **Dialog overlays** use `bg-foreground/50` (not `bg-black/50`) so the overlay respects the theme
- **cmdk** library renders its own DOM — wrapped in themed `Command`/`CommandGroup`/`CommandItem` components in `ui/command.tsx`
- **Mockup text** is editable inline only when edit mode is toggled on (⌘E)
- **Logo/icon** resizing is drag-based on the right edge of the image, showing pixel size
- **Dark mode card surfaces** use `mix(bg, midColor, ratio)` to avoid the blinding-white bug from using the lightest mid-color
- **Accent backgrounds** use `mix(bg, accent, 0.15)` instead of 8-digit hex alpha (`accent.hex + "33"`) for better Tailwind compatibility

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** (dev server on port 3002)
- **Tailwind CSS v4** with `@theme inline` and `@custom-variant dark`
- **Framer Motion** for panel transitions
- **cmdk** for command palette
- **Radix UI** primitives (dialog, tooltip, etc.)
- **Wouter** for routing
- **JSZip** for export
- **html2canvas** for brand board screenshots
- **Google Fonts** via `fonts.googleapis.com`