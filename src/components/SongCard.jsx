// src/components/SongCard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaPlus, FaTrash } from "react-icons/fa";
import { usePlayer } from "../hooks/usePlayer";
import { useAuth } from "../hooks/useAuth";
import { dbService } from "../services/firebase";

export const SongCard = ({ song, queueList = [], showRemoveFromPlaylistId = null, onRemoveSuccess = null }) => {
  const { currentSong, isPlaying, playTrack } = usePlayer();
  const { user, toggleLikeSong, isMock } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);

  const isCurrent = currentSong?.songId === song.songId;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isLiked = user?.likedSongs?.includes(song.songId);

  // Play button click handler
  const handlePlayClick = (e) => {
    e.stopPropagation();
    playTrack(song, queueList);
  };

  // Heart button like click handler
  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Please login to save songs to your library!");
      return;
    }
    setIsLiking(true);
    try {
      await toggleLikeSong(song.songId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  // Add song to playlist handler
  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    try {
      await dbService.addSongToPlaylist(playlistId, song.songId);
      setShowPlaylistDropdown(false);
      alert("Added song to playlist!");
    } catch (err) {
      console.error(err);
    }
  };

  // Remove song from playlist handler
  const handleRemoveFromPlaylist = async (e) => {
    e.stopPropagation();
    if (!showRemoveFromPlaylistId) return;
    try {
      await dbService.removeSongFromPlaylist(showRemoveFromPlaylistId, song.songId);
      if (onRemoveSuccess) onRemoveSuccess(song.songId);
    } catch (err) {
      console.error(err);
    }
  };

  // List of user custom playlists
  const userPlaylists = user?.playlists || [];

  return (
    <div
      onClick={() => playTrack(song, queueList)}
      className="glass-card p-4 rounded-xl flex flex-col cursor-pointer relative group select-none"
    >
      {/* Cover Image & Hover Play Button */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-4 shadow-md bg-zinc-800">
        <img
          src={song.coverImage || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60"}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover overlay screen */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayClick}
            className="w-12 h-12 bg-brand text-black rounded-full flex items-center justify-center shadow-xl hover:bg-brand-light transition-colors"
          >
            {isCurrentlyPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="ml-1" />}
          </motion.button>
        </div>

        {/* Top Floating Controls */}
        <div className="absolute top-2 right-2 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {/* Like Heart */}
          <button
            onClick={handleLikeClick}
            disabled={isLiking}
            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition"
          >
            {isLiked ? <FaHeart className="text-red-500" size={13} /> : <FaRegHeart size={13} />}
          </button>

          {/* Context Options menu trigger */}
          {showRemoveFromPlaylistId ? (
            <button
              onClick={handleRemoveFromPlaylist}
              className="p-2 bg-red-600/80 hover:bg-red-700 text-white rounded-full backdrop-blur-md transition"
              title="Remove from playlist"
            >
              <FaTrash size={13} />
            </button>
          ) : (
            userPlaylists.length > 0 && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistDropdown(!showPlaylistDropdown);
                  }}
                  className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition"
                  title="Add to playlist"
                >
                  <FaPlus size={13} />
                </button>

                {/* Dropdown body */}
                {showPlaylistDropdown && (
                  <div className="absolute right-0 mt-1 w-40 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl z-20 py-1 max-h-32 overflow-y-auto">
                    <p className="px-3 py-1 text-xs font-semibold text-zinc-500 border-b border-white/5">
                      Add to Playlist:
                    </p>
                    {userPlaylists.map((playlistId) => {
                      // Lookup playlist metadata from storage
                      const playlists = JSON.parse(localStorage.getItem("vibeflow_playlists")) || {};
                      const meta = playlists[playlistId];
                      if (!meta) return null;
                      return (
                        <button
                          key={playlistId}
                          onClick={(e) => handleAddToPlaylist(playlistId, e)}
                          className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white truncate"
                        >
                          {meta.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Song details */}
      <div className="flex flex-col min-w-0">
        <h4 className={`font-semibold text-base truncate ${isCurrent ? "text-brand" : "text-white"}`}>
          {song.title}
        </h4>
        <p className="text-zinc-400 text-sm truncate mt-0.5">{song.artist}</p>
      </div>
    </div>
  );
};

export default SongCard;
