import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf')) return 'vendor-jspdf';
              if (id.includes('xlsx')) return 'vendor-xlsx';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('motion')) return 'vendor-motion';
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('react-router')) return 'vendor-router';
              if (id.includes('react-dom')) return 'vendor-react-dom';
              if (id.includes('react/')) return 'vendor-react';
              if (id.includes('date-fns')) return 'vendor-date-fns';
              if (id.includes('razorpay')) return 'vendor-razorpay';
              if (id.includes('@google/genai')) return 'vendor-genai';
              // Group all other node_modules into a single vendor chunk
              return 'vendor-others';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1500,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
