import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, ArrowRight, X } from 'lucide-react';

interface WhatsAppPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  title?: string;
  actionText?: string;
}

export default function WhatsAppPopup({ 
  isOpen, 
  onClose, 
  onContinue, 
  title = "Join WhatsApp Channel",
  actionText = "Continue to Content"
}: WhatsAppPopupProps) {
  const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbAvDSX0QeahEg4kkE3U"; // Replace with actual link

  const handleContinue = () => {
    onContinue();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[#0a0b0d]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header with Close */}
            <div className="absolute top-6 right-6">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-10 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-24 h-24 bg-[#25D366]/10 rounded-[2rem] flex items-center justify-center mb-8 border border-[#25D366]/20 shadow-[0_0_40px_rgba(37,211,102,0.15)]">
                <MessageCircle className="w-12 h-12 text-[#25D366] fill-[#25D366]/10" />
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                {title}
              </h3>
              <p className="text-[11px] text-zinc-500 mb-10 leading-relaxed font-bold uppercase tracking-widest">
                Stay updated with the latest lectures and study materials on our WhatsApp channel.
              </p>

              <div className="w-full flex flex-col gap-4">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-[#25D366] hover:bg-[#22c35e] text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#25D366]/20 active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  Join Channel
                </a>
                
                <button
                  onClick={handleContinue}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-white/5"
                >
                  {actionText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
