import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

interface SansDocument {
  id: string;
  title: string;
  description: string;
}

const sansDocuments: SansDocument[] = [
  {
    id: "10400-A",
    title: "SANS 10400-A - 2022 Edition",
    description: "General Application of the National Building Regulations"
  },
  // ... all other documents
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: 'localhost',
    port: 3000,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/cert.pem')),
    },
    strictPort: true,
    cors: true,
    proxy: {
      // Add any proxy configurations if needed
    },
    watch: {
      usePolling: true,
    },
  },
  preview: {
    port: 3000,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/cert.pem')),
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['docx'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/docx/, /node_modules/]
    }
  }
}));
