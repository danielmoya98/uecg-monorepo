import type { ReactNode } from 'react'

import { QueryProvider } from './query-provider'
import { HelmetProvider } from './helmet-provider'
import { ErrorProvider } from './error-provider'
import { I18nProvider } from './i18n-provider'
import { ThemeProvider } from "./theme-provider";

interface Props {
  children: ReactNode
}

export function AppProviders({ children }: Props) {
  return (
    <ErrorProvider>
      <HelmetProvider>
        <I18nProvider>
          <ThemeProvider>
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </I18nProvider>
      </HelmetProvider>
    </ErrorProvider>
  )
}
