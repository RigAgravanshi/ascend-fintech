import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
    // Prefer TypeScript sources over leftover CommonJS .js files in /shared
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/profile': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/kyc': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/home': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/cards': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/loans': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/credit-score': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/calculator': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
