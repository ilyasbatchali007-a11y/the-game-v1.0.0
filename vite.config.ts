import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    assetsInclude: ['**/*.obj'],
  },
  publicDir: 'src/3d-objects',
});
