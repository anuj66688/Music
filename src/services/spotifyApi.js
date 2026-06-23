// src/services/spotifyApi.js

// Retrieve Spotify keys from local storage settings if provided, or from env variables
let clientCreds = {
  clientId: localStorage.getItem("vibeflow_spotify_client_id") || import.meta.env.VITE_SPOTIFY_CLIENT_ID || "",
  clientSecret: localStorage.getItem("vibeflow_spotify_client_secret") || import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ""
};

let accessToken = localStorage.getItem("vibeflow_spotify_access_token") || "";
let tokenExpiry = localStorage.getItem("vibeflow_spotify_token_expiry") || 0;

// Helper to check if credentials are set
export const hasSpotifyCredentials = () => {
  return !!(clientCreds.clientId && clientCreds.clientSecret);
};

// Update credentials dynamically from settings/profile
export const setSpotifyCredentials = (clientId, clientSecret) => {
  localStorage.setItem("vibeflow_spotify_client_id", clientId);
  localStorage.setItem("vibeflow_spotify_client_secret", clientSecret);
  clientCreds = { clientId, clientSecret };
  // Clear old token
  accessToken = "";
  tokenExpiry = 0;
  localStorage.removeItem("vibeflow_spotify_access_token");
  localStorage.removeItem("vibeflow_spotify_token_expiry");
};

// Fetch access token using client credentials flow
const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!hasSpotifyCredentials()) {
    throw new Error("No Spotify Credentials Configured. Running in Simulation Mode.");
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(clientCreds.clientId + ":" + clientCreds.clientSecret)
      },
      body: "grant_type=client_credentials"
    });

    if (!response.ok) throw new Error("Failed to authenticate with Spotify API");

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Expire 1 minute early

    localStorage.setItem("vibeflow_spotify_access_token", accessToken);
    localStorage.setItem("vibeflow_spotify_token_expiry", tokenExpiry);

    return accessToken;
  } catch (error) {
    console.error("Spotify Authentication Error:", error);
    throw error;
  }
};

