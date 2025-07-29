import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.tsx'),
        content: resolve(__dirname, 'src/scripts/content.tsx'),
      },
      output: {
				entryFileNames: "[name].js"
      },
    },
    outDir: 'dist',
  }
})
