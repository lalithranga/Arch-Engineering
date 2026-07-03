import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allows imports like `import X from '@/components/X'` if you wire up
  // the matching entry in jsconfig.json / tsconfig.json. Optional, but
  // keeps deep relative imports (../../../) out of a growing codebase.
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
  },
});
