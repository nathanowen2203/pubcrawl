import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base is '/pubcrawl/' for the GitHub Pages build, '/' for local dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pubcrawl/' : '/',
  plugins: [react(), tailwindcss()],
}))
