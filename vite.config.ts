import path from "path"
import { configDefaults, defineConfig } from 'vitest/config'
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
  // mobile/ and site/ have their own dependencies and their own tests.
  test: {
    exclude: [...configDefaults.exclude, 'mobile/**', 'site/**'],
  },
})
