import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppState, Batch, Folder, Subfolder, ContentItem } from './types';
import SplashScreen from './components/SplashScreen';
import BatchSelector from './components/BatchSelector';
import LoadingScreen from './components/LoadingScreen';
import MainPlayer from './components/MainPlayer';
import FolderSelector from './components/FolderSelector';
import SubfolderSelector from './components/SubfolderSelector';
import SecurityManager from './components/SecurityManager';
import { batchService } from './services/batchService';

export default function App() {
  const [state, setState] = useState<AppState>(AppState.SPLASH);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState<Subfolder | null>(null);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  useEffect(() => {
    if (state === AppState.SPLASH) {
      const timer = setTimeout(() => {
        setState(AppState.BATCH_SELECT);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleBatchSelect = async (batch: Batch) => {
    setIsLoadingBatch(true);
    setState(AppState.LOADING);
    
    try {
      const data = await batchService.getBatchDetails(batch.id);
      setSelectedBatch(data);
    } catch (err) {
      console.error("Failed to load batch details", err);
    } finally {
      setIsLoadingBatch(false);
    }
  };

  const handleLoadingFinished = () => {
    setState(AppState.FOLDER_SELECT);
  };

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
    setState(AppState.SUBFOLDER_SELECT);
  };

  const handleSubfolderSelect = (subfolder: Subfolder) => {
    setSelectedSubfolder(subfolder);
    setState(AppState.PLAYER);
  };

  const handleBackToBatches = () => {
    setState(AppState.BATCH_SELECT);
    setSelectedBatch(null);
    setSelectedFolder(null);
    setSelectedSubfolder(null);
  };

  const handleBackToFolders = () => {
    setState(AppState.FOLDER_SELECT);
    setSelectedFolder(null);
    setSelectedSubfolder(null);
  };

  const handleBackToSubfolders = () => {
    setState(AppState.SUBFOLDER_SELECT);
    setSelectedSubfolder(null);
  };

  return (
    <div className="min-h-screen bg-bg-dark font-sans">
      <SecurityManager />
      
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="mesh-gradient" />
      </div>

      <AnimatePresence mode="wait">
        {state === AppState.SPLASH && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
          >
            <SplashScreen />
          </motion.div>
        )}

        {state === AppState.BATCH_SELECT && (
          <motion.div 
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BatchSelector onSelect={handleBatchSelect} />
          </motion.div>
        )}

        {state === AppState.LOADING && selectedBatch && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <LoadingScreen 
              batch={selectedBatch} 
              onFinished={handleLoadingFinished} 
            />
          </motion.div>
        )}

        {state === AppState.FOLDER_SELECT && selectedBatch && (
          <motion.div 
            key="folders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FolderSelector 
              folders={selectedBatch.folders || []} 
              onSelectFolder={handleFolderSelect}
              onBack={handleBackToBatches}
              batchTitle={selectedBatch.title}
            />
          </motion.div>
        )}

        {state === AppState.SUBFOLDER_SELECT && selectedFolder && (
          <motion.div 
            key="subfolders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SubfolderSelector 
              subfolders={selectedFolder.subfolders}
              onSelectSubfolder={handleSubfolderSelect}
              onBack={handleBackToFolders}
              folderName={selectedFolder.name}
            />
          </motion.div>
        )}

        {state === AppState.PLAYER && selectedBatch && selectedSubfolder && (
          <motion.div 
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MainPlayer 
              batch={selectedBatch} 
              items={selectedSubfolder.items}
              onBack={handleBackToSubfolders} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
