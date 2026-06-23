// src/components/Loader.jsx
import React from "react";

// Standard Ring Loader
export const Loader = ({ size = "md", color = "brand" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4"
  };

  const colorClasses = {
    brand: "border-brand border-t-transparent",
    white: "border-white border-t-transparent",
    dark: "border-dark-text border-t-transparent"
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.brand} rounded-full animate-spin`}
      />
    </div>
  );
};

// Shimmering Card Skeleton (e.g. for songs, albums)
export const CardSkeleton = () => {
  return (
    <div className="glass-card p-4 rounded-xl flex flex-col space-y-3 w-full animate-pulse shimmer">
      <div className="aspect-square w-full bg-zinc-800 rounded-lg" />
      <div className="h-4 bg-zinc-800 rounded w-3/4" />
      <div className="h-3 bg-zinc-800 rounded w-1/2" />
    </div>
  );
};

// Shimmering List Row Skeleton (e.g. for tracks list)
export const TrackRowSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 py-2 px-4 rounded-lg w-full animate-pulse shimmer">
      <div className="w-6 bg-zinc-800 h-4 rounded" />
      <div className="w-12 h-12 bg-zinc-800 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-1/3" />
        <div className="h-3 bg-zinc-800 rounded w-1/4" />
      </div>
      <div className="w-20 h-4 bg-zinc-800 rounded" />
      <div className="w-12 h-4 bg-zinc-800 rounded" />
    </div>
  );
};

// Main Grid Skeleton
export const GridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

// Main List Skeleton
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex flex-col space-y-2 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <TrackRowSkeleton key={index} />
      ))}
    </div>
  );
};

export default Loader;
