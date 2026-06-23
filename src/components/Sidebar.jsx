// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiSearch, FiLayers, FiHeart, FiPlus, FiSun, FiMoon } from "react-icons/fi";
import { RiPlayList2Line } from "react-icons/ri";
import { useAuth } from "../hooks/useAuth";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { user, createPlaylist } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("vibeflow_theme") || "dark");
  const [userPlaylists, setUserPlaylists] = useState([]);

  // Sync theme selection to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("vibeflow_theme", theme);
  }, [theme]);

  // Load user playlists from database/local storage
  useEffect(() => {
    const fetchPlaylists = () => {
      const allPlaylists = JSON.parse(localStorage.getItem("vibeflow_playlists")) || {};
      if (user?.playlists) {
        const filtered = Object.values(allPlaylists).filter(p =>
          user.playlists.includes(p.playlistId)
        );
        setUserPlaylists(filtered);
      } else {
        setUserPlaylists([]);
      }
    };
    fetchPlaylists();
    
    // Add event listener to refresh playlists on modification
    window.addEventListener("playlistsUpdated", fetchPlaylists);
    return () => window.removeEventListener("playlistsUpdated", fetchPlaylists);
  }, [user]);

  const handleCreatePlaylist = async () => {
    if (!user) {
      alert("Please login to create playlists!");
      return;
    }
    const name = prompt("Enter playlist title:");
    if (!name) return;
    try {
      const p = await createPlaylist(name, "My custom playlist");
      window.dispatchEvent(new Event("playlistsUpdated"));
      navigate(`/playlist/${p.playlistId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <aside className="w-64 bg-zinc-950 flex flex-col h-full border-r border-white/5 select-none p-4 shrink-0 transition-colors duration-300">
      {/* Brand Logo Header */}
      <Link to="/" className="flex items-center space-x-3 mb-8 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-brand-neon flex items-center justify-center shadow-lg shadow-brand/20">
          <RiPlayList2Line className="text-black text-lg font-bold" />
        </div>
        <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          VIBEFLOW
        </span>
      </Link>

      {/* Main navigation routing */}
      <nav className="space-y-1 mb-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isActive ? "bg-zinc-800/80 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            }`
          }
        >
          <FiHome size={18} />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex items-center space-x-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isActive ? "bg-zinc-800/80 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            }`
          }
        >
          <FiSearch size={18} />
          <span>Search</span>
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `flex items-center space-x-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isActive ? "bg-zinc-800/80 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            }`
          }
        >
          <FiLayers size={18} />
          <span>Your Library</span>
        </NavLink>
      </nav>

      {/* Quick Playlists trigger panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Playlists
          </span>
          <button
            onClick={handleCreatePlaylist}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-850 transition"
            title="Create Playlist"
            id="sidebar-create-playlist-btn"
          >
            <FiPlus size={16} />
          </button>
        </div>

        {/* Liked Songs Entry */}
        <NavLink
          to="/library"
          className="flex items-center space-x-4 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/60 mb-2 transition"
        >
          <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white">
            <FiHeart size={11} className="fill-white" />
          </div>
          <span>Liked Songs</span>
        </NavLink>

        {/* Playlists listing */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {userPlaylists.length > 0 ? (
            userPlaylists.map((p) => (
              <NavLink
                key={p.playlistId}
                to={`/playlist/${p.playlistId}`}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm rounded-lg truncate transition-all ${
                    isActive ? "bg-zinc-800/50 text-white font-medium" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
                  }`
                }
              >
                {p.title}
              </NavLink>
            ))
          ) : (
            <p className="px-3 py-3 text-xs text-zinc-600 leading-relaxed">
              No playlists created yet. Create one above to customize your flow!
            </p>
          )}
        </div>
      </div>

      {/* Bottom widgets: Dark Mode Switcher */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium">
          Theme mode
        </span>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-850 flex items-center justify-center text-zinc-400 hover:text-white transition"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
