import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath, URL } from 'node:url'
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
    tailwindcss(),
    tsconfigPaths({ projects: ["tsconfig.app.json"] }),
    // Needs to be at the end
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "nebula-browser",
      uploadToken: process.env.CODECOV_TOKEN,
      telemetry: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:3000',
        ws: true,
      },
    },
  },
})
