import { useState } from 'react';
import { motion } from 'motion/react';
import { Subfolder } from '../types';
import { Folder as FolderIcon, ChevronRight, ChevronLeft, FileText, Play } from 'lucide-react';
import WhatsAppPopup from './WhatsAppPopup';

interface SubfolderSelectorProps {
  subfolders: Subfolder[];
  onSelectSubfolder: (subfolder: Subfolder) => void;
  onBack: () => void;
  folderName: string;
}

export default function SubfolderSelector({ subfolders, onSelectSubfolder, onBack, folderName }: SubfolderSelectorProps) {
  const [selectedSubfolder, setSelectedSubfolder] = useState<Subfolder | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleSubfolderClick = (subfolder: Subfolder) => {
    setSelectedSubfolder(subfolder);
    setIsPopupOpen(true);
  };

  const handleContinue = () => {
    if (selectedSubfolder) {
      onSelectSubfolder(selectedSubfolder);
    }
    setIsPopupOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#050505] text-white flex flex-col pb-12 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="mesh-gradient" />
      </div>

      <WhatsAppPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onContinue={handleContinue}
        actionText="Continue to Subfolder"
      />

      <header className="sticky top-0 z-50 bg-bg-dark px-4 py-3 flex items-center gap-4 border-b border-white/5 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-black uppercase tracking-widest text-white/90">{folderName}</h1>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Select Subfolder</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 flex flex-col gap-3">
        {subfolders.map((subfolder, index) => (
          <motion.div
            key={subfolder.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => handleSubfolderClick(subfolder)}
            className="group bg-[#0f1014] border border-white/5 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-[#16181d] transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1a1c23] border border-white/5 rounded-xl flex items-center justify-center">
                <FolderIcon className="w-6 h-6 text-zinc-400 group-hover:text-accent transition-colors" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white uppercase tracking-tight">{subfolder.name}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">{subfolder.items.length} ITEMS</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors mr-2" />
          </motion.div>
        ))}
      </main>
    </motion.div>
  );
}

