// src/pages/Artist.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiUsers, FiPlay } from "react-icons/fi";
import { spotifyApi } from "../services/spotifyApi";
import { usePlayer } from "../hooks/usePlayer";
import { Loader } from "../components/Loader";
import SongCard from "../components/SongCard";
import AlbumCard from "../components/AlbumCard";
import ArtistCard from "../components/ArtistCard";

export const Artist = () => {
  const { artistId } = useParams();
  const { playTrack } = usePlayer();

  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      setLoading(true);
      try {
        // Fetch details from Spotify API service (fallback simulation runs automatically)
        const info = await spotifyApi.getArtist(artistId);
        setArtist(info);

        const tracks = await spotifyApi.getArtistTopTracks(artistId);
        // Map track payload schemas
        const formatted = tracks.map((t) => ({
          songId: t.id,
          title: t.name,
          artist: info.name,
          album: t.album?.name || "Single",
          coverImage: t.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60",
          audioUrl: t.preview_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          duration: Math.floor(t.duration_ms / 1000)
        }));
        setTopTracks(formatted);

        const artistAlbums = await spotifyApi.getArtistAlbums(artistId);
        setAlbums(artistAlbums);

        const related = await spotifyApi.getRelatedArtists(artistId);
        setRelatedArtists(related);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistDetails();
  }, [artistId]);

  if (loading) return <Loader size="lg" />;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-h-[calc(100vh-4rem)] pb-24">
      
      {/* Huge Artist Banner Header */}
      <div className="relative h-60 rounded-3xl overflow-hidden mb-8 shadow-xl flex items-end p-8 border border-white/5 mt-2 bg-gradient-to-t from-zinc-950 to-zinc-900">
        {artist.images?.[0]?.url && (
          <img
            src={artist.images[0].url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[1px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end">
          <span className="text-xs font-bold text-brand uppercase tracking-widest mb-1.5 flex items-center">
            <FiUsers className="mr-1.5" /> Verified Artist
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-3">
            {artist.name}
          </h2>
          <div className="flex items-center space-x-3 text-xs text-zinc-400 font-semibold">
            {artist.followers && (
              <span>{artist.followers.total.toLocaleString()} followers</span>
            )}
            {artist.genres && artist.genres.length > 0 && (
              <>
                <span>&bull;</span>
                <span className="capitalize">{artist.genres.slice(0, 2).join(", ")}</span>
              </>
            )}
          </div>
        </div>

        {topTracks.length > 0 && (
          <button
            onClick={() => playTrack(topTracks[0], topTracks)}
            className="absolute bottom-6 right-8 w-14 h-14 bg-brand text-black hover:scale-105 active:scale-95 rounded-full flex items-center justify-center shadow-xl transition-all"
            title="Play Top Tracks"
            id="play-artist-tracks-btn"
          >
            <FiPlay className="fill-black text-lg ml-0.5" />
          </button>
        )}
      </div>

      <div className="space-y-10">
        {/* Popular Songs */}
        {topTracks.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-wide">Popular Songs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {topTracks.map((song) => (
                <SongCard key={song.songId} song={song} queueList={topTracks} />
              ))}
            </div>
          </div>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-wide">Albums</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        )}

        {/* Related Artists */}
        {relatedArtists.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-wide">Fans Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedArtists.map((a) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artist;