// API Fetch Helper
const spotifyFetch = async (endpoint) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      // Clear token and retry once
      accessToken = "";
      localStorage.removeItem("vibeflow_spotify_access_token");
      return spotifyFetch(endpoint);
    }

    if (!response.ok) throw new Error(`Spotify API error: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    console.warn(`Spotify API call failed (${endpoint}), returning simulated fallback data.`, err.message);
    return getSimulatedFallback(endpoint);
  }
};

// ==========================================
// SIMULATED FALLBACK ENGINE
// ==========================================

const mockSongs = [
  {
    songId: "mock-1",
    title: "Midnight Drive",
    artist: "Neon Skyline",
    album: "Retrowave City",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 372,
    plays: 15420
  },
  {
    songId: "mock-2",
    title: "Summer Breeze",
    artist: "Acoustic Dreams",
    album: "Sunkissed",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 425,
    plays: 98100
  },
  {
    songId: "mock-3",
    title: "Echoes of Silence",
    artist: "Ether",
    album: "Vast Emptiness",
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 344,
    plays: 43222
  },
  {
    songId: "mock-4",
    title: "Pulse Racer",
    artist: "HyperDrive",
    album: "Velocity",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 302,
    plays: 87612
  },
  {
    songId: "mock-5",
    title: "Rainy Cafe",
    artist: "Lo-Fi Lullabies",
    album: "Cosy Afternoons",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: 362,
    plays: 245190
  },
  {
    songId: "mock-6",
    title: "Stardust",
    artist: "Galaxy Voyager",
    album: "Cosmic Odyssey",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: 336,
    plays: 67102
  },
  {
    songId: "mock-7",
    title: "Deep Cyber",
    artist: "Tokyo Synth",
    album: "Neon Grid",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    duration: 318,
    plays: 32098
  },
  {
    songId: "mock-8",
    title: "Serenity Flow",
    artist: "Zen Garden",
    album: "Peaceful Mind",
    coverImage: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=60",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 322,
    plays: 19800
  }
];

const mockArtists = [
  { id: "art-1", name: "Neon Skyline", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60", followers: 45209, genres: ["Synthwave", "Retrowave"] },
  { id: "art-2", name: "Acoustic Dreams", image: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=600&auto=format&fit=crop&q=60", followers: 89012, genres: ["Acoustic", "Folk"] },
  { id: "art-3", name: "Lo-Fi Lullabies", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=60", followers: 230491, genres: ["Lo-Fi", "Chillhop"] },
  { id: "art-4", name: "Tokyo Synth", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&auto=format&fit=crop&q=60", followers: 12049, genres: ["Synthwave", "Electro"] }
];

const mockAlbums = [
  { id: "alb-1", title: "Retrowave City", artist: "Neon Skyline", coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60", tracks: ["mock-1", "mock-7"], releaseDate: "2024-03-12" },
  { id: "alb-2", title: "Cosy Afternoons", artist: "Lo-Fi Lullabies", coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60", tracks: ["mock-5"], releaseDate: "2023-11-20" },
  { id: "alb-3", title: "Velocity", artist: "HyperDrive", coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=60", tracks: ["mock-4"], releaseDate: "2025-01-05" }
];

const getSimulatedFallback = (endpoint) => {
  // Parsing simple endpoints
  if (endpoint.startsWith("search")) {
    const urlParams = new URLSearchParams(endpoint.split("?")[1]);
    const query = (urlParams.get("q") || "").toLowerCase();
    const types = (urlParams.get("type") || "track,artist,album").split(",");

    const filteredTracks = mockSongs.filter(s =>
      s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query) || s.album.toLowerCase().includes(query)
    );
    const filteredArtists = mockArtists.filter(a => a.name.toLowerCase().includes(query));
    const filteredAlbums = mockAlbums.filter(a => a.title.toLowerCase().includes(query) || a.artist.toLowerCase().includes(query));

    return {
      tracks: { items: filteredTracks.map(t => formatMockTrack(t)) },
      artists: { items: filteredArtists.map(a => formatMockArtist(a)) },
      albums: { items: filteredAlbums.map(al => formatMockAlbum(al)) },
      playlists: {
        items: [
          {
            id: "featured-1",
            name: "Chill Vibe Flow",
            description: "Perfect blend of relaxing electronic and instrumental tunes.",
            images: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60" }],
            owner: { display_name: "VibeFlow" },
            tracks: { total: 3 }
          }
        ]
      }
    };
  }

  if (endpoint.startsWith("browse/categories")) {
    return {
      categories: {
        items: [
          { id: "chill", name: "Chill", icons: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60" }] },
          { id: "focus", name: "Focus", icons: [{ url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=60" }] },
          { id: "workout", name: "Workout", icons: [{ url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=60" }] },
          { id: "electronic", name: "Electronic", icons: [{ url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60" }] }
        ]
      }
    };
  }

  if (endpoint.startsWith("browse/featured-playlists")) {
    return {
      playlists: {
        items: [
          { id: "featured-1", name: "Chill Vibe Flow", description: "Vibe flow essential mix", images: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60" }] },
          { id: "featured-2", name: "Workout Boost", description: "Get moving with electronics", images: [{ url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=60" }] },
          { id: "featured-3", name: "Late Night Focus", description: "Relaxing visual programming music", images: [{ url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=60" }] }
        ]
      }
    };
  }

  if (endpoint.startsWith("browse/new-releases")) {
    return {
      albums: {
        items: mockAlbums.map(al => formatMockAlbum(al))
      }
    };
  }

  if (endpoint.startsWith("artists/")) {
    const id = endpoint.split("/")[1];
    const artist = mockArtists.find(a => a.id === id) || mockArtists[0];
    if (endpoint.endsWith("/top-tracks")) {
      return {
        tracks: mockSongs.filter(s => s.artist === artist.name).map(t => formatMockTrack(t))
      };
    }
    if (endpoint.endsWith("/albums")) {
      return {
        items: mockAlbums.filter(al => al.artist === artist.name).map(al => formatMockAlbum(al))
      };
    }
    if (endpoint.endsWith("/related-artists")) {
      return {
        artists: mockArtists.filter(a => a.id !== id).map(a => formatMockArtist(a))
      };
    }
    return formatMockArtist(artist);
  }

  if (endpoint.startsWith("albums/")) {
    const id = endpoint.split("/")[1];
    const album = mockAlbums.find(al => al.id === id) || mockAlbums[0];
    const albumTracks = mockSongs.filter(s => album.tracks.includes(s.songId));
    return {
      ...formatMockAlbum(album),
      tracks: {
        items: albumTracks.map(t => formatMockTrack(t))
      }
    };
  }

  // recommendations fallback
  return {
    tracks: mockSongs.slice(0, 5).map(t => formatMockTrack(t))
  };
};

// Formatting utilities to map our simple objects to Spotify-like contract shapes
const formatMockTrack = (s) => ({
  id: s.songId,
  name: s.title,
  duration_ms: s.duration * 1000,
  preview_url: s.audioUrl,
  album: {
    name: s.album,
    images: [{ url: s.coverImage }]
  },
  artists: [{ name: s.artist, id: "art-1" }]
});

const formatMockArtist = (a) => ({
  id: a.id,
  name: a.name,
  images: [{ url: a.image }],
  followers: { total: a.followers },
  genres: a.genres
});

const formatMockAlbum = (al) => ({
  id: al.id,
  name: al.title,
  album_type: "album",
  release_date: al.releaseDate,
  images: [{ url: al.coverImage }],
  artists: [{ name: al.artist }]
});

// ==========================================
// EXPORTED SERVICES
// ==========================================

export const spotifyApi = {
  // Search tracks, artists, playlists, albums
  async search(query, types = ["track", "artist", "album"]) {
    const queryTypes = types.join(",");
    const res = await spotifyFetch(`search?q=${encodeURIComponent(query)}&type=${queryTypes}&limit=12`);
    return res;
  },

  // Get artist info
  async getArtist(artistId) {
    return await spotifyFetch(`artists/${artistId}`);
  },

  // Get artist's top tracks
  async getArtistTopTracks(artistId) {
    const res = await spotifyFetch(`artists/${artistId}/top-tracks?market=US`);
    return res.tracks || [];
  },

  // Get artist's albums
  async getArtistAlbums(artistId) {
    const res = await spotifyFetch(`artists/${artistId}/albums?limit=6`);
    return res.items || [];
  },

  // Get related artists
  async getRelatedArtists(artistId) {
    const res = await spotifyFetch(`artists/${artistId}/related-artists`);
    return res.artists || [];
  },

  // Get album details
  async getAlbum(albumId) {
    return await spotifyFetch(`albums/${albumId}`);
  },

  // Get featured playlists
  async getFeaturedPlaylists() {
    const res = await spotifyFetch("browse/featured-playlists?limit=8");
    return res.playlists?.items || [];
  },

  // Get new releases
  async getNewReleases() {
    const res = await spotifyFetch("browse/new-releases?limit=8");
    return res.albums?.items || [];
  },

  // Get category list
  async getCategories() {
    const res = await spotifyFetch("browse/categories?limit=8");
    return res.categories?.items || [];
  },

  // Get music recommendations based on tracks/genres
  async getRecommendations(seedTracks = "") {
    const res = await spotifyFetch(`recommendations?seed_tracks=${seedTracks}&limit=8`);
    return res.tracks || [];
  }
};
export default spotifyApi;
