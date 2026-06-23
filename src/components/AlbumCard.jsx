// src/components/AlbumCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";

export const AlbumCard = ({ album }) => {
  return (
    <Link
      to={`/album/${album.id}`}
      className="glass-card p-4 rounded-xl flex flex-col cursor-pointer group relative select-none"
    >
      {/* Cover image wrapper */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-4 shadow-md bg-zinc-800">
        <img
          src={album.coverImage || album.images?.[0]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60"}
          alt={album.title || album.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover play display */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="w-10 h-10 bg-brand text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
            <FaPlay className="ml-0.5 text-sm" />
          </div>
        </div>
      </div>

      {/* Album Info */}
      <div className="flex flex-col min-w-0">
        <h4 className="font-semibold text-base text-white truncate group-hover:text-brand transition-colors">
          {album.title || album.name}
        </h4>
        <p className="text-zinc-400 text-sm truncate mt-0.5">
          {album.artist || album.artists?.[0]?.name}
        </p>
      </div>
    </Link>
  );
};

export default AlbumCard;
