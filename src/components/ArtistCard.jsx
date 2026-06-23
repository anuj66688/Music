// src/components/ArtistCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export const ArtistCard = ({ artist }) => {
  return (
    <Link
      to={`/artist/${artist.id || artist.name}`}
      className="glass-card p-4 rounded-xl flex flex-col items-center text-center cursor-pointer group select-none"
    >
      {/* Circle Image Wrapper */}
      <div className="relative w-3/4 aspect-square rounded-full overflow-hidden mb-4 shadow-md bg-zinc-800 border border-white/5">
        <img
          src={artist.image || "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=600&auto=format&fit=crop&q=60"}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Artist Information */}
      <div className="flex flex-col items-center w-full">
        <h4 className="font-semibold text-base text-white truncate max-w-full group-hover:text-brand transition-colors">
          {artist.name}
        </h4>
        <p className="text-zinc-400 text-xs mt-1">Artist</p>
        {artist.followers && (
          <p className="text-zinc-500 text-[10px] mt-0.5">
            {artist.followers.toLocaleString()} followers
          </p>
        )}
      </div>
    </Link>
  );
};

export default ArtistCard;
