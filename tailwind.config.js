/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false, // Dark theme disabled - only light mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#667eea',
          '50': '#f5f7ff',
          '100': '#ebf0ff',
          '200': '#d6e0ff',
          '300': '#a8c0ff',
          '400': '#7a9fff',
          '500': '#667eea',
          '600': '#5568d3',
          '700': '#4453b8',
          '800': '#333e9d',
          '900': '#222982',
        },
        accent: {
          cyan: '#06b6d4',
          pink: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981',
        },
        neutral: {
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
        },
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
        },
        secondary: {
          DEFAULT: '#10b981',
          '50': '#ecfdf5',
          '100': '#d1fae5',
          '200': '#a7f3d0',
          '300': '#6ee7b7',
          '400': '#34d399',
          '500': '#10b981',
          '600': '#059669',
          '700': '#047857',
          '800': '#065f46',
          '900': '#064e3b',
          '950': '#022c22',
        }
      },
      spacing: {
        'grid-gap': '1.5rem',
        'sidebar-width': '280px',
        'header-height': '64px',
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
      },
      backdropBlur: {
        'glass': '10px',
      }
    },
  },
  plugins: [],
}

