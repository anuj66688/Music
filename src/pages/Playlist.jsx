// src/pages/Playlist.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiShare2, FiArrowUp, FiArrowDown, FiPlus } from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../hooks/useAuth";
import { dbService, uploadFile } from "../services/firebase";
import { usePlayer } from "../hooks/usePlayer";
import { Loader } from "../components/Loader";
import Modal from "../components/Modal";
import SongCard from "../components/SongCard";

export const Playlist = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack, currentSong, isPlaying } = usePlayer();

  // Component states
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [allDatabaseSongs, setAllDatabaseSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Edit metadata form values
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Search inside playlist to add new tracks
  const [searchSongQuery, setSearchSongQuery] = useState("");

  const loadPlaylistDetails = async () => {
    try {
      const allPlaylists = await dbService.getPlaylists();
      const match = allPlaylists.find((p) => p.playlistId === playlistId);
      
      if (!match) {
        navigate("/library");
        return;
      }
      setPlaylist(match);
      setEditTitle(match.title);
      setEditDescription(match.description);

      const dbSongs = await dbService.getSongs();
      setAllDatabaseSongs(dbSongs);

      // Filter songs belonging to this playlist
      const playlistSongs = match.songs
        .map((sId) => dbSongs.find((s) => s.songId === sId))
        .filter(Boolean);
      setSongs(playlistSongs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylistDetails();
  }, [playlistId]);

  // Delete current playlist handler
  const handleDeletePlaylist = async () => {
    const confirm = window.confirm("Are you sure you want to delete this playlist?");
    if (!confirm) return;
    try {
      await dbService.deletePlaylist(playlistId);
      window.dispatchEvent(new Event("playlistsUpdated"));
      navigate("/library");
    } catch (err) {
      console.error(err);
    }
  };

  // Re-order songs up/down (bonus feature)
  const moveSong = async (index, direction) => {
    const updatedSongs = [...playlist.songs];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= updatedSongs.length) return;

    // Swap indices
    const temp = updatedSongs[index];
    updatedSongs[index] = updatedSongs[targetIndex];
    updatedSongs[targetIndex] = temp;

    try {
      const updated = await dbService.updatePlaylist(playlistId, { songs: updatedSongs });
      setPlaylist(updated);
      
      // Update local songs state
      const reordered = updated.songs
        .map((sId) => allDatabaseSongs.find((s) => s.songId === sId))
        .filter(Boolean);
      setSongs(reordered);
    } catch (err) {
      console.error(err);
    }
  };

  // Save changes to title/desc/cover
  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let coverUrl = playlist.coverImage;
      if (editCoverFile) {
        coverUrl = await uploadFile(editCoverFile, `covers/${playlistId}_cover`);
      }

      const updated = await dbService.updatePlaylist(playlistId, {
        title: editTitle,
        description: editDescription,
        coverImage: coverUrl
      });

      setPlaylist(updated);
      setIsEditOpen(false);
      window.dispatchEvent(new Event("playlistsUpdated"));
      alert("Playlist updated successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Add song to playlist handler
  const handleAddSong = async (songId) => {
    try {
      const updated = await dbService.addSongToPlaylist(playlistId, songId);
      await loadPlaylistDetails();
      setSearchSongQuery("");
    } catch (err) {
      console.error(err);
    }
  };

  // Handle remove success callback from SongCard
  const handleRemoveTrackSuccess = (removedSongId) => {
    setSongs(songs.filter((s) => s.songId !== removedSongId));
    setPlaylist((prev) => ({
      ...prev,
      songs: prev.songs.filter((id) => id !== removedSongId)
    }));
  };

  // Filter songs for search addition list
  const filteredSearchSongs = allDatabaseSongs.filter(
    (s) =>
      !playlist?.songs?.includes(s.songId) &&
      (s.title.toLowerCase().includes(searchSongQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchSongQuery.toLowerCase()))
  );

  const playlistShareUrl = window.location.href;

  if (loading) return <Loader size="lg" />;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-h-[calc(100vh-4rem)] pb-24">
      
      {/* Playlist header section */}
      <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-6 mb-8 border-b border-white/5 pb-8 mt-2">
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl bg-zinc-800 shrink-0 border border-white/5">
          <img
            src={playlist.coverImage}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <span className="text-xs font-bold text-brand uppercase tracking-widest mb-1.5">
            Playlist
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4">
            {playlist.title}
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl leading-relaxed mb-4">
            {playlist.description}
          </p>
          <div className="flex items-center space-x-3 text-xs text-zinc-500 font-medium">
            <span>Created by {playlist.owner}</span>
            <span>&bull;</span>
            <span>{songs.length} {songs.length === 1 ? "song" : "songs"}</span>
          </div>
        </div>

        {/* Playlist Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="p-2.5 bg-zinc-900 border border-white/5 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-lg transition"
            title="Edit details"
            id="edit-playlist-modal-btn"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => setIsShareOpen(true)}
            className="p-2.5 bg-zinc-900 border border-white/5 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-lg transition"
            title="Share"
            id="share-playlist-modal-btn"
          >
            <FiShare2 size={16} />
          </button>
          <button
            onClick={handleDeletePlaylist}
            className="p-2.5 bg-red-650 hover:bg-red-700 text-white rounded-lg transition"
            title="Delete Playlist"
            id="delete-playlist-btn"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Playlist tracks listing */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-4 tracking-wide">Songs</h3>
          {songs.length > 0 ? (
            <div className="flex flex-col space-y-2.5">
              {songs.map((song, index) => (
                <div
                  key={song.songId}
                  className="flex items-center justify-between p-3 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-xl transition border border-white/5 select-none"
                >
                  <div className="flex-1 flex items-center space-x-4 min-w-0">
                    <span className="text-xs text-zinc-500 font-bold w-4 text-center">
                      {index + 1}
                    </span>
                    <img
                      src={song.coverImage}
                      alt=""
                      className="w-10 h-10 rounded object-cover border border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  {/* Re-ordering arrows & Song Card triggers */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => moveSong(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500"
                      title="Move up"
                    >
                      <FiArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveSong(index, 1)}
                      disabled={index === songs.length - 1}
                      className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500"
                      title="Move down"
                    >
                      <FiArrowDown size={14} />
                    </button>
                    
                    {/* Reusable Song card wrapper */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      <SongCard
                        song={song}
                        queueList={songs}
                        showRemoveFromPlaylistId={playlistId}
                        onRemoveSuccess={handleRemoveTrackSuccess}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-xs py-4">No songs added to this playlist yet.</p>
          )}
        </div>

        {/* Playlist builder / track finder search row */}
        <div className="pt-6 border-t border-white/5">
          <h4 className="text-lg font-bold text-white mb-2">Let's add some flow</h4>
          <p className="text-xs text-zinc-400 mb-4">Search from all VibeFlow tracks below to insert them.</p>

          <input
            type="text"
            value={searchSongQuery}
            onChange={(e) => setSearchSongQuery(e.target.value)}
            placeholder="Search songs or artists..."
            className="w-full max-w-md px-4 py-2 bg-zinc-900 border border-white/5 focus:border-brand/40 text-white placeholder-zinc-500 rounded-lg text-sm outline-none transition"
            id="playlist-builder-search"
          />

          {searchSongQuery && (
            <div className="mt-4 max-w-xl bg-zinc-900/60 border border-white/5 rounded-xl py-2 max-h-48 overflow-y-auto space-y-1">
              {filteredSearchSongs.length > 0 ? (
                filteredSearchSongs.map((song) => (
                  <div
                    key={song.songId}
                    className="flex items-center justify-between px-4 py-2 hover:bg-white/5 text-xs text-zinc-300"
                  >
                    <div className="truncate pr-4">
                      <p className="font-semibold text-white truncate">{song.title}</p>
                      <p className="text-zinc-500 truncate mt-0.5">{song.artist}</p>
                    </div>
                    <button
                      onClick={() => handleAddSong(song.songId)}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-zinc-200 text-black font-bold rounded-full transition"
                    >
                      <FiPlus size={11} />
                      <span>Add</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-center py-4">No matching songs available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          EDIT PLAYLIST METADATA MODAL
          ========================================== */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Playlist Details">
        <form onSubmit={handleSaveMetadata} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-white/5 rounded-lg text-white text-sm outline-none focus:border-brand"
              required
              id="edit-playlist-title"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-white/5 rounded-lg text-white text-sm outline-none focus:border-brand h-24 resize-none"
              id="edit-playlist-desc"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditCoverFile(e.target.files[0])}
              className="text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200 file:cursor-pointer"
              id="edit-playlist-image-uploader"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 bg-brand text-black font-bold rounded-lg text-sm transition hover:bg-brand-light active:scale-95 disabled:opacity-50 mt-4"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* ==========================================
          SHARE PLAYLIST / QR CODE MODAL
          ========================================== */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share Playlist Flow">
        <div className="flex flex-col items-center space-y-6 text-center">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Scan this dynamic QR Code below using your mobile camera or tablet to quickly load the playlist on another device!
          </p>

          <div className="p-4 bg-white rounded-2xl shadow-xl">
            <QRCodeSVG value={playlistShareUrl} size={180} />
          </div>

          <div className="w-full flex flex-col space-y-2">
            <label className="text-xs text-left font-bold text-zinc-500 uppercase">Share Link</label>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={playlistShareUrl}
                className="flex-1 bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-300 select-all outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(playlistShareUrl);
                  alert("Link copied to clipboard!");
                }}
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-zinc-200 transition"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Playlist;
