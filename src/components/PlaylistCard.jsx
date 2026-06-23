// src/components/PlaylistCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";

export const PlaylistCard = ({ playlist }) => {
  const songsCount = playlist.songs?.length || 0;

  return (
    <Link
      to={`/playlist/${playlist.playlistId}`}
      className="glass-card p-4 rounded-xl flex flex-col cursor-pointer group relative select-none"
    >
      {/* Cover image */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-4 shadow-md bg-zinc-800">
        <img
          src={playlist.coverImage || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60"}
          alt={playlist.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover play button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="w-10 h-10 bg-brand text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
            <FaPlay className="ml-0.5 text-sm" />
          </div>
        </div>
      </div>

      {/* Playlist Meta */}
      <div className="flex flex-col min-w-0">
        <h4 className="font-semibold text-base text-white truncate group-hover:text-brand transition-colors">
          {playlist.title}
        </h4>
        <p className="text-zinc-400 text-sm truncate mt-0.5">
          {songsCount} {songsCount === 1 ? "song" : "songs"}
        </p>
      </div>
    </Link>
  );
};

export default PlaylistCard;
