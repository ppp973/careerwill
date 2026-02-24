import { motion } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings
} from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  volume: number;
  playbackSpeed: number;
  isFullscreen: boolean;
  onTogglePlay: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onToggleFullscreen: () => void;
  onSetSpeed: (speed: number) => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s]
    .map(v => v < 10 ? "0" + v : v)
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};

export default function PlayerControls({
  isPlaying,
  progress,
  duration,
  currentTime,
  volume,
  playbackSpeed,
  isFullscreen,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleFullscreen,
  onSetSpeed,
  onNext,
  onPrev,
  hasPrev,
  hasNext
}: PlayerControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-10 pointer-events-none"
    >
      <div className="w-full max-w-7xl mx-auto pointer-events-auto flex flex-col gap-6">
        {/* Seek Bar */}
        <div className="group relative w-full flex flex-col gap-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer group-hover:h-2 transition-all duration-300 overflow-hidden">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <motion.div 
              className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_20px_rgba(0,210,84,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-12">
            {/* Playback Controls */}
            <div className="flex items-center gap-5">
              <button 
                onClick={onPrev}
                disabled={!hasPrev}
                className={`p-2 transition-all duration-300 ${hasPrev ? 'text-white hover:text-accent hover:scale-110 active:scale-90' : 'opacity-10 cursor-not-allowed'}`}
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>
              
              <button 
                onClick={onTogglePlay}
                className="w-16 h-16 bg-accent text-white rounded-[1.5rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/20"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
              
              <button 
                onClick={onNext}
                disabled={!hasNext}
                className={`p-2 transition-all duration-300 ${hasNext ? 'text-white hover:text-accent hover:scale-110 active:scale-90' : 'opacity-10 cursor-not-allowed'}`}
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 group/volume bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <button 
                onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
                className="p-1 transition-colors"
              >
                {volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-white/60 group-hover/volume:text-white" />}
              </button>
              <div className="w-20 overflow-hidden">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Playback Speed Settings */}
            <div className="relative group/speed">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all flex items-center gap-3 group-hover:border-accent/30">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">{playbackSpeed}x</span>
                <Settings className="w-5 h-5 text-white/40 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
              </button>
              <div className="absolute bottom-full right-0 mb-4 bg-[#0a0b0d]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 opacity-0 group-hover/speed:opacity-100 pointer-events-none group-hover/speed:pointer-events-auto transition-all translate-y-4 group-hover/speed:translate-y-0 shadow-2xl min-w-[140px] z-50">
                <div className="px-3 py-2 border-b border-white/5 mb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Playback Speed</p>
                </div>
                {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => onSetSpeed(speed)}
                    className={`block w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${playbackSpeed === speed ? 'text-accent bg-accent/10' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button 
              onClick={onToggleFullscreen}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all hover:text-accent hover:border-accent/30"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
