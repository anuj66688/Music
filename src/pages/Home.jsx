// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { dbService } from "../services/firebase";
import { spotifyApi } from "../services/spotifyApi";
import { Loader, GridSkeleton } from "../components/Loader";
import SongCard from "../components/SongCard";
import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";

export const Home = () => {
  const { user } = useAuth();
  
  // Dashboard lists state
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [recommendedAlbums, setRecommendedAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compute standard greeting based on current local hours
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Retrieve songs from database
        const songs = await dbService.getSongs();
        setTrendingSongs(songs.slice(0, 6));

        // Retrieve mock categories and artists from Spotify API simulation
        const releasesRes = await spotifyApi.getNewReleases();
        setRecommendedAlbums(releasesRes.slice(0, 6));

        // Simple mock search query to populate standard artists list
        const artistsRes = await spotifyApi.search("neon", ["artist"]);
        const artists = artistsRes.artists?.items || [];
        setPopularArtists(artists.slice(0, 6));

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Filter recently played songs
  const recentlyPlayed = user?.recentlyPlayed || [];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-h-[calc(100vh-4rem)]">
      
      {/* Dynamic greeting header banner */}
      <div className="mb-8 mt-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {getGreeting()}, {user?.name || "Guest Flow"}
        </h2>
        <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
          Welcome to VibeFlow. Explore trending mixes, browse lists or spin up your playlists.
        </p>
      </div>

      {loading ? (
        <div className="space-y-12">
          <div>
            <div className="h-6 bg-zinc-800 rounded w-1/4 mb-4 animate-pulse" />
            <GridSkeleton count={6} />
          </div>
          <div>
            <div className="h-6 bg-zinc-800 rounded w-1/4 mb-4 animate-pulse" />
            <GridSkeleton count={6} />
          </div>
        </div>
      ) : (
        <div className="space-y-10 pb-16">
          
          {/* Recently Played Section */}
          {recentlyPlayed.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white tracking-wide mb-4">
                Recently Played
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {recentlyPlayed.map((song, idx) => (
                  <SongCard
                    key={song.songId + "-recent-" + idx}
                    song={song}
                    queueList={recentlyPlayed}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trending Songs Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white tracking-wide">
                Trending on VibeFlow
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {trendingSongs.map((song) => (
                <SongCard
                  key={song.songId}
                  song={song}
                  queueList={trendingSongs}
                />
              ))}
            </div>
          </div>

          {/* Recommended Albums Section */}
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide mb-4">
              Popular Releases
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recommendedAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>

          {/* Popular Artists Section */}
          {popularArtists.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white tracking-wide mb-4">
                Trending Artists
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {popularArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Home;
