import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5174',
      '/outputs': 'http://localhost:5174',
    },
  },
  optimizeDeps:
    command === 'serve'
      ? {
          include: ['react', 'react/jsx-dev-runtime', 'react-dom/client'],
        }
      : undefined,
}));
