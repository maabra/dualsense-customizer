import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'source-only-build-redirect',
      // Raw branch hosting opens the committed build; Vite-served pages run normally.
      transformIndexHtml: {
        order: 'pre',
        handler: html => html.replace(/<script id="source-build-redirect">[\s\S]*?<\/script>\s*/, ''),
      },
    },
    vue(),
  ],
  build: {
    outDir: 'docs',
    rollupOptions: {output: {manualChunks: {
      three: ['three','three/addons/loaders/GLTFLoader.js','three/addons/controls/OrbitControls.js','three/addons/lights/RectAreaLightUniformsLib.js'],
      vue: ['vue'],
    }}},
  },
});
