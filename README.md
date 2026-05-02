# Kika Brand Lab 🎨

> **A real-time brand design system playground** — Configure colors, fonts, logos, and export a complete brand specification with every part of the UI visually responding to your chosen palette.

![License](https://img.shields.io/badge/license-private-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Vite](https://img.shields.io/badge/Vite-7-646cff)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## ✨ Features

- **🎨 Live Brand Preview** — See your brand palette applied in real-time across the entire UI
- **⌨️ Command Palette** — Keyboard-driven workflow (⌘K) for all brand controls
- **🌗 Dark/Light Mode** — Full theme support with smart color mixing
- **📤 Export System** — Generate DESIGN.md, CSS, JSON, and brand boards as ZIP
- **📥 Import Support** — Load existing DESIGN.md files
- **🖼️ Image Palette Extraction** — Upload images to auto-generate color palettes
- **♿ WCAG Contrast Checker** — Ensure accessibility compliance
- **↩️ Undo/Redo** — Full history timeline with visual state management
- **✏️ Inline Editing** — Edit mockup text directly (⌘E)
- **📐 Resizable Logo/Icon** — Drag-to-resize with pixel preview

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (port 3002)
pnpm dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

## ⌨️ Keyboard Shortcuts

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

## 📦 Export Format

Export produces a ZIP file containing:

1. **DESIGN.md** — 9-section brand specification
2. **brand.css** — CSS custom properties
3. **brand.json** — Full brand state as JSON
4. **brand-board-light.png** — Light mode brand board
5. **brand-board-dark.png** — Dark mode brand board

## 🏗️ Architecture

```
client/src/
├── App.tsx                      # Root app (ThemeProvider, Router, TooltipProvider)
├── pages/
│   └── Home.tsx                 # Main layout (brand preview + command palette)
├── contexts/
│   ├── BrandContext.tsx         # Brand state (colors, fonts, logos, undo/redo)
│   ├── ThemeContext.tsx         # Global dark/light theme toggle
│   ├── MockupTemplateContext.tsx # Selected mockup template
│   └── MockupContentContext.tsx # Editable mockup text, localStorage persistence
├── hooks/
│   ├── useThemeColors.ts        # Maps brand palette → CSS custom properties
│   ├── useComposition.ts        # IME composition awareness for CJK input
│   ├── useMobile.tsx            # Responsive breakpoint detection
│   └── usePersistFn.ts          # Persistent function reference hook
├── components/
│   ├── CommandPalette.tsx       # Keyboard-driven command palette (⌘K)
│   ├── BrandPreview.tsx         # Live brand preview with resizable logo
│   ├── BrandMockup.tsx          # Mockup templates (landing, dashboard, portfolio)
│   ├── ColorPaletteManager.tsx  # Color palette CRUD with drag-to-reorder
│   ├── ContrastChecker.tsx      # WCAG contrast ratio checker
│   ├── ExportPanel.tsx          # Export brand as ZIP
│   ├── ImagePaletteExtractor.tsx # Extract palette from uploaded images
│   └── ui/                      # shadcn/ui primitives
└── index.css                    # Tailwind v4 + CSS custom properties
```

## 🎯 Brand State

```typescript
interface BrandState {
  colors: ColorSwatch[];      // { id, hex, name }
  headingFont: string;        // Google Font name
  bodyFont: string;           // Google Font name
  monoFont: string;           // Google Font name
  brandName: string;
  tagline: string;
  logoUrl?: string;
  iconUrl?: string;
  logoSize?: number;          // px — resizable in edit mode
  iconSize?: number;          // px — resizable in edit mode
}
```

## 🛠️ Tech Stack

- **React 19** + **TypeScript 5**
- **Vite 7** (dev server)
- **Tailwind CSS v4** with `@theme inline`
- **Framer Motion** for animations
- **cmdk** for command palette
- **Radix UI** primitives
- **Wouter** for routing
- **JSZip** for export
- **html2canvas** for screenshots
- **Google Fonts API**

## 🎨 Theming System

The UI reflects the brand palette through dynamic CSS custom properties:

### Light Mode
- Brand accent → `--primary`
- Lightest mid-color → `--card`
- Borders from `mix(bg, accent, ratio)`

### Dark Mode
- Inverted — darkest colors become surfaces
- `mix()` used for subtle elevation
- Avoids blinding-white backgrounds

### Key CSS Variables
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

## 📝 Design Decisions

- **Dialog overlays** use `bg-foreground/50` so the overlay respects the theme
- **Mockup text** is editable inline only when edit mode is toggled (⌘E)
- **Logo/icon resizing** is drag-based on the right edge with pixel size preview
- **Dark mode cards** use `mix(bg, midColor, ratio)` to avoid white backgrounds
- **Accent backgrounds** use `mix(bg, accent, 0.15)` for better Tailwind compatibility

## 📄 License

**Private** — All rights reserved to KIKA.

---

Built with ❤️ by **KIKA**
