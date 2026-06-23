// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import { FiUploadCloud, FiTrash2, FiPlay, FiFileText } from "react-icons/fi";
import { dbService, uploadFile } from "../services/firebase";
import { Loader } from "../components/Loader";

export const Admin = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [duration, setDuration] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchSongsList = async () => {
    try {
      const items = await dbService.getSongs();
      setSongs(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongsList();
  }, []);

  const handleUploadSong = async (e) => {
    e.preventDefault();
    if (!title || !artist || !album || !coverFile || !audioFile || !duration) {
      alert("Please fill in all details and upload files!");
      return;
    }

    setIsUploading(true);
    try {
      const fileId = Date.now();
      // Upload cover image
      const coverUrl = await uploadFile(coverFile, `covers/admin_${fileId}`);
      // Upload audio track file
      const audioUrl = await uploadFile(audioFile, `audio/admin_${fileId}`);

      const durationSecs = parseInt(duration, 10);

      const songData = {
        title,
        artist,
        album,
        coverImage: coverUrl,
        audioUrl,
        duration: durationSecs
      };

      await dbService.uploadSong(songData);
      
      // Clear form inputs
      setTitle("");
      setArtist("");
      setAlbum("");
      setDuration("");
      setCoverFile(null);
      setAudioFile(null);
      document.getElementById("admin-cover-input").value = "";
      document.getElementById("admin-audio-input").value = "";

      // Refresh list
      await fetchSongsList();
      alert("Song uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSong = async (songId) => {
    const confirm = window.confirm("Are you sure you want to delete this track from database?");
    if (!confirm) return;
    try {
      await dbService.deleteSong(songId);
      await fetchSongsList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-h-[calc(100vh-4rem)] pb-24">
      {/* Header */}
      <div className="mb-8 mt-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h2>
        <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
          Upload custom audio tracks, manage artist properties, delete tracks, and monitor system databases.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column (Upload) */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col h-fit">
          <h3 className="text-base font-bold text-white tracking-wide flex items-center mb-4">
            <FiUploadCloud className="mr-2 text-brand" /> Upload Song Files
          </h3>

          <form onSubmit={handleUploadSong} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-white/5 rounded-lg text-white text-xs outline-none focus:border-brand"
                required
                id="admin-song-title"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Artist Name</label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-white/5 rounded-lg text-white text-xs outline-none focus:border-brand"
                required
                id="admin-song-artist"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Album</label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-white/5 rounded-lg text-white text-xs outline-none focus:border-brand"
                required
                id="admin-song-album"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Duration (seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-white/5 rounded-lg text-white text-xs outline-none focus:border-brand"
                required
                id="admin-song-duration"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
                className="text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200"
                required
                id="admin-cover-input"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Audio Track File</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-white file:text-black hover:file:bg-zinc-200"
                required
                id="admin-audio-input"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2 bg-brand text-black font-bold rounded-lg text-xs transition hover:bg-brand-light active:scale-95 disabled:opacity-50 mt-4"
            >
              {isUploading ? "Uploading..." : "Save Song"}
            </button>
          </form>
        </div>

        {/* Database List Column */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col h-[500px]">
          <h3 className="text-base font-bold text-white tracking-wide flex items-center mb-4">
            <FiFileText className="mr-2 text-brand" /> Database Records ({songs.length})
          </h3>

          {loading ? (
            <Loader size="lg" />
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {songs.map((song) => (
                <div
                  key={song.songId}
                  className="flex items-center justify-between p-3 bg-zinc-900 border border-white/5 rounded-xl text-xs"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <img
                      src={song.coverImage}
                      alt=""
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">{song.title}</p>
                      <p className="text-zinc-500 truncate text-[10px] mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSong(song.songId)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete Song"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              {songs.length === 0 && (
                <p className="text-zinc-500 text-center py-16">No database records found.</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Admin;
