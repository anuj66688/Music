// src/pages/Search.jsx
import React, { useState, useEffect } from "react";
import { SearchBar } from "../components/SearchBar";
import { spotifyApi } from "../services/spotifyApi";
import { Loader, GridSkeleton } from "../components/Loader";
import SongCard from "../components/SongCard";
import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";
import PlaylistCard from "../components/PlaylistCard";

export const Search = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load generic Spotify browsing categories initially
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await spotifyApi.getCategories();
        setCategories(items);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  // Live queries search trigger
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await spotifyApi.search(query);
        
        // Map search results tracks to local song format contracts
        const formattedTracks = (data.tracks?.items || []).map((t) => ({
          songId: t.id,
          title: t.name,
          artist: t.artists?.[0]?.name || "Unknown Artist",
          album: t.album?.name || "Single",
          coverImage: t.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60",
          audioUrl: t.preview_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          duration: Math.floor(t.duration_ms / 1000)
        }));

        setResults({
          tracks: formattedTracks,
          artists: data.artists?.items || [],
          albums: data.albums?.items || [],
          playlists: data.playlists?.items || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debouncing window

    return () => clearTimeout(timer);
  }, [query]);

  const handleCategoryClick = (categoryName) => {
    setQuery(categoryName);
  };

  // Color lists for browse categories tiles
  const tileGradients = [
    "from-pink-500 to-rose-600",
    "from-violet-600 to-indigo-700",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-red-500 to-purple-600",
    "from-fuchsia-600 to-pink-700",
    "from-green-500 to-emerald-600"
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-h-[calc(100vh-4rem)] pb-24">
      
      {/* Search Field Header */}
      <div className="mb-6 flex flex-col space-y-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Search</h2>
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          placeholder="Artists, tracks, albums, or playlists"
        />
      </div>

      {/* Tabs Filter Bar (Only visible if searching) */}
      {query && (
        <div className="flex space-x-2 border-b border-white/5 pb-3 mb-6">
          {["all", "songs", "artists", "albums", "playlists"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                activeTab === tab
                  ? "bg-white text-black font-bold"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader size="lg" />
      ) : results ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Songs results */}
          {(activeTab === "all" || activeTab === "songs") && results.tracks?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Tracks</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {results.tracks.map((song) => (
                  <SongCard key={song.songId} song={song} queueList={results.tracks} />
                ))}
              </div>
            </div>
          )}

          {/* Artists results */}
          {(activeTab === "all" || activeTab === "artists") && results.artists?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Artists</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* Albums results */}
          {(activeTab === "all" || activeTab === "albums") && results.albums?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Albums</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {results.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}

          {/* Playlists results */}
          {(activeTab === "all" || activeTab === "playlists") && results.playlists?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Featured Playlists</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {results.playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={{
                      playlistId: playlist.id,
                      title: playlist.name,
                      coverImage: playlist.images?.[0]?.url,
                      songs: Array.from({ length: playlist.tracks?.total || 0 })
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty search results state */}
          {results.tracks?.length === 0 &&
            results.artists?.length === 0 &&
            results.albums?.length === 0 && (
              <p className="text-zinc-500 text-center py-16 text-sm">
                No matching results found. Try adjusting keywords.
              </p>
            )}

        </div>
      ) : (
        /* Empty Input: Display browse categories grids */
        <div className="animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
            Browse All Categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const gradient = tileGradients[index % tileGradients.length];
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`h-36 rounded-xl bg-gradient-to-br ${gradient} p-4 relative overflow-hidden cursor-pointer select-none group shadow-md transition transform hover:scale-[1.02] hover:-translate-y-1`}
                >
                  <span className="text-lg font-extrabold text-white tracking-tight break-words max-w-[120px] block">
                    {category.name}
                  </span>
                  <img
                    src={category.icons?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60"}
                    alt=""
                    className="w-16 h-16 rounded object-cover shadow-lg absolute bottom-2 right-2 rotate-[25deg] translate-x-2 translate-y-2 transition-transform duration-300 group-hover:rotate-[15deg] group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
