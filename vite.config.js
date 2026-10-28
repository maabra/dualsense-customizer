import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({ base: './', plugins: [vue()], build: {rollupOptions: {output: {manualChunks: {three: ['three', 'three/addons/loaders/GLTFLoader.js', 'three/addons/controls/OrbitControls.js', 'three/addons/environments/RoomEnvironment.js'], vue: ['vue']}}}} });
