// src/components/MusicPlayer.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaRandom,
  FaUndo,
  FaVolumeUp,
  FaVolumeMute,
  FaMusic,
  FaHeart,
  FaRegHeart,
  FaRegListAlt,
  FaExpand,
  FaCompress,
  FaChevronDown,
  FaMicrophone
} from "react-icons/fa";
import { usePlayer } from "../hooks/usePlayer";
import { useAuth } from "../hooks/useAuth";
import { AudioVisualizer } from "./AudioVisualizer";
import { LyricsPanel } from "./LyricsPanel";

export const MusicPlayer = () => {
  const {
    isPlaying,
    currentSong,
    queue,
    currentIndex,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    isLyricsOpen,
    isFullScreenPlayer,
    setIsLyricsOpen,
    setIsFullScreenPlayer,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    removeFromQueue,
    clearQueue
  } = usePlayer();

  const { user, toggleLikeSong } = useAuth();
  const [showQueue, setShowQueue] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Time formatter (e.g. 195 -> 3:15)
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const isLiked = user?.likedSongs?.includes(currentSong?.songId);

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (!currentSong) return;
    setIsLiking(true);
    try {
      await toggleLikeSong(currentSong.songId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  if (!currentSong) return null;

  return (
    <>
      {/* ==========================================
          STICKY BOTTOM PLAYER
          ========================================== */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 px-6 flex items-center justify-between z-40 select-none">
        
        {/* Left Section: Track Metadata & Heart Like */}
        <div className="flex items-center space-x-4 w-[30%] min-w-[180px]">
          <div
            onClick={() => setIsFullScreenPlayer(true)}
            className="relative w-14 h-14 rounded-lg overflow-hidden cursor-pointer group shadow-lg shrink-0"
          >
            <img
              src={currentSong.coverImage || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60"}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isPlaying ? "animate-spin-slow" : ""}`}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <FaExpand className="text-white text-xs" />
            </div>
          </div>

          <div className="min-w-0">
            <h4
              onClick={() => setIsFullScreenPlayer(true)}
              className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
            >
              {currentSong.title}
            </h4>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{currentSong.artist}</p>
          </div>

          <button
            onClick={handleLikeClick}
            disabled={isLiking}
            className="text-zinc-400 hover:text-white transition p-1"
          >
            {isLiked ? <FaHeart className="text-brand" /> : <FaRegHeart />}
          </button>
        </div>

        {/* Middle Section: Navigation Controls & Seeker Timeline */}
        <div className="flex flex-col items-center w-[40%] max-w-[600px]">
          {/* Audio Buttons */}
          <div className="flex items-center space-x-6 mb-2">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffle ? "text-brand" : "text-zinc-400 hover:text-white"}`}
              title="Shuffle"
            >
              <FaRandom size={14} />
            </button>

            <button onClick={prevSong} className="text-zinc-400 hover:text-white transition-colors" title="Previous">
              <FaStepBackward size={16} />
            </button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="w-10 h-10 bg-white text-black hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-md"
            >
              {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} className="ml-0.5" />}
            </motion.button>

            <button onClick={nextSong} className="text-zinc-400 hover:text-white transition-colors" title="Next">
              <FaStepForward size={16} />
            </button>

            <button
              onClick={toggleRepeat}
              className={`transition-colors ${isRepeat !== "none" ? "text-brand" : "text-zinc-400 hover:text-white"}`}
              title={`Repeat: ${isRepeat}`}
            >
              <FaUndo size={14} />
              {isRepeat === "one" && <span className="absolute text-[8px] font-bold mt-[-10px] ml-[8px]">1</span>}
            </button>
          </div>

          {/* Progress Seek Bar */}
          <div className="w-full flex items-center space-x-3 text-xs text-zinc-500 font-medium">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 accent-brand h-1 bg-zinc-800 rounded-lg cursor-pointer"
              aria-label="Seek track time"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section: Sync Overlays & Volume Slider */}
        <div className="flex items-center space-x-4 w-[30%] min-w-[200px] justify-end">
          {/* Lyrics toggle */}
          <button
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            className={`p-1.5 rounded transition ${isLyricsOpen ? "text-brand bg-white/5" : "text-zinc-400 hover:text-white"}`}
            title="Lyrics"
          >
            <FaMicrophone size={16} />
          </button>

          {/* Queue toggle */}
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-1.5 rounded transition ${showQueue ? "text-brand bg-white/5" : "text-zinc-400 hover:text-white"}`}
            title="Queue"
          >
            <FaRegListAlt size={16} />
          </button>

          {/* Volume icon / Mute */}
          <div className="flex items-center space-x-2 group">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition">
              {isMuted || volume === 0 ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-20 accent-brand h-1 bg-zinc-800 rounded-lg cursor-pointer transition-all"
              aria-label="Volume slider"
            />
          </div>

          {/* Fullscreen Overlay toggle */}
          <button
            onClick={() => setIsFullScreenPlayer(true)}
            className="text-zinc-400 hover:text-white transition p-1"
            title="Fullscreen visualizer"
          >
            <FaExpand size={15} />
          </button>
        </div>
      </div>

      {/* ==========================================
          QUEUE DRAWER / OVERLAY PANEL
          ========================================== */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 w-80 bg-zinc-900/95 border border-white/10 rounded-xl shadow-2xl p-4 z-40 max-h-[400px] overflow-y-auto backdrop-blur-lg select-none"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Play Queue ({queue.length})</h3>
              <button onClick={clearQueue} className="text-xs text-red-400 hover:underline">
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {queue.map((song, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={song.songId + "-" + idx}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition ${
                      isActive ? "bg-brand/10 text-brand font-semibold" : "hover:bg-white/5 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <img
                        src={song.coverImage}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="truncate">
                        <p className="truncate text-white">{song.title}</p>
                        <p className="text-zinc-500 truncate text-[10px]">{song.artist}</p>
                      </div>
                    </div>
                    {!isActive && (
                      <button
                        onClick={() => removeFromQueue(song.songId)}
                        className="text-zinc-500 hover:text-red-400 px-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          LYRICS SLIDE OUT / MODAL PANEL
          ========================================== */}
      <AnimatePresence>
        {isLyricsOpen && !isFullScreenPlayer && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 w-full md:w-[450px] bottom-24 bg-zinc-950/98 border-l border-white/5 z-30 shadow-2xl pt-16 flex flex-col backdrop-blur-md"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <span className="text-sm font-bold text-brand uppercase tracking-wider">Synced Lyrics</span>
              <button
                onClick={() => setIsLyricsOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LyricsPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          FULL SCREEN GLOWING VISUALIZER & LYRICS HUB
          ========================================== */}
      <AnimatePresence>
        {isFullScreenPlayer && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-zinc-900 to-black select-none overflow-hidden flex flex-col"
          >
            {/* Header Toolbar */}
            <div className="h-16 px-8 flex items-center justify-between z-10">
              <button
                onClick={() => setIsFullScreenPlayer(false)}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <FaChevronDown size={18} />
              </button>
              <div className="text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Playing from queue
                </p>
                <p className="text-xs font-bold text-white max-w-[200px] truncate">
                  {currentSong.album}
                </p>
              </div>
              <button
                onClick={() => setIsFullScreenPlayer(false)}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <FaCompress size={16} />
              </button>
            </div>

            {/* Split Grid: Left (Art + Wave) & Right (Lyrics) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 lg:px-16 items-center overflow-hidden">
              
              {/* Left Column: Huge rotating artwork + glowing wave visualizer */}
              <div className="flex flex-col items-center justify-center space-y-8 h-full max-h-[80vh]">
                <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                  <img
                    src={currentSong.coverImage}
                    alt=""
                    className={`w-full h-full object-cover ${isPlaying ? "animate-spin-slow" : ""}`}
                  />
                  {/* Glowing halo behind art */}
                  <div className="absolute inset-0 bg-brand/10 shadow-[inset_0_0_100px_rgba(29,185,84,0.3)] pointer-events-none rounded-2xl" />
                </div>
                
                {/* Visualizer Canvas row */}
                <div className="w-full h-32 max-w-lg">
                  <AudioVisualizer isFullScreen={true} />
                </div>
              </div>

              {/* Right Column: Synced Lyrics Scrolling View */}
              <div className="h-full max-h-[85vh] overflow-hidden flex flex-col justify-center border-l border-white/5 pl-4 lg:pl-12">
                <div className="flex-1 overflow-hidden py-12">
                  <LyricsPanel />
                </div>
              </div>
            </div>

            {/* Player controls row inside fullscreen */}
            <div className="py-8 bg-black/40 border-t border-white/5 backdrop-blur px-8 lg:px-24 flex flex-col items-center space-y-4">
              <div className="w-full max-w-2xl flex items-center space-x-3 text-xs text-zinc-500 font-semibold">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="flex-1 accent-brand h-1 bg-zinc-800 rounded-lg cursor-pointer"
                  aria-label="Seek timeline range"
                />
                <span>{formatTime(duration)}</span>
              </div>

              <div className="flex items-center space-x-12">
                <button
                  onClick={toggleShuffle}
                  className={`text-lg transition-colors ${isShuffle ? "text-brand" : "text-zinc-500 hover:text-white"}`}
                >
                  <FaRandom />
                </button>

                <button onClick={prevSong} className="text-2xl text-zinc-400 hover:text-white transition">
                  <FaStepBackward />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white text-black hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-xl"
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
                </button>

                <button onClick={nextSong} className="text-2xl text-zinc-400 hover:text-white transition">
                  <FaStepForward />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={`text-lg transition-colors ${isRepeat !== "none" ? "text-brand" : "text-zinc-500 hover:text-white"}`}
                >
                  <FaUndo />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MusicPlayer;
