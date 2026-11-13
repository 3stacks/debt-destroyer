import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The web app lives at /app/. The homepage (site/) is at the root.
export default defineConfig({
  base: '/app/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
