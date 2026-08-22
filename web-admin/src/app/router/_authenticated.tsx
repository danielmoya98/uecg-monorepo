import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { PrivateDashboardLayout } from '@/app/layouts/private-dashboard-layout'
import { SocketProvider } from '@/features/identity'

// Eliminamos los prefijos visuales y centralizamos la aduana de red
export const Route = createFileRoute('/_authenticated')({
  // 🛡️ Guardia de Seguridad ABAC Universal en Memoria Viva
  beforeLoad: ({ context }) => {
    // 🔥 SOLUCIÓN DEFINITIVA: Leemos estrictamente el estado síncrono del contexto del Router.
    // Si context.isAuthenticated es falso (porque se borró el localStorage en el logout),
    // el rebote al login será inmediato, impidiendo arrastrar contextos cruzados.
    if (!context.isAuthenticated) {
      throw redirect({
        to: '/', // Si no hay sesión válida, rebota al formulario de Login en seco
      })
    }
  },
  // El componente actúa como una pasarela limpia inyectando el Layout Visual Puro
  component: AuthenticatedRouteComponent,
})

function AuthenticatedRouteComponent() {
  return (
    <SocketProvider>
      <PrivateDashboardLayout>
        {/* 🔥 ESTO INDICA A TANSTACK QUE AQUÍ VAN LAS SUBPÁGINAS */}
        <Outlet />
      </PrivateDashboardLayout>
    </SocketProvider>
  )
}
