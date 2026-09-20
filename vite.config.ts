import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const FONT_FILE = /\.(eot|svg|ttf|woff2?)$/;

export default defineConfig({
  // the published CSS has to reference `fonts/*` relative to itself, not from the site root
  base: './',
  build: {
    copyPublicDir: false,
    emptyOutDir: true,
    lib: {
      cssFileName: 'vue-nav-tab',
      entry: 'lib/index.ts',
      fileName(format) {
        switch (format) {
          case 'cjs':
            return 'index.common.js';
          case 'es':
            return 'index.es.js';
          default:
            return 'vue-nav-tab.umd.js';
        }
      },
      formats: ['es', 'cjs', 'umd'],
      name: 'VueNavTab',
    },
    outDir: 'dist',
    rolldownOptions: {
      external: ['vue'],
      output: {
        assetFileNames: (assetInfo) => FONT_FILE.test(assetInfo.names[0] ?? '')
          ? 'fonts/[name][extname]'
          : '[name][extname]',
        exports: 'named',
        globals: { vue: 'Vue' },
      },
    },
    target: 'es2015',
  },
  plugins: [vue()],
});
