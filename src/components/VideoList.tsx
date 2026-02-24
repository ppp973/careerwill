import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentItem } from '../types';
import { Play, FileText, ChevronRight } from 'lucide-react';
import WhatsAppPopup from './WhatsAppPopup';

interface VideoListProps {
  videos: ContentItem[];
  currentVideoId: string;
  onSelect: (video: ContentItem) => void;
}

export default function VideoList({ videos, currentVideoId, onSelect }: VideoListProps) {
  const [activeTab, setActiveTab] = useState<'lectures' | 'pdf'>('lectures');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return videos.filter(item => 
      activeTab === 'lectures' ? item.type === 'video' : item.type === 'pdf'
    );
  }, [videos, activeTab]);

  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const handleContinue = () => {
    if (selectedItem) {
      onSelect(selectedItem);
    }
    setIsPopupOpen(false);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4">
      <WhatsAppPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onContinue={handleContinue}
        actionText={selectedItem?.type === 'pdf' ? "Continue to PDF" : "Continue to Video Lecture"}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-[#0a0b0d]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 w-fit mx-auto shadow-xl">
        <button
          onClick={() => setActiveTab('lectures')}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
            activeTab === 'lectures' 
              ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-105' 
              : 'text-zinc-500 hover:text-white hover:bg-white/5'
          }`}
        >
          Lectures
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
            activeTab === 'pdf' 
              ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-105' 
              : 'text-zinc-500 hover:text-white hover:bg-white/5'
          }`}
        >
          PDF
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-4"
            >
              {filteredItems.map((item, index) => {
                const isActive = item.id === currentVideoId;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group flex items-center gap-5 p-4 bg-[#0a0b0d]/60 backdrop-blur-md border border-white/5 rounded-2xl transition-all duration-300 hover:bg-[#111318] hover:border-accent/30 active:scale-[0.98] text-left shadow-lg ${
                      isActive ? 'border-accent/50 bg-accent/5 shadow-accent/5' : ''
                    }`}
                  >
                    {/* Play Icon Circle */}
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'bg-accent border-accent shadow-lg shadow-accent/20' : 'bg-[#1a1c23] border-white/5 group-hover:border-accent/30'
                    }`}>
                      <Play className={`w-5 h-5 ${isActive ? 'text-white fill-white' : 'text-zinc-500 group-hover:text-accent'}`} />
                    </div>
                    
                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-black uppercase tracking-tight leading-snug truncate ${isActive ? 'text-accent' : 'text-white/90'}`}>
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                        {item.type === 'video' ? 'Video Lecture' : 'Study Material'}
                      </p>
                    </div>
                    
                    {/* Document Icon */}
                    <div className="flex-shrink-0 mr-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white" />
                    </div>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-zinc-600"
            >
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No {activeTab} available</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

