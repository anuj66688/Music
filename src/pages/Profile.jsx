// src/pages/Profile.jsx
import React, { useState } from "react";
import { FiUser, FiMail, FiBarChart2, FiMonitor, FiSettings } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { hasSpotifyCredentials, setSpotifyCredentials } from "../services/spotifyApi";
import Modal from "../components/Modal";

export const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Settings states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSpotifySettingsOpen, setIsSpotifySettingsOpen] = useState(false);

  // Form values
  const [name, setName] = useState(user?.name || "");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Spotify keys form
  const [spotifyClientId, setSpotifyClientId] = useState(
    localStorage.getItem("vibeflow_spotify_client_id") || ""
  );
  const [spotifyClientSecret, setSpotifyClientSecret] = useState(
    localStorage.getItem("vibeflow_spotify_client_secret") || ""
  );

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const updates = { name };
      if (avatarSeed.trim()) {
        updates.avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;
      }
      await updateProfile(updates);
      setIsEditProfileOpen(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSpotifyCreds = (e) => {
    e.preventDefault();
    setSpotifyCredentials(spotifyClientId.trim(), spotifyClientSecret.trim());
    setIsSpotifySettingsOpen(false);
    alert("Spotify credentials configured successfully! Live search enabled.");
  };

  const hasCreds = hasSpotifyCredentials();

  // Listening statistics (mocked based on actual or simulated playback data)
  const stats = {
    totalSongsPlayed: user?.recentlyPlayed?.length * 4 + 18 || 42,
    minutesListened: user?.recentlyPlayed?.length * 15 + 120 || 285,
    topGenre: "Lo-Fi / Synthwave",
    favoriteTrack: user?.recentlyPlayed?.[0]?.title || "Midnight Drive"
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-h-[calc(100vh-4rem)] pb-24">
      
      {/* Profile info banner */}
      <div className="flex items-center space-x-6 mb-8 border-b border-white/5 pb-8 mt-2">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || "guest"}`}
          alt=""
          className="w-24 h-24 rounded-full object-cover shadow-xl border border-white/10"
        />
        <div>
          <span className="text-xs font-bold text-brand uppercase tracking-widest mb-1.5 block">
            User Profile
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-2">
            {user?.name || "Guest Flow"}
          </h2>
          <p className="text-zinc-500 text-xs flex items-center">
            <FiMail className="mr-1.5" /> {user?.email || "anonymous@vibeflow.io"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Listening statistics */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center">
              <FiBarChart2 className="mr-2 text-brand" /> Personal Streaming Metrics
            </h3>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tracks Played</span>
                <p className="text-2xl font-extrabold text-white mt-1">{stats.totalSongsPlayed}</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mins Listened</span>
                <p className="text-2xl font-extrabold text-white mt-1">{stats.minutesListened}m</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Top Genre</span>
                <p className="text-sm font-extrabold text-brand mt-1 truncate">{stats.topGenre}</p>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Top Track</span>
                <p className="text-sm font-extrabold text-white mt-1 truncate">{stats.favoriteTrack}</p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="glass-card p-6 rounded-2xl flex flex-col space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center">
              <FiMonitor className="mr-2 text-brand" /> Keyboard Shortcuts Guide
            </h3>
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                <span className="text-zinc-400">Play / Pause</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 text-white rounded font-mono border border-zinc-700 shadow">Space</kbd>
              </div>
              <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                <span className="text-zinc-400">Next Track / Prev Track</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 text-white rounded font-mono border border-zinc-700 shadow">N / P</kbd>
              </div>
              <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                <span className="text-zinc-400">Seek Forward / Backward</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 text-white rounded font-mono border border-zinc-700 shadow">&rarr; / &larr;</kbd>
              </div>
              <div className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                <span className="text-zinc-400">Volume Up / Down</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 text-white rounded font-mono border border-zinc-700 shadow">&uarr; / &darr;</kbd>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Toggle Mute / Unmute</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 text-white rounded font-mono border border-zinc-700 shadow">M</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Account Preferences Settings */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col space-y-4">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center">
              <FiSettings className="mr-2 text-brand" /> Settings
            </h3>
            <div className="flex flex-col space-y-3 pt-2">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                disabled={!user}
                className="w-full text-left px-4 py-3 bg-zinc-900 border border-white/5 hover:bg-zinc-850 text-sm text-white font-semibold rounded-xl transition flex items-center justify-between"
                id="edit-profile-trigger-btn"
              >
                <span>Edit Profile Details</span>
                <FiUser size={16} className="text-zinc-400" />
              </button>

              <button
                onClick={() => setIsSpotifySettingsOpen(true)}
                className="w-full text-left px-4 py-3 bg-zinc-900 border border-white/5 hover:bg-zinc-850 text-sm text-white font-semibold rounded-xl transition flex items-center justify-between"
                id="spotify-api-settings-trigger-btn"
              >
                <div className="flex flex-col">
                  <span>Spotify Web API Credentials</span>
                  <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                    Status: {hasCreds ? "Production Client Connected" : "Local Simulation Mode Active"}
                  </span>
                </div>
                <FiSettings size={16} className="text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          EDIT PROFILE MODAL
          ========================================== */}
      <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Update Profile Details">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-white/5 rounded-lg text-white text-sm outline-none focus:border-brand"
              required
              id="edit-profile-name"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase">Avatar Seed word</label>
            <input
              type="text"
              value={avatarSeed}
              onChange={(e) => setAvatarSeed(e.target.value)}
              placeholder="e.g. guitar, neon, headphones"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-white/5 rounded-lg text-white text-sm outline-none focus:border-brand"
              id="edit-profile-avatar-seed"
            />
            <span className="text-[9px] text-zinc-500 leading-normal mt-1">
              Seed words generate unique avatars using DiceBear Adventurer avatar generator.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 bg-brand text-black font-bold rounded-lg text-sm transition hover:bg-brand-light active:scale-95 disabled:opacity-50 mt-4"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      </Modal>

      {/* ==========================================
          SPOTIFY CREDENTIALS MODAL
          ========================================== */}
      <Modal isOpen={isSpotifySettingsOpen} onClose={() => setIsSpotifySettingsOpen(false)} title="Configure Spotify Client Web API">
        <form onSubmit={handleSaveSpotifyCreds} className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed mb-2">
            Configure your client credentials (obtained from developer.spotify.com) to query live Spotify tracks, albums and playlist metadata. If empty, the app runs on a pre-packaged simulation mode.
          </p>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase">Spotify Client ID</label>
            <input
              type="text"
              value={spotifyClientId}
              onChange={(e) => setSpotifyClientId(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-white/5 rounded-lg text-white text-sm outline-none focus:border-brand"
              id="spotify-client-id-field"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase">Spotify Client Secret</label>
            <input
              type="password"
              value={spotifyClientSecret}
              onChange={(e) => setSpotifyClientSecret(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-white/5 rounded-lg text-white text-sm outline-none focus:border-brand"
              id="spotify-client-secret-field"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand text-black font-bold rounded-lg text-sm transition hover:bg-brand-light active:scale-95 mt-4"
          >
            Configure Credentials
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
