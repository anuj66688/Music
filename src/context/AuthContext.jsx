// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { mockAuthService, dbService, isFirebaseMock } from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = mockAuthService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    setLoading(true);
    try {
      const newUser = await mockAuthService.signup(email, password, name);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await mockAuthService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const googleUser = await mockAuthService.googleLogin();
      setUser(googleUser);
      return googleUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await mockAuthService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    await mockAuthService.resetPassword(email);
  };

  const updateProfile = async (updates) => {
    const updatedUser = await mockAuthService.updateProfile(updates);
    setUser(updatedUser);
    return updatedUser;
  };

  // Helper bindings for DB actions linked to this user context
  const toggleLikeSong = async (songId) => {
    if (!user) throw new Error("Please login to like songs");
    const liked = await dbService.toggleLikeSong(songId);
    // Refresh user state
    const savedUser = localStorage.getItem("vibeflow_current_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    return liked;
  };

  const createPlaylist = async (title, description, coverImage) => {
    const newPlaylist = await dbService.createPlaylist(title, description, user?.uid || "Guest", coverImage);
    const savedUser = localStorage.getItem("vibeflow_current_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    return newPlaylist;
  };

  const deletePlaylist = async (playlistId) => {
    await dbService.deletePlaylist(playlistId);
    const savedUser = localStorage.getItem("vibeflow_current_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  };

  const addToRecentlyPlayed = async (song) => {
    await dbService.addToRecentlyPlayed(song);
    const savedUser = localStorage.getItem("vibeflow_current_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  };

  const value = {
    user,
    loading,
    signup,
    login,
    googleLogin,
    logout,
    resetPassword,
    updateProfile,
    toggleLikeSong,
    createPlaylist,
    deletePlaylist,
    addToRecentlyPlayed,
    isMock: isFirebaseMock()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
