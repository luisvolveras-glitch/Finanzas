/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F3F1FB',
        card: '#FFFFFF',
        ink: '#171522',
        muted: '#8B87A3',
        accent: '#8C7CF0',
        accentDark: '#6E5DE0',
        income: '#2FBE8F',
        expense: '#F0473E',
        pillDark: '#211F2E',
      },
      borderRadius: {
        xl2: '1.5rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(23, 21, 34, 0.06)',
      },
    },
  },
  plugins: [],
};
