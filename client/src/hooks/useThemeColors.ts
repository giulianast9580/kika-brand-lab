import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useBrand, type ColorSwatch } from "@/contexts/BrandContext";

function getLightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 / 2.55;
}

function isChromatic(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b) > 30;
}

function mix(hex1: string, hex2: string, ratio: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function useThemeColors() {
  const { theme } = useTheme();
  const { brand } = useBrand();

  useEffect(() => {
    const sorted = [...brand.colors].sort((a, b) => getLightness(a.hex) - getLightness(b.hex));
    const darkest = sorted[0];
    const lightest = sorted[sorted.length - 1];
    const accent = brand.colors.find((c) => isChromatic(c.hex)) || brand.colors[brand.colors.length - 1];

    const midColors = sorted.filter(
      (c) => c.id !== darkest.id && c.id !== lightest.id && c.id !== accent.id
    );

    const root = document.documentElement;

    if (theme === "dark") {
      // Dark mode: darkest bg, lighter surfaces should be only SLIGHTLY lighter than bg
      const bg = darkest.hex;
      const fg = lightest.hex;
      // Card/popover: mix darkest with a tiny bit of mid for subtle elevation
      const darkSurface = midColors.length > 0 ? mix(bg, midColors[0].hex, 0.15) : "#1a1a1a";
      // Border: the darkest mid color for subtle borders
      const border = midColors.length > 0 ? mix(bg, midColors[0].hex, 0.4) : "#404040";
      // Muted: slightly lighter than surface for secondary bg
      const muted = mix(bg, midColors.length > 0 ? midColors[0].hex : fg, 0.25);
      // Muted text: mid-tone for secondary labels
      const mutedFg = midColors.length > 1 ? midColors[Math.max(0, midColors.length - 2)].hex : (midColors[0]?.hex || fg);

      root.style.setProperty("--background", bg);
      root.style.setProperty("--foreground", fg);
      root.style.setProperty("--card", darkSurface);
      root.style.setProperty("--card-foreground", fg);
      root.style.setProperty("--popover", darkSurface);
      root.style.setProperty("--popover-foreground", fg);
      root.style.setProperty("--primary", accent.hex);
      root.style.setProperty("--primary-foreground", bg);
      root.style.setProperty("--secondary", muted);
      root.style.setProperty("--secondary-foreground", fg);
      root.style.setProperty("--muted", muted);
      root.style.setProperty("--muted-foreground", mutedFg);
      const darkAccentBg = mix(bg, accent.hex, 0.15);
      root.style.setProperty("--accent", darkAccentBg);
      root.style.setProperty("--accent-foreground", accent.hex);
      root.style.setProperty("--border", border);
      root.style.setProperty("--input", border);
      root.style.setProperty("--ring", accent.hex);
    } else {
      // Light mode: lightest bg, subtle card elevation
      const bg = lightest.hex;
      const fg = darkest.hex;
      // Card/popover: pure white or very slightly darker than bg
      const lightSurface = getLightness(bg) > 95 ? "#FFFFFF" : mix(bg, "#FFFFFF", 0.6);
      // Border: light mid-tones
      const border = midColors.length > 1 ? midColors[Math.floor(midColors.length / 2)].hex : (midColors[0]?.hex || "#CCCCCC");
      // Muted: slightly darker than bg for secondary surfaces
      const muted = midColors.length > 1 ? midColors[Math.max(0, midColors.length - 2)].hex : (midColors[0]?.hex || "#E0E0E0");
      // Muted text
      const mutedFg = midColors[0]?.hex || "#666666";
      // Accent bg: light tint of accent color
      const lightAccentBg = mix(bg, accent.hex, 0.12);

      root.style.setProperty("--background", bg);
      root.style.setProperty("--foreground", fg);
      root.style.setProperty("--card", lightSurface);
      root.style.setProperty("--card-foreground", fg);
      root.style.setProperty("--popover", lightSurface);
      root.style.setProperty("--popover-foreground", fg);
      root.style.setProperty("--primary", accent.hex);
      root.style.setProperty("--primary-foreground", bg);
      root.style.setProperty("--secondary", muted);
      root.style.setProperty("--secondary-foreground", fg);
      root.style.setProperty("--muted", muted);
      root.style.setProperty("--muted-foreground", mutedFg);
      root.style.setProperty("--accent", lightAccentBg);
      root.style.setProperty("--accent-foreground", accent.hex);
      root.style.setProperty("--border", border);
      root.style.setProperty("--input", border);
      root.style.setProperty("--ring", accent.hex);
    }
  }, [theme, brand]);
}