import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const yahooProxyConfig = {
  '/api/yahoo': {
    target: 'https://query1.finance.yahoo.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/yahoo/, ''),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  },
  '/api/yahoo2': {
    target: 'https://query2.finance.yahoo.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/yahoo2/, ''),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  },
};

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true,
    host: true,
    proxy: yahooProxyConfig,
  },
  preview: {
    port: 4173,
    host: true,
    proxy: yahooProxyConfig,
  },
});
