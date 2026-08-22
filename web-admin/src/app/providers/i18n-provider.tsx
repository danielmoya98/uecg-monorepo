import '@/shared/i18n'

import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function I18nProvider({ children }: Props) {
  return children
}
