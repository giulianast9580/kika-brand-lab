import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandInputRef,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FontControl } from "@/components/FontControl";
import { LogoUploader } from "@/components/LogoUploader";
import { ContrastChecker } from "@/components/ContrastChecker";
import { ImagePaletteExtractor } from "@/components/ImagePaletteExtractor";
import { DesignMdUploader } from "@/components/DesignMdUploader";
import { ExportPanel } from "@/components/ExportPanel";
import { ColorPaletteManager } from "@/components/ColorPaletteManager";
import { useBrand } from "@/contexts/BrandContext";
import { useMockupTemplate } from "@/contexts/MockupTemplateContext";
import { useMockupContent } from "@/contexts/MockupContentContext";
import {
  Type,
  Upload,
  Contrast,
  Image,
  FileDown,
  Palette,
  Settings,
  ChevronLeft,
  Layout,
  Pencil,
  Briefcase,
  BarChart3,
  ArrowLeftRight,
} from "lucide-react";

type PanelType =
  | "none"
  | "fonts"
  | "logo"
  | "colors"
  | "image-palette"
  | "import-export";

const STORAGE_KEY = "kika-cmd-palette-last-panel";

const panelConfig: Record<
  Exclude<PanelType, "none">,
  { title: string; icon: typeof Type; group: string }
> = {
  fonts: { title: "Font Settings", icon: Type, group: "Brand & Typography" },
  logo: { title: "Logo & Icon", icon: Upload, group: "Brand & Typography" },
  colors: { title: "Colors", icon: Palette, group: "Colors" },
  "image-palette": { title: "Extract from Image", icon: Image, group: "Import / Export" },
  "import-export": { title: "Import / Export", icon: FileDown, group: "Import / Export" },
};

