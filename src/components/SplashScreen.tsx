import { motion } from 'motion/react';
import { Play } from 'lucide-react';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[100px] rounded-full"
        />
      </div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo Container */}
        <div className="relative mb-12">
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 40px rgba(0,210,84,0.2)",
                "0 0 80px rgba(0,210,84,0.4)",
                "0 0 40px rgba(0,210,84,0.2)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-32 h-32 bg-accent rounded-[2.5rem] flex items-center justify-center border border-white/20 relative z-10"
          >
            <Play className="text-white fill-white w-16 h-16 ml-2" />
          </motion.div>
          
          {/* Outer Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-20px] border border-accent/20 rounded-full border-dashed"
          />
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-black text-white tracking-[0.3em] mb-4 drop-shadow-2xl">
            career will
          </h1>
          <p className="text-accent/60 font-bold uppercase tracking-[0.5em] text-[10px]">
            powerd by - raj
          </p>
        </motion.div>
        
        {/* Loading Bar */}
        <div className="mt-16 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-accent shadow-[0_0_15px_rgba(0,210,84,0.8)]"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

