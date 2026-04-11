import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onUpload: (content: string) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onUpload, isLoading }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileName(file.name);
      setContent(text);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSubmit = () => {
    if (content) onUpload(content);
  };

  const clear = () => {
    setFileName(null);
    setContent(null);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragging
            ? "border-neon-cyan bg-neon-cyan/5 neon-glow-cyan"
            : "border-glass-border hover:border-neon-cyan/50"
        }`}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".txt";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop <span className="font-mono text-primary">requirements.txt</span> here or click to browse
        </p>
      </div>

      <AnimatePresence>
        {fileName && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {content?.split("\n").filter(Boolean).length} dependencies found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? "Uploading..." : "Upload"}
              </button>
              <button onClick={(e) => { e.stopPropagation(); clear(); }} className="p-1 hover:bg-muted rounded">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {content && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-4 max-h-40 overflow-auto">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Preview</p>
          <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">{content}</pre>
        </motion.div>
      )}
    </div>
  );
};
