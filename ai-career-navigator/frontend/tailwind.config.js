// tailwind.config.js - Tailwind CSS configuration
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
        primary: {
          DEFAULT: '#6366F1', // indigo-500
          light: '#818CF8',   // indigo-400
          dark: '#4F46E5'     // indigo-600
        },
        secondary: {
          DEFAULT: '#8B5CF6', // violet-500
          light: '#A78BFA',   // violet-400
          dark: '#7C3AED'     // violet-600
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out forwards",
        slideInRight: "slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: 0, transform: "translateX(100%)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        }
      },
    },
  },
  plugins: [],
}
