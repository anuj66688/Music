// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaEnvelope, FaLock, FaMusic } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin, resetPassword } = useAuth();

  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await googleLogin();
      navigate("/home");
    } catch (err) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await resetPassword(email);
      setMessage("Password reset email sent (simulated). Check your inbox!");
    } catch (err) {
      setError("Failed to send reset email.");
    }
  };

  // Skip Login bypass option
  const handleGuestBypass = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex items-center justify-center font-sans select-none p-4">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Main Login card */}
      <div className="w-full max-w-md glass rounded-2xl shadow-2xl p-8 relative z-10 flex flex-col items-center">
        
        {/* Brand logo header */}
        <Link to="/" className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-brand-neon flex items-center justify-center shadow-lg shadow-brand/20">
            <FaMusic className="text-black text-sm" />
          </div>
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            VIBEFLOW
          </span>
        </Link>

        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-zinc-400 text-xs mb-6 text-center">
          Login to sync your custom playlists and playback history.
        </p>

        {/* Messaging blocks */}
        {error && (
          <div className="w-full p-3 mb-4 rounded-lg bg-red-500/15 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}
        {message && (
          <div className="w-full p-3 mb-4 rounded-lg bg-brand/15 border border-brand/20 text-brand text-xs">
            {message}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="w-full space-y-4">
          {/* Email input field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <FaEnvelope size={14} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 focus:bg-zinc-900 border border-white/5 focus:border-brand/40 text-white rounded-lg text-sm outline-none transition-all"
              id="login-email-input"
            />
          </div>

          {/* Password input field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <FaLock size={14} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 focus:bg-zinc-900 border border-white/5 focus:border-brand/40 text-white rounded-lg text-sm outline-none transition-all"
              id="login-password-input"
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-zinc-400 hover:text-white transition"
            >
              Forgot password?
            </button>
          </div>

          {/* Login submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 font-bold rounded-lg text-sm transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-lg"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Separator */}
        <div className="relative w-full my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative px-3 bg-zinc-950 text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">
            OR
          </span>
        </div>

        {/* Google SSO Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-white/10 text-white rounded-lg text-sm flex items-center justify-center space-x-2 transition hover:border-white/20 active:scale-95"
        >
          <FaGoogle size={14} className="text-red-400" />
          <span>Continue with Google</span>
        </button>

        {/* Guest Mode Direct Bypass */}
        <button
          onClick={handleGuestBypass}
          className="w-full mt-3 py-2.5 bg-brand/10 hover:bg-brand/20 border border-brand/20 text-brand rounded-lg text-sm font-semibold transition active:scale-95"
        >
          Try VibeFlow Guest Mode
        </button>

        {/* Redirect sign up */}
        <p className="mt-8 text-xs text-zinc-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-white font-bold hover:underline">
            Sign up free
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
