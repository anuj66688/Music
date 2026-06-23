// src/services/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile as authUpdateProfile,
  onAuthStateChanged as authOnAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Default Firebase Configuration (can be overwritten by env variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app;
let auth;
let db;
let storage;
let isMock = true;

// Check if valid configuration is provided
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isMock = false;
    console.log("Firebase initialized successfully in production mode.");
  } catch (error) {
    console.warn("Failed to initialize Firebase SDK, falling back to LocalStorage Mock Mode:", error);
    isMock = true;
  }
} else {
  console.log("VibeFlow is running in LocalStorage Simulation Mode (No Firebase keys found in .env).");
}

// ==========================================
// LOCAL STORAGE MOCK DATABASE INITIALIZATION
// ==========================================
const initMockDB = () => {
  if (!localStorage.getItem("vibeflow_users")) {
    localStorage.setItem("vibeflow_users", JSON.stringify({}));
  }
  if (!localStorage.getItem("vibeflow_playlists")) {
    localStorage.setItem("vibeflow_playlists", JSON.stringify({
      "featured-1": {
        playlistId: "featured-1",
        title: "Chill Vibe Flow",
        description: "Perfect blend of relaxing electronic and instrumental tunes.",
        owner: "VibeFlow",
        coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=60",
        songs: ["mock-1", "mock-2", "mock-3"],
        createdAt: new Date().toISOString()
      },
      "featured-2": {
        playlistId: "featured-2",
        title: "Workout Boost",
        description: "High energy tracks to power you through your workout.",
        owner: "VibeFlow",
        coverImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=60",
        songs: ["mock-4", "mock-5", "mock-6"],
        createdAt: new Date().toISOString()
      },
      "featured-3": {
        playlistId: "featured-3",
        title: "Late Night Focus",
        description: "Deep focus beats for code and study.",
        owner: "VibeFlow",
        coverImage: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=60",
        songs: ["mock-7", "mock-8", "mock-1"],
        createdAt: new Date().toISOString()
      }
    }));
  }
  if (!localStorage.getItem("vibeflow_songs")) {
    localStorage.setItem("vibeflow_songs", JSON.stringify({
      "mock-1": {
        songId: "mock-1",
        title: "Midnight Drive",
        artist: "Neon Skyline",
        album: "Retrowave City",
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: 372,
        plays: 15420
      },
      "mock-2": {
        songId: "mock-2",
        title: "Summer Breeze",
        artist: "Acoustic Dreams",
        album: "Sunkissed",
        coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: 425,
        plays: 98100
      },
      "mock-3": {
        songId: "mock-3",
        title: "Echoes of Silence",
        artist: "Ether",
        album: "Vast Emptiness",
        coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: 344,
        plays: 43222
      },
      "mock-4": {
        songId: "mock-4",
        title: "Pulse Racer",
        artist: "HyperDrive",
        album: "Velocity",
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: 302,
        plays: 87612
      },
      "mock-5": {
        songId: "mock-5",
        title: "Rainy Cafe",
        artist: "Lo-Fi Lullabies",
        album: "Cosy Afternoons",
        coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        duration: 362,
        plays: 245190
      },
      "mock-6": {
        songId: "mock-6",
        title: "Stardust",
        artist: "Galaxy Voyager",
        album: "Cosmic Odyssey",
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        duration: 336,
        plays: 67102
      },
      "mock-7": {
        songId: "mock-7",
        title: "Deep Cyber",
        artist: "Tokyo Synth",
        album: "Neon Grid",
        coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        duration: 318,
        plays: 32098
      },
      "mock-8": {
        songId: "mock-8",
        title: "Serenity Flow",
        artist: "Zen Garden",
        album: "Peaceful Mind",
        coverImage: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        duration: 322,
        plays: 19800
      }
    }));
  }
};

initMockDB();

export const isFirebaseMock = () => isMock;

