import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          axios: ['axios'],
          lucide: ['lucide-react'],
          stripe: ['@stripe/stripe-js'],
          keycloak: ['keycloak-js', '@react-keycloak/web'],
          markdown: ['react-markdown'],
          reactDraft: ['react-draft-wysiwyg'],
          draftjs: ['draft-js', 'draft-js-export-markdown', 'draft-js-import-markdown'],
        },
      },
    },
  }
});
