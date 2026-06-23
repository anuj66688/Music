// src/pages/Library.jsx
import React, { useState, useEffect } from "react";
import { FiHeart, FiFolder, FiFolderPlus, FiMusic } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { dbService } from "../services/firebase";
import { Loader } from "../components/Loader";
import SongCard from "../components/SongCard";
import PlaylistCard from "../components/PlaylistCard";

export const Library = () => {
  const { user, createPlaylist } = useAuth();
  const [activeTab, setActiveTab] = useState("playlists");
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load playlists and liked songs
  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const allPlaylists = await dbService.getPlaylists();
      if (user?.playlists) {
        setPlaylists(allPlaylists.filter(p => user.playlists.includes(p.playlistId)));
      } else {
        setPlaylists([]);
      }

      const allSongs = await dbService.getSongs();
      if (user?.likedSongs) {
        setLikedSongs(allSongs.filter(s => user.likedSongs.includes(s.songId)));
      } else {
        setLikedSongs([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibraryData();
    window.addEventListener("playlistsUpdated", loadLibraryData);
    return () => window.removeEventListener("playlistsUpdated", loadLibraryData);
  }, [user]);

  const handleCreatePlaylist = async () => {
    if (!user) {
      alert("Please login to create playlists!");
      return;
    }
    const title = prompt("Enter playlist title:");
    if (!title) return;
    try {
      await createPlaylist(title, "Custom user playlist created via library.");
      window.dispatchEvent(new Event("playlistsUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-h-[calc(100vh-4rem)] text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 mb-4">
          <FiFolder size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Create your library</h3>
        <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
          Sign in to save songs to Liked Songs, create custom flow playlists, and sync playback metrics.
        </p>
        <button
          onClick={() => window.location.replace("/login")}
          className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-full hover:scale-105 active:scale-95 transition"
        >
          Sign In to VibeFlow
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-h-[calc(100vh-4rem)] pb-24">
      {/* Header with Title & Quick Playlist Addition button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Your Library</h2>
        <button
          onClick={handleCreatePlaylist}
          className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-xs text-white px-4 py-2 rounded-full transition active:scale-95"
        >
          <FiFolderPlus size={14} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex space-x-6 border-b border-white/5 pb-2 mb-6">
        <button
          onClick={() => setActiveTab("playlists")}
          className={`pb-2 text-sm font-semibold transition relative ${
            activeTab === "playlists" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span>Playlists</span>
          {activeTab === "playlists" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("likes")}
          className={`pb-2 text-sm font-semibold transition relative ${
            activeTab === "likes" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span>Liked Songs</span>
          {activeTab === "likes" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
          )}
        </button>
      </div>

      {loading ? (
        <Loader size="lg" />
      ) : activeTab === "playlists" ? (
        /* Playlists Section */
        <div>
          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.playlistId} playlist={playlist} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
              <FiFolder size={36} className="mb-2.5 opacity-60" />
              <p className="text-sm">No custom playlists created yet.</p>
              <button
                onClick={handleCreatePlaylist}
                className="text-brand text-xs font-semibold mt-1 hover:underline"
              >
                Create one now
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Liked Songs Section */
        <div>
          {likedSongs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {likedSongs.map((song) => (
                <SongCard key={song.songId} song={song} queueList={likedSongs} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
              <FiHeart size={36} className="mb-2.5 opacity-60" />
              <p className="text-sm">Songs you heart will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Library;
