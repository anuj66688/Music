/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1DB954', // Spotify Green
          light: '#22c55e',
          dark: '#15803d',
          neon: '#10b981',
        },
        dark: {
          bg: '#09090b',       // Deepest dark background (zinc-950)
          sidebar: '#121214',  // Dark grey sidebar
          card: '#18181b',     // Dark card bg (zinc-900)
          hover: '#27272a',    // Zinc-800
          text: '#f4f4f5',     // White-grey text
          muted: '#a1a1aa',    // Grey text
        },
        light: {
          bg: '#f8fafc',
          sidebar: '#f1f5f9',
          card: '#ffffff',
          hover: '#e2e8f0',
          text: '#0f172a',
          muted: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
