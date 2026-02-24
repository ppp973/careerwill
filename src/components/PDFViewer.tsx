import { motion } from 'motion/react';
import { ChevronLeft, Download, Maximize2, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
  onBack?: () => void;
}

export default function PDFViewer({ url, title, onBack }: PDFViewerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-[#0a0a0a]"
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="font-bold truncate max-w-md">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium text-zinc-400"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </a>
          <a 
            href={url} 
            download
            className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold text-white"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>
      
      <div className="flex-1 bg-zinc-800 relative">
        <iframe
          src={`${url}#toolbar=0`}
          className="w-full h-full border-none"
          title={title}
        />
        
        {/* Overlay to prevent interaction with iframe if needed, but usually we want interaction */}
      </div>
    </motion.div>
  );
}
