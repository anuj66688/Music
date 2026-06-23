// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { useAuth } from "../hooks/useAuth";

export const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-dark-bg/85 backdrop-blur-md sticky top-0 z-30 select-none">
      {/* Left side: Navigation history + Search injection */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-zinc-300 hover:text-white transition"
            title="Go back"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-zinc-300 hover:text-white transition"
            title="Go forward"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Children slots for search inputs or titles */}
        <div className="flex-1 max-w-md ml-4">{children}</div>
      </div>

      {/* Right side: Authentication controls */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2.5 p-1 pr-3 bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-full transition outline-none"
              id="user-profile-menu-button"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-white/10"
              />
              <span className="text-sm font-medium text-white max-w-[100px] truncate hidden md:inline">
                {user.name}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop closer */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />

                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in duration-200">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <FiUser size={16} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/admin"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <MdOutlineAdminPanelSettings size={17} />
                    <span>Admin Panel</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition border-t border-white/5 text-left"
                  >
                    <FiLogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-zinc-400 hover:text-white px-4 py-2 transition"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold bg-white text-black hover:scale-105 active:scale-95 px-5 py-2 rounded-full transition-all"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
