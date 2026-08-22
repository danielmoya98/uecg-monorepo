import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { QueryProvider } from './providers/query-provider'
import { ThemeProvider } from './providers/theme-provider' // 🔥 CORRECCIÓN: Usamos tu proveedor nativo para Vite
import { AppRouter } from './router/router'

export function App() {
  return (
    <HelmetProvider>
      <ThemeProvider> {/* Eliminamos las props de next-themes, tu proveedor lee el localStorage de forma nativa */}
        <QueryProvider>
          <AppRouter />

          <Toaster
            position="bottom-right"
            toastOptions={{
              className:
                '!rounded-none !border !border-uecg-text !bg-[var(--color-background)] !text-[var(--color-foreground)] !font-sans !font-bold !uppercase !tracking-widest !shadow-none',
            }}
          />
        </QueryProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}
