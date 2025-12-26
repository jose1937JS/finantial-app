/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Income (green tones)
        income: {
          light: '#4ade80',
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        // Expense (red tones)
        expense: {
          light: '#f87171',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        // Dark mode background colors
        dark: {
          bg: '#0f0f0f',
          card: '#1a1a1a',
          border: '#2a2a2a',
          surface: '#141414',
        },
        // Light mode
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          surface: '#f1f5f9',
        },
        // Accent colors for categories
        accent: {
          blue: '#3b82f6',
          purple: '#a855f7',
          orange: '#f97316',
          pink: '#ec4899',
          teal: '#14b8a6',
          yellow: '#eab308',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
