/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');
const Myclass = plugin(function ({ addUtilities }) {
  addUtilities({
    '.rotate-y-180': {
      transform: 'rotateY(180deg)',
    },
    '.preserve-3d': {
      transformStyle: 'preserve-3d',
    },
    '.perspective': {
      perspective: '5000px',
    },
    '.backface-hidden': {
      backfaceVisibility: 'hidden',
    },
  });
});

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        desk: "url('/desk-surface.jpg')",
      },
      boxShadow: {
        thumb: '0 0 0 8px rgba(104,117,217,0.2)',
      },
    },
  },
  plugins: [Myclass],
};
