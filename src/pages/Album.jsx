// src/pages/Album.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiMusic, FiPlay, FiClock } from "react-icons/fi";
import { spotifyApi } from "../services/spotifyApi";
import { usePlayer } from "../hooks/usePlayer";
import { Loader } from "../components/Loader";
import SongCard from "../components/SongCard";

export const Album = () => {
  const { albumId } = useParams();
  const { playTrack, currentSong, isPlaying } = usePlayer();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time formatter (e.g. 372 seconds -> 6:12)
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      setLoading(true);
      try {
        const details = await spotifyApi.getAlbum(albumId);
        setAlbum(details);

        // Parse album tracks to matching local format schema
        const tracks = (details.tracks?.items || []).map((t) => ({
          songId: t.id,
          title: t.name,
          artist: details.artists?.[0]?.name || "Unknown Artist",
          album: details.name,
          coverImage: details.images?.[0]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
          audioUrl: t.preview_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          duration: Math.floor(t.duration_ms / 1000)
        }));
        setSongs(formattedSongs => tracks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumDetails();
  }, [albumId]);

  if (loading) return <Loader size="lg" />;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-h-[calc(100vh-4rem)] pb-24">
      
      {/* Album Header banner details */}
      <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-6 mb-8 border-b border-white/5 pb-8 mt-2">
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl bg-zinc-800 shrink-0 border border-white/5">
          <img
            src={album.images?.[0]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60"}
            alt={album.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <span className="text-xs font-bold text-brand uppercase tracking-widest mb-1.5">
            Album
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4">
            {album.name}
          </h2>
          <div className="flex items-center space-x-3 text-xs text-zinc-400 font-semibold">
            <span>{album.artists?.[0]?.name}</span>
            <span>&bull;</span>
            <span>{album.release_date?.split("-")[0]}</span>
            <span>&bull;</span>
            <span>{songs.length} tracks</span>
          </div>
        </div>

        {songs.length > 0 && (
          <button
            onClick={() => playTrack(songs[0], songs)}
            className="w-12 h-12 bg-brand hover:scale-105 active:scale-95 rounded-full flex items-center justify-center text-black shadow-xl transition-all font-bold"
            title="Play Album"
            id="play-album-tracks-btn"
          >
            <FiPlay size={16} className="ml-0.5" />
          </button>
        )}
      </div>

      {/* Tracks listing table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs font-bold text-zinc-500 uppercase px-4">
          <div className="flex items-center space-x-4">
            <span className="w-4 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="flex items-center space-x-8">
            <FiClock size={14} />
            <span className="w-12 text-center">Play</span>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          {songs.map((song, index) => {
            const isCurrent = currentSong?.songId === song.songId;
            const isCurrentlyPlaying = isCurrent && isPlaying;
            return (
              <div
                key={song.songId}
                onClick={() => playTrack(song, songs)}
                className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer select-none ${
                  isCurrent ? "bg-brand/5 border border-brand/20" : "hover:bg-zinc-900/60 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <span className={`text-xs font-bold w-4 text-center ${isCurrent ? "text-brand" : "text-zinc-500"}`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isCurrent ? "text-brand" : "text-white"}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-8 text-xs font-semibold text-zinc-400">
                  <span>{formatDuration(song.duration)}</span>
                  
                  {/* Reusable Song card wrapper */}
                  <div className="w-12 h-12 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <SongCard song={song} queueList={songs} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Album;
