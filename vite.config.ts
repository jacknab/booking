import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    // Enable gzip and brotli compression
    compression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Use esbuild for faster minification (Vite v3+ default)
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react-dom';
          if (id.includes('/react/') || id.includes('/react-router') || id.includes('/react-hook-form/') || id.includes('/@hookform/') || id.includes('/@tanstack/')) return 'vendor-react';
          if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-vendor/')) return 'vendor-charts';
          if (id.includes('/leaflet') || id.includes('/react-leaflet')) return 'vendor-maps';
          if (id.includes('/framer-motion/')) return 'vendor-motion';
          if (id.includes('/@radix-ui/')) return 'vendor-radix';
          if (id.includes('/lucide-react/') || id.includes('/react-icons/')) return 'vendor-icons';
          if (id.includes('/date-fns')) return 'vendor-date';
          if (id.includes('/html2canvas') || id.includes('/qrcode.react')) return 'vendor-canvas';
          if (id.includes('/embla-carousel')) return 'vendor-embla';
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  define: {
    'process.env.DEBUG': 'false',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});

