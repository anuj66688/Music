// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { MusicPlayer } from "./components/MusicPlayer";
import { usePlayer } from "./hooks/usePlayer";

// Pages
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Playlist from "./pages/Playlist";
import Artist from "./pages/Artist";
import Album from "./pages/Album";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export const App = () => {
  const location = useLocation();
  const player = usePlayer();

  // Route paths that should bypass layout components (Sidebar, Navbar, Player)
  const isAuthRoute =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  // Implement Global Keyboard Shortcuts (Space, Skip, Mute, Volume adjustments)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcuts if user is typing inside input boxes
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      if (activeTag === "input" || activeTag === "textarea" || document.activeElement.isContentEditable) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          player.togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          player.seek(player.currentTime + 5);
          break;
        case "ArrowLeft":
          e.preventDefault();
          player.seek(Math.max(0, player.currentTime - 5));
          break;
        case "ArrowUp":
          e.preventDefault();
          player.changeVolume(player.volume + 0.05);
          break;
        case "ArrowDown":
          e.preventDefault();
          player.changeVolume(player.volume - 0.05);
          break;
        case "KeyN":
          e.preventDefault();
          player.nextSong();
          break;
        case "KeyP":
          e.preventDefault();
          player.prevSong();
          break;
        case "KeyM":
          e.preventDefault();
          player.toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player]);

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg text-white font-sans transition-colors duration-300">
      {/* Sidebar navigation panel */}
      <Sidebar />

      {/* Main viewport panels */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-zinc-900 to-black">
        {/* Sticky top Navbar headers */}
        <Navbar />

        {/* Dynamic page routes render slot */}
        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/playlist/:playlistId" element={<Playlist />} />
            <Route path="/artist/:artistId" element={<Artist />} />
            <Route path="/album/:albumId" element={<Album />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>

      {/* Persistent sticky music player control bar */}
      <MusicPlayer />
    </div>
  );
};

export default App;
