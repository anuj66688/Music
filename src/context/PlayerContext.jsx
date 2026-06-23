// src/context/PlayerContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { lyricsApi } from "../services/lyricsApi";
import { dbService } from "../services/firebase";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState("none"); // "none" | "all" | "one"

  // UX states
  const [lyrics, setLyrics] = useState("");
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState(false);

  // Audio HTML node reference
  const audioRef = useRef(new Audio());
  
  // AudioContext for Visualizer
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  // Synchronize audio element settings
  useEffect(() => {
    const audio = audioRef.current;
    
    // Set crossOrigin to anonymous so we can analyze the frequencies (if the server supports CORS)
    audio.crossOrigin = "anonymous";

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleSongEnded();

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, queue, isRepeat, isShuffle]);

  // Handle songs ending based on repeat state
  const handleSongEnded = () => {
    if (isRepeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextSong();
    }
  };

  // Set source whenever current song changes
  useEffect(() => {
    if (currentSong?.audioUrl) {
      const audio = audioRef.current;
      audio.src = currentSong.audioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn("Autoplay blocked by browser. Interaction required.", err);
          setIsPlaying(false);
        });
      }
      
      // Sync Recently Played with database
      dbService.addToRecentlyPlayed(currentSong);

      // Fetch lyrics
      fetchSongLyrics(currentSong.artist, currentSong.title);
    } else {
      setIsPlaying(false);
    }
  }, [currentSong]);

  // Handle volume updates
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Setup Web Audio API for visualizer (lazy loaded on first play)
  const initAudioAnalyser = () => {
    if (analyserRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      sourceRef.current = source;
    } catch (e) {
      console.warn("Failed to initialize AudioContext analyzer (CORS or secure context issue):", e);
    }
  };

  // Fetch lyrics from lyrics API
  const fetchSongLyrics = async (artist, title) => {
    setLoadingLyrics(true);
    setLyrics("");
    try {
      const text = await lyricsApi.fetchLyrics(artist, title);
      setLyrics(text);
    } catch (err) {
      setLyrics("Lyrics unavailable for this song.");
    } finally {
      setLoadingLyrics(false);
    }
  };

  // PLAYBACK ACTIONS

  const playTrack = (track, contextQueue = []) => {
    initAudioAnalyser();
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    // Set Queue
    let fullQueue = contextQueue.length > 0 ? contextQueue : [track];
    
    // Check index
    let idx = fullQueue.findIndex((t) => t.songId === track.songId || t.id === track.songId);
    if (idx === -1) {
      fullQueue = [track, ...fullQueue];
      idx = 0;
    }

    setQueue(fullQueue);
    setCurrentIndex(idx);
    setCurrentSong(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    initAudioAnalyser();
    if (!currentSong) return;

    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const nextSong = () => {
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (isRepeat === "all") {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        audioRef.current.pause();
        return;
      }
    }

    setCurrentIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;

    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else if (prevIndex < 0) {
      if (isRepeat === "all") {
        prevIndex = queue.length - 1;
      } else {
        // Go to start of current song
        audioRef.current.currentTime = 0;
        return;
      }
    }

    setCurrentIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (val) => {
    const fixedVal = Math.max(0, Math.min(1, val));
    setVolume(fixedVal);
    if (fixedVal > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setRepeat((prev) => {
      if (prev === "none") return "all";
      if (prev === "all") return "one";
      return "none";
    });
  };

  const addToQueue = (song) => {
    if (queue.some((s) => s.songId === song.songId)) return;
    setQueue((prev) => [...prev, song]);
  };

  const removeFromQueue = (songId) => {
    setQueue((prev) => prev.filter((s) => s.songId !== songId));
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(-1);
    setCurrentSong(null);
    setIsPlaying(false);
    audioRef.current.pause();
    audioRef.current.src = "";
  };

  const value = {
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
    lyrics,
    loadingLyrics,
    isLyricsOpen,
    isFullScreenPlayer,
    analyser: analyserRef.current,
    setIsLyricsOpen,
    setIsFullScreenPlayer,
    playTrack,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    changeVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  return useContext(PlayerContext);
};

export default PlayerContext;
