// src/components/SearchBar.jsx
import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

export const SearchBar = ({ value, onChange, onClear, placeholder = "What do you want to listen to?" }) => {
  return (
    <div className="relative w-full max-w-md">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
        <FiSearch size={18} />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-2.5 bg-zinc-800/80 hover:bg-zinc-850 focus:bg-zinc-900 border border-white/5 focus:border-brand/40 text-white placeholder-zinc-400 rounded-full text-sm outline-none transition-all"
        id="search-input-field"
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white transition-colors"
          type="button"
          aria-label="Clear search input"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
