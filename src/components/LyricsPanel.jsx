// src/components/LyricsPanel.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { usePlayer } from "../hooks/usePlayer";
import { Loader } from "./Loader";

export const LyricsPanel = () => {
  const { lyrics, loadingLyrics, currentTime, currentSong, isPlaying } = usePlayer();
  const listRef = useRef(null);
  const activeLineRef = useRef(null);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);

  // Parse LRC formatted lyrics or split plain text into structured lines
  const parsedLyrics = useMemo(() => {
    if (!lyrics) return [];

    // Check if lyrics contain timestamps [00:12.34]
    const hasTimestamps = /\[\d{2}:\d{2}\.\d{2}\]/.test(lyrics) || /\[\d{2}:\d{2}\]/.test(lyrics);

    if (hasTimestamps) {
      const lines = lyrics.split("\n");
      const result = [];
      
      lines.forEach((line) => {
        // Match timestamps like [01:23.45] or [01:23]
        const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2}))?\](.*)/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const time = minutes * 60 + seconds;
          const text = match[4].trim();
          
          if (text) {
            result.push({ time, text });
          }
        }
      });
      // Sort by timeline
      return result.sort((a, b) => a.time - b.time);
    } else {
      // Split raw plain text
      return lyrics
        .split("\n")
        .map((line, idx) => ({ time: idx * 4, text: line.trim() })) // Guess time marks
        .filter((item) => item.text !== "");
    }
  }, [lyrics]);

  // Compute active lyric line index based on playback currentTime
  useEffect(() => {
    if (parsedLyrics.length === 0) return;

    let activeIndex = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
    setActiveLineIndex(activeIndex);
  }, [currentTime, parsedLyrics]);

  // Smooth scroll to keep the active line in center focus
  useEffect(() => {
    if (activeLineRef.current && listRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [activeLineIndex]);

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12">
        <p className="text-lg">Select a song to display lyrics.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto px-6 py-4">
      {/* Song Header info */}
      <div className="flex items-center space-x-4 mb-6 border-b border-white/5 pb-4">
        <img
          src={currentSong.coverImage || currentSong.album?.images?.[0]?.url}
          alt={currentSong.title}
          className="w-16 h-16 rounded-lg object-cover shadow-lg border border-white/10"
        />
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{currentSong.title}</h2>
          <p className="text-zinc-400 text-sm">{currentSong.artist}</p>
        </div>
      </div>

      {/* Lyrics display body */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto pr-2 space-y-5 select-none scroll-smooth min-h-[300px]"
      >
        {loadingLyrics ? (
          <div className="flex items-center justify-center h-48">
            <Loader size="lg" />
          </div>
        ) : parsedLyrics.length > 0 ? (
          parsedLyrics.map((line, index) => {
            const isActive = index === activeLineIndex;
            return (
              <p
                key={index}
                ref={isActive ? activeLineRef : null}
                className={`text-2xl font-bold tracking-tight transition-all duration-300 origin-left py-1 cursor-default ${
                  isActive
                    ? "text-brand scale-105 opacity-100 filter drop-shadow-[0_0_8px_rgba(29,185,84,0.4)]"
                    : "text-zinc-400 hover:text-white opacity-60"
                }`}
              >
                {line.text}
              </p>
            );
          })
        ) : (
          <p className="text-zinc-500 text-center py-12">Lyrics unavailable.</p>
        )}
      </div>
    </div>
  );
};

export default LyricsPanel;
