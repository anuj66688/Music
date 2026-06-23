// src/services/spotifyApi.js

// Default JioSaavn API Server URL (local Flask server cloned in jio-saavn-api)
const API_BASE_URL = import.meta.env.VITE_JIOSAAVN_API_URL || "http://localhost:5100";

// Standard mock songs for fallback
const mockSongs = [
  {
    songId: "mock-1",
    title: "Midnight Drive",
    artist: "Neon Skyline",
    album: "Retrowave City",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 372
  },
  {
    songId: "mock-2",
    title: "Summer Breeze",
    artist: "Acoustic Dreams",
    album: "Sunkissed",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 425
  },
  {
    songId: "mock-3",
    title: "Echoes of Silence",
    artist: "Ether",
    album: "Vast Emptiness",
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 344
  },
  {
    songId: "mock-4",
    title: "Pulse Racer",
    artist: "HyperDrive",
    album: "Velocity",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 302
  },
  {
    songId: "mock-5",
    title: "Rainy Cafe",
    artist: "Lo-Fi Lullabies",
    album: "Cosy Afternoons",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: 362
  }
];

export const spotifyApi = {
  // Query JioSaavn search API for full tracks
  async search(query, types = ["track"]) {
    try {
      const response = await fetch(`${API_BASE_URL}/song/?query=${encodeURIComponent(query)}&lyrics=true`);
      if (!response.ok) throw new Error("JioSaavn server connection issue");
      const data = await response.json();

      if (data && Array.isArray(data)) {
        // Map JioSaavn results to local song formats containing playable direct links
        const formattedTracks = data.map((s) => ({
          songId: s.id,
          title: s.song,
          artist: s.singers || "Various Artists",
          album: s.album || "Single",
          coverImage: s.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60",
          audioUrl: s.media_url,
          duration: parseInt(s.duration, 10) || 180,
          lyrics: s.lyrics
        }));

        return {
          tracks: { items: formattedTracks },
          artists: {
            items: formattedTracks.map((t) => ({
              id: t.artist.replace(/\s+/g, "-").toLowerCase(),
              name: t.artist,
              image: t.coverImage,
              followers: 12049,
              genres: ["Bollywood", "Pop"]
            }))
          },
          albums: {
            items: formattedTracks.map((t) => ({
              id: t.album.replace(/\s+/g, "-").toLowerCase(),
              name: t.album,
              coverImage: t.coverImage,
              artist: t.artist
            }))
          },
          playlists: { items: [] }
        };
      }
      throw new Error("Invalid payload format received");
    } catch (err) {
      console.warn("Failed to fetch from JioSaavn API local server, falling back to mock search.", err.message);
      
      // Filter mock songs for fallback query matches
      const filtered = mockSongs.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
      );
      
      const activeList = filtered.length > 0 ? filtered : mockSongs;

      return {
        tracks: { items: activeList },
        artists: {
          items: [
            { id: "art-1", name: "Neon Skyline", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60", followers: 45209 }
          ]
        },
        albums: {
          items: [
            { id: "alb-1", name: "Retrowave City", coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60", artist: "Neon Skyline" }
          ]
        },
        playlists: { items: [] }
      };
    }
  },

  // Get artist info
  async getArtist(artistId) {
    return {
      id: artistId,
      name: artistId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      images: [{ url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60" }],
      followers: { total: 45209 },
      genres: ["Indie", "Pop"]
    };
  },

  // Get artist's top tracks
  async getArtistTopTracks(artistId) {
    return mockSongs.slice(0, 4);
  },

  // Get artist's albums
  async getArtistAlbums(artistId) {
    return [
      { id: "alb-1", name: "Retrowave City", coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60", artist: "Neon Skyline" }
    ];
  },

  // Get related artists
  async getRelatedArtists(artistId) {
    return [];
  },

  // Get album details
  async getAlbum(albumId) {
    return {
      id: albumId,
      name: "Retrowave City",
      images: [{ url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60" }],
      artists: [{ name: "Neon Skyline" }],
      release_date: "2024-03-12",
      tracks: { items: mockSongs.slice(0, 2) }
    };
  },

  // Get featured playlists
  async getFeaturedPlaylists() {
    return [];
  },

  // Get new releases
  async getNewReleases() {
    return [
      {
        id: "alb-1",
        name: "Retrowave City",
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
        artists: [{ name: "Neon Skyline" }]
      }
    ];
  },

  // Get category list
  async getCategories() {
    return [
      { id: "bollywood", name: "Bollywood Hits", icons: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60" }] },
      { id: "pop", name: "Pop Music", icons: [{ url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=60" }] },
      { id: "electronic", name: "Electronic", icons: [{ url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60" }] }
    ];
  },

  // Recommendations
  async getRecommendations() {
    return mockSongs.slice(0, 4);
  }
};
export const hasSpotifyCredentials = () => {
  return false;
};

export const setSpotifyCredentials = () => {
  // Mocked for compatibility
};

export default spotifyApi;

