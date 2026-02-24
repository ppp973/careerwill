import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Batch } from '../types';

interface LoadingScreenProps {
  batch: Batch;
  onFinished: () => void;
}

const loadingTexts = [
  "Fetching lectures...",
  "Preparing player...",
  "Optimizing stream...",
  "Almost ready..."
];

export default function LoadingScreen({ batch, onFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const interval = 30;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinished, 500);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    const textTimer = setInterval(() => {
      setTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, [onFinished]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white p-6"
    >
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="mesh-gradient" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent/20 shadow-[0_0_50px_rgba(0,210,84,0.15)] relative">
            <div className="absolute inset-0 border-2 border-accent/30 rounded-3xl animate-pulse" />
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight uppercase">{batch.title}</h2>
          <p className="text-accent/60 text-[10px] font-black uppercase tracking-[0.4em]">Establishing Secure Stream</p>
        </motion.div>

        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
          <motion.div
            className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_20px_rgba(0,210,84,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="h-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]"
            >
              {loadingTexts[textIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
