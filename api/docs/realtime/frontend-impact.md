# Impacto e Integración Frontend

Esta sección detalla cómo se adaptó el cliente React + Vite tras la migración del backend a Server-Sent Events (SSE).

## 1. Cambio de Dependencias y Librerías

- **Eliminado:** `socket.io-client` de la lista de dependencias en `package.json`.
- **Utiliza:** La API nativa del navegador `EventSource` a través de un adaptador retrocompatible.

---

## 2. Implementación del Cliente SSE Retrocompatible

Para evitar realizar modificaciones invasivas y de alto riesgo en múltiples archivos de componentes y React Hooks, implementamos un adaptador personalizado `RealtimeSSEClientImpl` en [socket-provider.tsx](file:///home/daniel/WebstormProjects/uegc-react-vite/uecg/src/features/identity/providers/socket-provider.tsx):

```typescript
class RealtimeSSEClientImpl implements RealtimeSSEClient {
  private eventSource: EventSource | null = null
  private listeners = new Map<string, Set<(data: any) => void>>()

  constructor(url: string) {
    // Conexión nativa con transmisión automática de cookies HttpOnly
    this.eventSource = new EventSource(url, { withCredentials: true })

    const eventTypes = ['carnets-ready', 'export-reports-ready', 'export-ready']
    eventTypes.forEach((type) => {
      this.eventSource?.addEventListener(type, (event) => {
        try {
          const parsed = JSON.parse(event.data)
          this.trigger(type, parsed)
        } catch (e) {
          console.error('[SSE] Error parseando datos del evento:', e)
        }
      })
    })
  }

  on(event: string, callback: (data: any) => void): void { ... }
  off(event: string, callback?: (data: any) => void): void { ... }

  private trigger(type: string, data: any): void {
    for (const [event, callbacks] of this.listeners.entries()) {
      // Soporta tanto eventos estáticos como dinámicos del cliente antiguo:
      // Ej: event 'export-reports-ready-123' se ejecuta al recibir type 'export-reports-ready'
      if (event === type || event.startsWith(`${type}-`)) {
        callbacks.forEach((cb) => cb(data))
      }
    }
  }
}
```

---

## 3. Integración Global y UX

1. **Montaje a Nivel de Ruta Autenticada:** Movimos el `SocketProvider` para envolver directamente la pasarela de rutas autenticadas en [_authenticated.tsx](file:///home/daniel/WebstormProjects/uegc-react-vite/uecg/src/app/router/_authenticated.tsx). Esto habilitó la conexión SSE global para toda la aplicación del Director/Docente, resolviendo el problema de que los reportes y horarios no recibían notificaciones si se originaban fuera de la página de carnets.
2. **Reconexión Automática:** Se aprovecha el algoritmo de reconexión con retraso exponencial integrado de forma nativa en la API `EventSource` de los navegadores modernos.
3. **Invalidación de TanStack Query:** Cuando los listeners reciben el evento de finalización, se ejecutan las invalidaciones del caché correspondientes para forzar la re-búsqueda REST de forma limpia y controlada, cambiando el estado en la interfaz de "Generando..." a "Descargar archivo".
