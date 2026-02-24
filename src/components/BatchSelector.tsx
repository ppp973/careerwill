import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Batch } from '../types';
import { 
  Search, 
  Send, 
  GraduationCap, 
  Heart, 
  Home, 
  Sun, 
  Bell,
  Loader2,
  X
} from 'lucide-react';
import WhatsAppPopup from './WhatsAppPopup';
import { batchService } from '../services/batchService';

interface BatchSelectorProps {
  onSelect: (batch: Batch) => void;
}

export default function BatchSelector({ onSelect }: BatchSelectorProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    batchService.getBatches()
      .then(data => {
        setBatches(data as Batch[]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch batches", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: any) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleBatchClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsPopupOpen(true);
  };

  const handleContinue = () => {
    if (selectedBatch) {
      onSelect(selectedBatch);
    }
    setIsPopupOpen(false);
  };

  const filteredBatches = useMemo(() => {
    let result = batches;
    if (activeTab === 'favorites') {
      result = result.filter(b => favorites.includes(b.id));
    }
    if (searchQuery) {
      result = result.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [batches, searchQuery, favorites, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#050505] text-white flex flex-col pb-24 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="mesh-gradient" />
      </div>

      {/* WhatsApp Popup */}
      <WhatsAppPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onContinue={handleContinue}
        actionText="Continue to Batch"
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-bg-dark px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,168,89,0.3)]">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white/40">
            {activeTab === 'all' ? 'All Batches' : 'Favorites'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 140, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="relative overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[10px] focus:outline-none focus:border-accent/50"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="nav-icon-container"
          >
            <Search className={`w-4 h-4 ${isSearchOpen ? 'text-accent' : 'text-white/80'}`} />
          </button>
          
          <a 
            href="https://whatsapp.com/channel/0029VbAvDSX0QeahEg4kkE3U" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-icon-container"
          >
            <Send className="w-4 h-4 text-white/80" />
          </a>
          
          <div className="nav-icon-container">
            <Bell className="w-4 h-4 text-white/80" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredBatches.length > 0 ? (
            filteredBatches.map((batch, index) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="premium-card overflow-hidden flex flex-col shadow-lg h-full"
              >
                {/* Card Header */}
                <div className="px-3 py-3 flex items-start justify-between gap-2 bg-white/[0.01]">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Sun className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <h3 className="text-[10px] font-bold tracking-tight uppercase leading-tight text-white/90 line-clamp-2">
                      {batch.title}
                    </h3>
                  </div>
                  <button 
                    onClick={(e) => toggleFavorite(batch.id, e)}
                    className={`transition-colors mt-0.5 flex-shrink-0 ${favorites.includes(batch.id) ? 'text-red-500' : 'text-white/20 hover:text-white/40'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(batch.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Card Body - Square Container */}
                <div className="px-0 py-2 flex-1 flex items-center justify-center bg-[#0d0e12]">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <img 
                      src="https://cdn.phototourl.com/uploads/2026-02-20-5acbea92-51a6-46dd-9d37-eda7dae70e25.png" 
                      alt="VIP Study"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Card Footer - Action Button */}
                <div className="px-3 pb-4 pt-3 bg-white/[0.01]">
                  <button 
                    onClick={() => handleBatchClick(batch)}
                    className="study-button !py-2 !text-[10px] !rounded-lg shadow-md font-black uppercase tracking-[0.1em]"
                  >
                    LET'S STUDY
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/20">
              <Search className="w-10 h-10 mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No batches found</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-dark border-t border-white/5 px-8 py-3 flex items-center justify-around z-50">
        <div 
          onClick={() => setActiveTab('all')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'all' ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
        >
          <div className={`w-12 h-9 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'all' ? 'bg-accent/20 border-accent/30' : 'bg-transparent border-transparent'}`}>
            <Home className={`w-5 h-5 ${activeTab === 'all' ? 'text-accent' : 'text-white'}`} />
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === 'all' ? 'text-accent' : 'text-white'}`}>My Batch</span>
        </div>
        
        <div 
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'favorites' ? 'opacity-100' : 'opacity-40 hover:opacity-60'}`}
        >
          <div className={`w-12 h-9 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'favorites' ? 'bg-accent/20 border-accent/30' : 'bg-transparent border-transparent'}`}>
            <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'text-accent' : 'text-white'} ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === 'favorites' ? 'text-accent' : 'text-white'}`}>Favourites</span>
        </div>
      </nav>
    </motion.div>
  );
}

