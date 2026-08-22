import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    // 🔥 CONFIGURACIÓN CRÍTICA: Le decimos al plugin dónde están realmente tus archivos de rutas
    tanstackRouter({
      routesDirectory: './src/app/router',
      generatedRouteTree: './src/routeTree.gen.ts', // Opcional: mantiene el árbol en la raíz si así lo deseas
      routeFileIgnorePattern: '((router)\\.tsx$)',
      routeFileIgnorePrefix: '-',
    }),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
