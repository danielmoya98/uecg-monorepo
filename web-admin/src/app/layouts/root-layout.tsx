import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function RootLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-white text-black">
      {children}
    </div>
  )
}
