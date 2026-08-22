import { HelmetProvider as Provider } from 'react-helmet-async'

import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function HelmetProvider({ children }: Props) {
  return <Provider>{children}</Provider>
}
