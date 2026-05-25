import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    // Toto zabráni Vite, aby sa snažil "optimalizovať" (pokaziť) tieto balíky
    exclude: ["@ricky0123/vad-web", "onnxruntime-web"]
  },
  build: {
    rollupOptions: {
      external: ["onnxruntime-web"]
    }
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
})