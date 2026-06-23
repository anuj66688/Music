// src/pages/Landing.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMusic, FiPlay, FiShield, FiSliders, FiUsers, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

export const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLaunch = () => {
    if (user) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex flex-col font-sans select-none">
      
      {/* Decorative Neon Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

      {/* Floating Header */}
      <header className="h-20 px-8 lg:px-24 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-brand-neon flex items-center justify-center shadow-lg shadow-brand/20">
            <FiMusic className="text-black text-lg" />
          </div>
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            VIBEFLOW
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Link
              to="/home"
              className="text-sm font-semibold bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              Go to App
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold bg-brand hover:bg-brand-light text-black px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand/10"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col justify-center items-center text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand text-xs font-semibold uppercase tracking-widest"
          >
            <FiTrendingUp />
            <span>Introducing Version 2.0</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight"
          >
            Stream the Music that <br />
            <span className="bg-gradient-to-r from-brand via-brand-neon to-violet-500 bg-clip-text text-transparent filter drop-shadow-[0_4px_12px_rgba(29,185,84,0.15)]">
              Shapes Your Flow.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            Experience a gorgeous dark-themed music environment with synchronized canvas frequency visualizers, full Spotify library integration, and live lyrics synchronization.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={handleLaunch}
              className="flex items-center space-x-2.5 bg-white text-black hover:bg-zinc-200 px-8 py-3.5 rounded-full font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              <FiPlay className="fill-black" size={18} />
              <span>Launch VibeFlow</span>
            </button>
            <Link
              to="/signup"
              className="px-8 py-3.5 rounded-full bg-zinc-900 border border-white/10 text-white font-bold hover:bg-zinc-850 hover:border-white/20 transition-all text-base"
            >
              Create Free Account
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24 pt-12 border-t border-white/5">
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <FiSliders size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Interactive Visualizer</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Experience the music visually with our high-fidelity HTML5 Canvas waveform/frequency visualizer showing glow effects.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <FiMusic size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Lyrics Synchronization</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Auto-fetch and highlights lyrics lines parsed from LRC timetables, scrolling right in sync with your playback.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left flex flex-col space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FiShield size={22} />
            </div>
            <h3 className="text-lg font-bold text-white">Firebase Persistence</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Sign in with your Google account or Email to customize your library, save your likes, and sync playlists instantly.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-zinc-600 border-t border-white/5 mt-auto">
        &copy; {new Date().getFullYear()} VibeFlow Music. Inspired by Spotify. Built with React & Tailwind CSS.
      </footer>
    </div>
  );
};

export default Landing;
