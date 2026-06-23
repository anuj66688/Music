// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaEnvelope, FaLock, FaUser, FaMusic } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export const Signup = () => {
  const navigate = useNavigate();
  const { signup, googleLogin } = useAuth();

  // Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await googleLogin();
      navigate("/home");
    } catch (err) {
      setError(err.message || "Google registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden flex items-center justify-center font-sans select-none p-4">
      {/* Background neon blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Form Container */}
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

        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-zinc-400 text-xs mb-6 text-center">
          Sign up to access lists, custom visualizers and audio settings.
        </p>

        {/* Error boundary feedback */}
        {error && (
          <div className="w-full p-3 mb-4 rounded-lg bg-red-500/15 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSignupSubmit} className="w-full space-y-4">
          
          {/* Display Name Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <FaUser size={13} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display Name"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 focus:bg-zinc-900 border border-white/5 focus:border-brand/40 text-white rounded-lg text-sm outline-none transition-all"
              id="signup-name-input"
            />
          </div>

          {/* Email input field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <FaEnvelope size={13} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 focus:bg-zinc-900 border border-white/5 focus:border-brand/40 text-white rounded-lg text-sm outline-none transition-all"
              id="signup-email-input"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <FaLock size={13} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 focus:bg-zinc-900 border border-white/5 focus:border-brand/40 text-white rounded-lg text-sm outline-none transition-all"
              id="signup-password-input"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <FaLock size={13} />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 focus:bg-zinc-900 border border-white/5 focus:border-brand/40 text-white rounded-lg text-sm outline-none transition-all"
              id="signup-confirmpassword-input"
            />
          </div>

          {/* Sign Up Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand hover:bg-brand-light text-black font-bold rounded-lg text-sm transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-lg shadow-brand/10"
          >
            {loading ? "Creating Account..." : "Create Account"}
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

        {/* Google Registration */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-white/10 text-white rounded-lg text-sm flex items-center justify-center space-x-2 transition hover:border-white/20 active:scale-95"
        >
          <FaGoogle size={14} className="text-red-400" />
          <span>Continue with Google</span>
        </button>

        {/* Bypasser Guest link */}
        <Link
          to="/home"
          className="w-full text-center mt-3 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-white/10 text-white rounded-lg text-sm font-semibold transition active:scale-95"
        >
          Bypass as Guest
        </Link>

        {/* Redirect Login */}
        <p className="mt-8 text-xs text-zinc-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-bold hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