// ==========================================
// AUTHENTICATION APIs
// ==========================================
export const mockAuthService = {
  currentUser: null,
  listeners: [],
  onAuthStateChanged(callback) {
    if (!isMock) {
      return authOnAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch additional profile fields from users collection
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              this.currentUser = { ...userDoc.data(), uid: firebaseUser.uid };
            } else {
              // Create user document if it doesn't exist
              const userData = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
                email: firebaseUser.email,
                avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.email)}`,
                createdAt: new Date().toISOString(),
                likedSongs: [],
                playlists: [],
                recentlyPlayed: []
              };
              await setDoc(doc(db, "users", firebaseUser.uid), userData);
              this.currentUser = userData;
            }
          } catch (e) {
            console.warn("Firestore user fetch failed, falling back to basic auth info", e);
            this.currentUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email,
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL || ""
            };
          }
        } else {
          this.currentUser = null;
        }
        callback(this.currentUser);
      });
    }

    // Local Storage Fallback
    this.listeners.push(callback);
    const savedUser = localStorage.getItem("vibeflow_current_user");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },

  async signup(email, password, name) {
    if (!isMock) {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userObj = userCred.user;
      
      // Update display name on auth profile
      await authUpdateProfile(userObj, {
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
      });

      // Save user to firestore collection
      const userData = {
        uid: userObj.uid,
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
        likedSongs: [],
        playlists: [],
        recentlyPlayed: []
      };
      await setDoc(doc(db, "users", userObj.uid), userData);
      this.currentUser = userData;
      return userData;
    }

    // Local Storage Mock
    const users = JSON.parse(localStorage.getItem("vibeflow_users"));
    if (users[email]) {
      throw new Error("Email already in use.");
    }
    const newUser = {
      uid: "mock-uid-" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      likedSongs: [],
      playlists: [],
      recentlyPlayed: []
    };
    users[newUser.uid] = newUser;
    users[email] = newUser.uid;
    localStorage.setItem("vibeflow_users", JSON.stringify(users));
    this.currentUser = newUser;
    localStorage.setItem("vibeflow_current_user", JSON.stringify(newUser));
    this.triggerChange();
    return newUser;
  },

  async login(email, password) {
    if (!isMock) {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      // Data sync handled inside onAuthStateChanged
      return userCred.user;
    }

    // Local Storage Mock
    const users = JSON.parse(localStorage.getItem("vibeflow_users"));
    const uid = users[email];
    if (!uid || !users[uid]) {
      throw new Error("User not found or invalid password.");
    }
    const user = users[uid];
    this.currentUser = user;
    localStorage.setItem("vibeflow_current_user", JSON.stringify(user));
    this.triggerChange();
    return user;
  },

  async googleLogin() {
    if (!isMock) {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      return userCred.user;
    }
    return this.signup("googleuser@gmail.com", "googlepass", "Google Flow User");
  },

  async logout() {
    if (!isMock) {
      await signOut(auth);
      this.currentUser = null;
      return;
    }
    this.currentUser = null;
    localStorage.removeItem("vibeflow_current_user");
    this.triggerChange();
  },

  async resetPassword(email) {
    if (!isMock) {
      await sendPasswordResetEmail(auth, email);
      return;
    }
    console.log(`Password reset email sent to ${email} (simulated)`);
  },

  async updateProfile(updates) {
    if (!this.currentUser) return;
    
    if (!isMock) {
      // Update Firebase Auth if required
      if (updates.name && auth.currentUser) {
        await authUpdateProfile(auth.currentUser, { displayName: updates.name });
      }
      if (updates.avatar && auth.currentUser) {
        await authUpdateProfile(auth.currentUser, { photoURL: updates.avatar });
      }

      // Update Firestore document
      const userRef = doc(db, "users", this.currentUser.uid);
      await updateDoc(userRef, updates);
      
      this.currentUser = { ...this.currentUser, ...updates };
      return this.currentUser;
    }

    // Local Storage Mock
    const users = JSON.parse(localStorage.getItem("vibeflow_users"));
    const updatedUser = { ...this.currentUser, ...updates };
    users[updatedUser.uid] = updatedUser;
    localStorage.setItem("vibeflow_users", JSON.stringify(users));
    this.currentUser = updatedUser;
    localStorage.setItem("vibeflow_current_user", JSON.stringify(updatedUser));
    this.triggerChange();
    return updatedUser;
  },

  triggerChange() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }
};

// ==========================================
// FIRESTORE COLLECTIONS APIs
// ==========================================
export const dbService = {
  // --- Songs ---
  async getSongs() {
    if (!isMock) {
      try {
        const querySnapshot = await getDocs(collection(db, "songs"));
        const songs = [];
        querySnapshot.forEach((doc) => {
          songs.push({ ...doc.data(), songId: doc.id });
        });
        // If firestore is empty, upload mock songs automatically to bootstrap DB!
        if (songs.length === 0) {
          const mocks = Object.values(JSON.parse(localStorage.getItem("vibeflow_songs")));
          for (const s of mocks) {
            await setDoc(doc(db, "songs", s.songId), s);
            songs.push(s);
          }
        }
        return songs;
      } catch (err) {
        console.warn("Firestore getSongs error, falling back to LocalStorage mock", err);
      }
    }
    return Object.values(JSON.parse(localStorage.getItem("vibeflow_songs")));
  },

  async uploadSong(songData) {
    if (!isMock) {
      const id = "s-" + Date.now();
      const songRef = doc(db, "songs", id);
      const newSong = {
        songId: id,
        plays: 0,
        ...songData
      };
      await setDoc(songRef, newSong);
      return newSong;
    }

    const songs = JSON.parse(localStorage.getItem("vibeflow_songs"));
    const id = "mock-s-" + Date.now();
    const newSong = {
      songId: id,
      plays: 0,
      ...songData
    };
    songs[id] = newSong;
    localStorage.setItem("vibeflow_songs", JSON.stringify(songs));
    return newSong;
  },

  async deleteSong(songId) {
    if (!isMock) {
      await deleteDoc(doc(db, "songs", songId));
      return;
    }
    const songs = JSON.parse(localStorage.getItem("vibeflow_songs"));
    delete songs[songId];
    localStorage.setItem("vibeflow_songs", JSON.stringify(songs));
  },

  // --- Playlists ---
  async getPlaylists() {
    if (!isMock) {
      try {
        const querySnapshot = await getDocs(collection(db, "playlists"));
        const playlists = [];
        querySnapshot.forEach((doc) => {
          playlists.push({ ...doc.data(), playlistId: doc.id });
        });
        // Seed if empty
        if (playlists.length === 0) {
          const mocks = Object.values(JSON.parse(localStorage.getItem("vibeflow_playlists")));
          for (const p of mocks) {
            await setDoc(doc(db, "playlists", p.playlistId), p);
            playlists.push(p);
          }
        }
        return playlists;
      } catch (err) {
        console.warn("Firestore getPlaylists error", err);
      }
    }
    return Object.values(JSON.parse(localStorage.getItem("vibeflow_playlists")));
  },

  async createPlaylist(title, description, ownerUid, coverImage) {
    const id = "p-" + Date.now();
    const cover = coverImage || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60";
    const newPlaylist = {
      playlistId: id,
      title,
      description: description || "Custom playlist created on VibeFlow.",
      owner: ownerUid || "Guest User",
      coverImage: cover,
      songs: [],
      createdAt: new Date().toISOString()
    };

    if (!isMock) {
      await setDoc(doc(db, "playlists", id), newPlaylist);
      // Link to user profile doc
      const user = mockAuthService.currentUser;
      if (user) {
        await mockAuthService.updateProfile({
          playlists: arrayUnion(id)
        });
      }
      return newPlaylist;
    }

    const playlists = JSON.parse(localStorage.getItem("vibeflow_playlists"));
    playlists[id] = newPlaylist;
    localStorage.setItem("vibeflow_playlists", JSON.stringify(playlists));

    const user = mockAuthService.currentUser;
    if (user) {
      const playlistsList = user.playlists || [];
      await mockAuthService.updateProfile({ playlists: [...playlistsList, id] });
    }
    return newPlaylist;
  },

  async updatePlaylist(playlistId, updates) {
    if (!isMock) {
      await updateDoc(doc(db, "playlists", playlistId), updates);
      return { playlistId, ...updates };
    }
    const playlists = JSON.parse(localStorage.getItem("vibeflow_playlists"));
    if (!playlists[playlistId]) throw new Error("Playlist not found");
    playlists[playlistId] = { ...playlists[playlistId], ...updates };
    localStorage.setItem("vibeflow_playlists", JSON.stringify(playlists));
    return playlists[playlistId];
  },

  async deletePlaylist(playlistId) {
    if (!isMock) {
      await deleteDoc(doc(db, "playlists", playlistId));
      const user = mockAuthService.currentUser;
      if (user) {
        await mockAuthService.updateProfile({
          playlists: arrayRemove(playlistId)
        });
      }
      return;
    }

    const playlists = JSON.parse(localStorage.getItem("vibeflow_playlists"));
    delete playlists[playlistId];
    localStorage.setItem("vibeflow_playlists", JSON.stringify(playlists));

    const user = mockAuthService.currentUser;
    if (user && user.playlists) {
      await mockAuthService.updateProfile({ playlists: user.playlists.filter(pId => pId !== playlistId) });
    }
  },

  async addSongToPlaylist(playlistId, songId) {
    if (!isMock) {
      await updateDoc(doc(db, "playlists", playlistId), {
        songs: arrayUnion(songId)
      });
      return;
    }

    const playlists = JSON.parse(localStorage.getItem("vibeflow_playlists"));
    if (!playlists[playlistId]) throw new Error("Playlist not found");
    const playlist = playlists[playlistId];
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      localStorage.setItem("vibeflow_playlists", JSON.stringify(playlists));
    }
    return playlist;
  },

  async removeSongFromPlaylist(playlistId, songId) {
    if (!isMock) {
      await updateDoc(doc(db, "playlists", playlistId), {
        songs: arrayRemove(songId)
      });
      return;
    }

    const playlists = JSON.parse(localStorage.getItem("vibeflow_playlists"));
    if (!playlists[playlistId]) throw new Error("Playlist not found");
    const playlist = playlists[playlistId];
    playlist.songs = playlist.songs.filter(id => id !== songId);
    localStorage.setItem("vibeflow_playlists", JSON.stringify(playlists));
    return playlist;
  },

  // --- Liked Songs System ---
  async toggleLikeSong(songId) {
    const user = mockAuthService.currentUser;
    if (!user) throw new Error("Authentication required to like songs");
    const likedSongs = user.likedSongs || [];
    const isLiked = likedSongs.includes(songId);

    if (!isMock) {
      await updateDoc(doc(db, "users", user.uid), {
        likedSongs: isLiked ? arrayRemove(songId) : arrayUnion(songId)
      });
      return !isLiked;
    }

    let updatedLikes;
    if (isLiked) {
      updatedLikes = likedSongs.filter(id => id !== songId);
    } else {
      updatedLikes = [...likedSongs, songId];
    }
    await mockAuthService.updateProfile({ likedSongs: updatedLikes });
    return !isLiked;
  },

  // --- Recently Played System ---
  async addToRecentlyPlayed(song) {
    const user = mockAuthService.currentUser;
    if (!user) return;
    const history = user.recentlyPlayed || [];
    const filteredHistory = history.filter(item => item.songId !== song.songId);
    const newHistory = [{ ...song, playedAt: new Date().toISOString() }, ...filteredHistory].slice(0, 20);

    if (!isMock) {
      try {
        await updateDoc(doc(db, "users", user.uid), { recentlyPlayed: newHistory });
      } catch (e) {
        console.warn("Failed to update recently played in Firestore", e);
      }
      return;
    }
    await mockAuthService.updateProfile({ recentlyPlayed: newHistory });
  }
};

// ==========================================
// FIREBASE STORAGE SIMULATOR & SDK HELPER
// ==========================================
export const uploadFile = async (file, path) => {
  if (!isMock && storage) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (e) {
      console.warn("Storage upload failed, falling back to local file reader URL", e);
    }
  }

  // Simulated Mock Upload returning direct base64 string
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export { auth, db, storage };
