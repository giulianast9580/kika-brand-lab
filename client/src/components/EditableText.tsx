import { useRef, useCallback, useEffect } from "react";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  editing?: boolean;
}

export function EditableText({ value, onChange, className, style, multiline, editing = false }: EditableTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  const handleBlur = useCallback(() => {
    if (ref.current) {
      const text = ref.current.innerText || "";
      onChange(text);
    }
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        ref.current?.blur();
      }
    },
    [multiline]
  );

  if (!editing) {
    return (
      <span className={className} style={{ ...style, whiteSpace: multiline ? "pre-wrap" : undefined }}>
        {value}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none focus:ring-1 focus:ring-primary/40 rounded-sm cursor-text ring-1 ring-primary/20 ring-offset-1 transition-shadow duration-150 ${className || ""}`}
      style={{ ...style, whiteSpace: multiline ? "pre-wrap" : undefined }}
    >
      {value}
    </span>
  );
}