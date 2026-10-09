/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ascend: {
          darkest: '#05080e',
          card: '#0c121d',
          surface: '#121a29',
          border: '#1c283c',
          muted: '#8b98aa',
          neon: '#00e599',
          'neon-bright': '#10b981',
          'neon-glow': 'rgba(0, 229, 153, 0.25)',
          gold: '#f59e0b',
          crimson: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(0, 229, 153, 0.2)',
        'neon-md': '0 0 20px rgba(0, 229, 153, 0.3)',
        'neon-lg': '0 0 35px rgba(0, 229, 153, 0.4)',
      },
    },
  },
  plugins: [],
};
