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
    // Use terser instead of esbuild to avoid TDZ ("Cannot access 'X' before
    // initialization") errors caused by esbuild's minify-syntax pass hoisting
    // const declarations across modules. Terser is slower but produces a
    // safer output for our bundle.
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 1,
      },
      format: {
        comments: false,
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
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

