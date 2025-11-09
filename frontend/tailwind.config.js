/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netflixRed: '#E50914',
        darkBg: '#141414',
        cardBg: '#1F1F1F',
        cardBgHover: '#2A2A2A',
        textLight: '#E5E5E5',
        textGray: '#B3B3B3',
        accent: '#E50914',
        accentHover: '#F40612',
        darkPurple: '#1A0F2E',
        darkRed: '#2D0A0E',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
        display: ['Urbanist', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(229, 9, 20, 0.5)',
        glowSm: '0 0 10px rgba(229, 9, 20, 0.3)',
        card: '0 4px 6px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #141414 0%, #1A0F2E 50%, #2D0A0E 100%)',
        'gradient-card': 'linear-gradient(135deg, #1F1F1F 0%, #2A2A2A 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}


