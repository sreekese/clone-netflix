import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      thresholds: { statements: 85, branches: 80, functions: 85, lines: 85 },
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/index.jsx'],
    },
  },
});
