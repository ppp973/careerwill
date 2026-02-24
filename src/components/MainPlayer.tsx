import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Batch, ContentItem } from '../types';
import { ChevronLeft, User, Share2, Info, FileText, Play as PlayIcon } from 'lucide-react';
import PlayerControls from './PlayerControls';
import VideoList from './VideoList';
import PDFViewer from './PDFViewer';

interface MainPlayerProps {
  batch: Batch;
  items: ContentItem[];
  onBack: () => void;
}

export default function MainPlayer({ batch, items, onBack }: MainPlayerProps) {
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'player'>('list');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleItemSelect = (item: ContentItem) => {
    if (item.type === 'pdf') {
      window.open(item.url, '_blank');
      return;
    }
    setCurrentItem(item);
    setViewMode('player');
    setIsPlaying(true);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentItem || currentItem.type !== 'video' || viewMode !== 'player') return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        if (videoRef.current) videoRef.current.currentTime += 10;
      } else if (e.code === 'ArrowLeft') {
        if (videoRef.current) videoRef.current.currentTime -= 10;
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        handleVolumeChange(volume === 0 ? 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, currentItem, viewMode]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      const time = (value / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleNext = () => {
    if (!currentItem) return;
    const currentIndex = items.findIndex(v => v.id === currentItem.id);
    if (currentIndex < items.length - 1) {
      handleItemSelect(items[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!currentItem) return;
    const currentIndex = items.findIndex(v => v.id === currentItem.id);
    if (currentIndex > 0) {
      handleItemSelect(items[currentIndex - 1]);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="mesh-gradient" />
      </div>

      {/* Top Bar */}
      <header className="h-16 px-4 md:px-8 border-b border-white/5 flex items-center justify-between bg-bg-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={viewMode === 'player' ? handleBackToList : onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-black uppercase tracking-widest truncate max-w-[200px] md:max-w-md">
              {viewMode === 'player' ? currentItem?.title : batch.title}
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter truncate">
              {viewMode === 'player' ? 'Now Playing' : 'Select Lecture'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors hidden sm:block">
            <Share2 className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[10px] font-black shadow-[0_0_15px_rgba(0,168,89,0.3)]">
            SC
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {viewMode === 'player' && currentItem ? (
            <motion.div 
              key="player-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col"
            >
              {/* Player Section */}
              <div className="w-full bg-black aspect-video relative group overflow-hidden shadow-2xl">
                {currentItem.type === 'video' ? (
                  <div 
                    ref={playerContainerRef}
                    onMouseMove={handleMouseMove}
                    className="w-full h-full relative flex items-center justify-center"
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      src={currentItem.url}
                      className="w-full h-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleNext}
                      onClick={togglePlay}
                    />

                    {/* Custom Controls Overlay */}
                    <AnimatePresence>
                      {showControls && (
                        <PlayerControls
                          isPlaying={isPlaying}
                          progress={progress}
                          duration={duration}
                          currentTime={videoRef.current?.currentTime || 0}
                          volume={volume}
                          playbackSpeed={playbackSpeed}
                          isFullscreen={isFullscreen}
                          onTogglePlay={togglePlay}
                          onSeek={handleSeek}
                          onVolumeChange={handleVolumeChange}
                          onToggleFullscreen={toggleFullscreen}
                          onSetSpeed={setPlaybackSpeed}
                          onNext={handleNext}
                          onPrev={handlePrev}
                          hasPrev={items.findIndex(v => v.id === currentItem.id) > 0}
                          hasNext={items.findIndex(v => v.id === currentItem.id) < items.length - 1}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <PDFViewer url={currentItem.url} title={currentItem.title} />
                )}
              </div>

              {/* List Section (Below Player) */}
              <div className="py-8 bg-gradient-to-b from-bg-dark to-black">
                <VideoList
                  videos={items}
                  currentVideoId={currentItem.id}
                  onSelect={handleItemSelect}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <VideoList
                videos={items}
                currentVideoId={currentItem?.id || ''}
                onSelect={handleItemSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
