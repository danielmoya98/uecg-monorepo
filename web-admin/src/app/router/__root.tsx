import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { AuthUser } from '@/features/auth'

// 🛡️ Tipamos el ecosistema completo de seguridad en memoria viva
interface MyRouterContext {
  isAuthenticated: boolean
  user: AuthUser | null
  can: (action: string, subject: string) => boolean
  canAny: (requirements: { action: string; subject: string }[]) => boolean
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return <Outlet />
}
