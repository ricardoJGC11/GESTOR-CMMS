import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <--- Corregido el nombre del paquete
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})