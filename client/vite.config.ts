import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@ionic/core'],
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks: undefined,
      },
      external: ['/ionic.esm.js'],
    },
    // Playing fast and loose with paths here to make embedding easier
    outDir: '../server/dist',
    emptyOutDir: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@ionic/core/dist/ionic/*',
          dest: '',
        },
      ],
    }),
    VitePWA({
      srcDir: 'src',
      filename: 'service-worker.js',
      strategies: 'injectManifest',
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: undefined,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
