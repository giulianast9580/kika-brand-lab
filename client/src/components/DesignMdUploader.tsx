import { useBrand } from "@/contexts/BrandContext";
import { FileText, Upload, Check, AlertCircle, Eye } from "lucide-react";
import { useState, useRef } from "react";

export function DesignMdUploader() {
  const { stageDesign } = useBrand();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = stageDesign(content);
      setStatus(success ? "success" : "error");
      setTimeout(() => {
        setStatus("idle");
        if (!success) setFileName(null);
      }, 3000);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
        <FileText size={10} />
        import stitch / design.md
      </h3>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-md p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
          status === "success"
            ? "border-amber-500/60 bg-amber-500/5"
            : status === "error"
            ? "border-red-500/60 bg-red-500/5"
            : isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-border/30 flex items-center justify-center">
          {status === "success" ? (
            <Eye size={14} className="text-amber-400" />
          ) : status === "error" ? (
            <AlertCircle size={14} className="text-red-400" />
          ) : isDragging ? (
            <FileText size={14} className="text-primary" />
          ) : (
            <Upload size={14} className="text-muted-foreground" />
          )}
        </div>
        <span className="text-[10px] font-mono text-center">
          {status === "success" ? (
            <span className="text-amber-400">staged: {fileName} — preview active</span>
          ) : status === "error" ? (
            <span className="text-red-400">parse error — check format</span>
          ) : fileName ? (
            <span className="text-muted-foreground">{fileName} — drop new file</span>
          ) : (
            <span className="text-muted-foreground">drop .md / .html to preview</span>
          )}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.html,.htm,text/markdown,text/plain,text/html"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
