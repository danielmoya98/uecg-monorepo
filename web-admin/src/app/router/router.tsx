import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '../../routeTree.gen'
import { useAuthStore, type AuthUser } from '@/features/auth'
import { RoutePendingIndicator } from '@/shared/ui/route-pending-indicator'

export const router = createRouter({
  routeTree,
  defaultPendingComponent: RoutePendingIndicator,
  defaultPendingMs: 150,
  defaultPendingMinMs: 0,
  context: {
    isAuthenticated: false,
    user: null,
    can: () => false,
    canAny: () => false,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  // 🔥 ESTADO REACTIVO: El enrutador reaccionará de forma instantánea a cualquier cambio de sesión en Zustand
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = !!user

  const permissions: string[] = user?.permissions || []

  const can = (action: string, subject: string) =>
    permissions.includes(`${action}:${subject}`) || permissions.includes('manage:all:all')

  const canAny = (requirements: { action: string; subject: string }[]) =>
    requirements.some((req) => can(req.action, req.subject))

  return (
    <RouterProvider
      router={router}
      key={user?.id || 'anonymous'} // 🔥 CLAVE DE REDIBUJO: Si el ID cambia (Login/Logout), el árbol privado nace de cero
      context={{
        isAuthenticated,
        user: user as AuthUser,
        can,
        canAny,
      }}
    />
  )
}