function PanelContent({ panel }: { panel: Exclude<PanelType, "none"> }) {
  switch (panel) {
    case "fonts":
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-6">
          <FontControl />
        </motion.div>
      );
    case "logo":
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-6">
          <LogoUploader />
        </motion.div>
      );
    case "colors":
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6 p-6">
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Palette</h3>
            <ColorPaletteManager />
          </div>
          <div className="border-t border-border pt-6">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Contrast Checker</h3>
            <ContrastChecker />
          </div>
        </motion.div>
      );
    case "image-palette":
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-6">
          <ImagePaletteExtractor />
        </motion.div>
      );
    case "import-export":
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6 p-6">
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Import</h3>
            <DesignMdUploader />
          </div>
          <div className="border-t border-border pt-6">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">Export</h3>
            <ExportPanel />
          </div>
        </motion.div>
      );
  }
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-auto text-[9px] font-mono text-muted-foreground bg-muted/50 border border-border rounded px-1.5 py-0.5 leading-none">
      {children}
    </span>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>("none");
  const { brand, undo, redo } = useBrand();
  const { template, setTemplate } = useMockupTemplate();
  const { editing, toggleEditing } = useMockupContent();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && activePanel === "none") {
      const saved = localStorage.getItem(STORAGE_KEY) as PanelType | null;
      if (saved && saved !== "none" && panelConfig[saved]) {
        setActivePanel(saved);
      }
    }
  }, [open]);

  useEffect(() => {
    if (activePanel !== "none") {
      localStorage.setItem(STORAGE_KEY, activePanel);
    }
  }, [activePanel]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setActivePanel("none");
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setActivePanel("none");
        return;
      }
      if (e.key === "Escape") {
        if (activePanel !== "none") {
          e.preventDefault();
          setActivePanel("none");
          return;
        }
        if (open) {
          e.preventDefault();
          setOpen(false);
          return;
        }
      }
      if (open) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        toggleEditing();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "1") {
        e.preventDefault();
        setTemplate("landing");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "2") {
        e.preventDefault();
        setTemplate("dashboard");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "3") {
        e.preventDefault();
        setTemplate("portfolio");
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo();
      }
      if (((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey)) {
        e.preventDefault();
        undo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, open, toggleEditing, setTemplate, undo, redo]);

  const openPanel = (panel: Exclude<PanelType, "none">) => {
    setActivePanel(panel);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const closePanel = () => {
    setActivePanel("none");
    localStorage.removeItem(STORAGE_KEY);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const currentPanelConfig = activePanel !== "none" ? panelConfig[activePanel] : null;

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          setActivePanel("none");
        }}
        className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-md text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary transition-colors duration-300"
        title="Command Palette (⌘K)"
      >
        <Settings size={14} />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="w-[900px] max-w-[95vw] bg-card border-border p-0 gap-0 flex flex-col">
          <AnimatePresence mode="wait">
            {activePanel === "none" ? (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col min-h-0"
              >
                <Command className="[&_[cmdk-input]]:bg-transparent [&_[cmdk-input]]:text-foreground [&_[cmdk-input]]:placeholder:text-muted-foreground [&_[cmdk-input]]:border-0 [&_[cmdk-input]]:outline-none [&_[cmdk-input]]:px-4 [&_[cmdk-input]]:py-3 [&_[cmdk-input]]:text-sm [&_[cmdk-input]]:font-mono flex flex-col">
                  <CommandInputRef
                    ref={inputRef}
                    placeholder="Type a command..."
                    autoFocus
                  />
                  <CommandList className="p-2 max-h-none overflow-visible">
                    <CommandEmpty className="py-8 text-center text-muted-foreground text-[10px] font-mono">
                      No commands found.
                    </CommandEmpty>

                    <CommandGroup heading="Brand & Typography">
                      <CommandItem
                        onSelect={() => openPanel("fonts")}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground text-[11px] font-mono"
                      >
                        <Type size={14} className="text-primary" />
                        <span>Font Settings</span>
                        <Kbd>⌘⇧F</Kbd>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => openPanel("logo")}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground text-[11px] font-mono"
                      >
                        <Upload size={14} className="text-primary" />
                        <span>Logo & Icon Upload</span>
                      </CommandItem>
                    </CommandGroup>

                    <CommandGroup heading="Colors">
                      <CommandItem
                        onSelect={() => openPanel("colors")}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground text-[11px] font-mono"
                      >
                        <Palette size={14} className="text-primary" />
                        <span>Color Palette & Contrast</span>
                        <span className="ml-auto text-[9px] text-muted-foreground tabular-nums">{brand.colors.length}</span>
                      </CommandItem>
                    </CommandGroup>

                    <CommandGroup heading="Import / Export">
                      <CommandItem
                        onSelect={() => openPanel("import-export")}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground text-[11px] font-mono"
                      >
                        <ArrowLeftRight size={14} className="text-primary" />
                        <span>Import / Export Brand</span>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => openPanel("image-palette")}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-foreground hover:bg-accent data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground text-[11px] font-mono"
                      >
                        <Image size={14} className="text-primary" />
                        <span>Extract from Image</span>
                      </CommandItem>
                    </CommandGroup>

                    <CommandGroup heading="Mockup">
                      <CommandItem
                        onSelect={toggleEditing}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-[11px] font-mono data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        <Pencil size={14} className={editing ? "text-primary" : "text-muted-foreground"} />
                        <span>{editing ? "Exit Edit Mode" : "Edit Mockup Text"}</span>
                        <Kbd>⌘E</Kbd>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => setTemplate("landing")}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-[11px] font-mono data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        <Layout size={14} className={template === "landing" ? "text-primary" : "text-muted-foreground"} />
                        <span>Landing Page</span>
                        <Kbd>⌘1</Kbd>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => setTemplate("dashboard")}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-[11px] font-mono data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        <BarChart3 size={14} className={template === "dashboard" ? "text-primary" : "text-muted-foreground"} />
                        <span>Dashboard</span>
                        <Kbd>⌘2</Kbd>
                      </CommandItem>
                      <CommandItem
                        onSelect={() => setTemplate("portfolio")}
                        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-[11px] font-mono data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        <Briefcase size={14} className={template === "portfolio" ? "text-primary" : "text-muted-foreground"} />
                        <span>Portfolio</span>
                        <Kbd>⌘3</Kbd>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </motion.div>
            ) : (
              <motion.div
                key="panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-h-0"
              >
                <div className="border-b border-border px-4 py-2.5 flex items-center gap-2 shrink-0">
                  <button
                    onClick={closePanel}
                    className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors duration-300"
                    title="Back to commands (Esc)"
                  >
                    <ChevronLeft size={12} />
                    <span>esc</span>
                  </button>
                  {currentPanelConfig && (
                    <div className="flex items-center gap-1.5 ml-1">
                      <currentPanelConfig.icon size={12} className="text-primary" />
                      <span className="text-[10px] font-mono text-foreground">
                        {currentPanelConfig.title}
                      </span>
                    </div>
                  )}
                  <span className="text-[8px] font-mono text-border ml-auto">
                    {currentPanelConfig?.group}
                  </span>
                </div>
                <div className="overflow-y-auto max-h-[70vh]">
                  <PanelContent panel={activePanel} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}