/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1e293b', // Custom darker slate
          900: '#0f172a', // Main background
          800: '#1e293b', // Card background
          700: '#334155', // Borders
        },
        primary: {
          500: '#a855f7', // Purple
          600: '#9333ea',
        },
        success: {
          500: '#22c55e', // Green
        }
      }
    },
  },
  plugins: [],
}