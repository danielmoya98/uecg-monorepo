import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import type { ReactNode } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// 🔥 CORRECCIÓN: Agregamos 'export' para que auth.service.ts pueda hacer queryClient.clear()
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60, // 1 minuto (o los 5 minutos que decidas para producción)
      refetchOnWindowFocus: false,
    },
  },
})

interface Props {
  children: ReactNode
}

export function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
