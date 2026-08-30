/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F2F5F8',
        card: '#FFFFFF',
        ink: '#0B1F3B',
        muted: '#123A63',
        accent: '#2F5D8C',
        accentDark: '#123A63',
        border: '#C9D6E5',
        income: '#2FBE8F',
        expense: '#F0473E',
        pillDark: '#0B1F3B',
      },
      borderRadius: {
        xl2: '1.5rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(11, 31, 59, 0.08)',
      },
    },
  },
  plugins: [],
};
