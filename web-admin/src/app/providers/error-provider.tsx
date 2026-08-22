import { ErrorBoundary } from 'react-error-boundary'

import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">
        Algo salió mal
      </h1>
    </div>
  )
}

export function ErrorProvider({ children }: Props) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </ErrorBoundary>
  )
}
