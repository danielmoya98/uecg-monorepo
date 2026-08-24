/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react'

export interface RealtimeSSEClient {
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback?: (data: any) => void): void;
}

const SocketContext = createContext<RealtimeSSEClient | null>(null)

export const useSocket = (): RealtimeSSEClient | null => useContext(SocketContext)

class RealtimeSSEClientImpl implements RealtimeSSEClient {
  private eventSource: EventSource | null = null
  private listeners = new Map<string, Set<(data: any) => void>>()

  constructor(url: string) {
    console.log('🔗 [SSE] Conectando a stream de eventos SSE:', url)
    // Send cookies (HttpOnly uecg_access_token) with the EventSource request
    this.eventSource = new EventSource(url, { withCredentials: true })

    this.eventSource.onerror = (err) => {
      console.error('🔴 [SSE] Error en conexión EventSource:', err)
    }

    // Connect listener to standard SSE event types
    const eventTypes = [
      'carnets-ready',
      'export-reports-ready',
      'export-ready',
      'institution-updated',
    ]
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

  on(event: string, callback: (data: any) => void): void {
    let callbacks = this.listeners.get(event)
    if (!callbacks) {
      callbacks = new Set()
      this.listeners.set(event, callbacks)
    }
    callbacks.add(callback)
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!callback) {
      this.listeners.delete(event)
      return
    }
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      console.log('🔌 [SSE] Conexión EventSource cerrada.')
    }
  }

  private trigger(type: string, data: any): void {
    for (const [event, callbacks] of this.listeners.entries()) {
      // Trigger callback if the event name matches exactly or starts with the type prefix
      // (e.g., event 'export-reports-ready-123' matches type 'export-reports-ready')
      if (event === type || event.startsWith(`${type}-`)) {
        callbacks.forEach((cb) => {
          try {
            cb(data)
          } catch (e) {
            console.error('[SSE] Error ejecutando callback de evento:', e)
          }
        })
      }
    }
  }
}

interface SocketProviderProps {
  children: React.ReactNode
}

let globalClient: RealtimeSSEClientImpl | null = null
let activeConnectionsCount = 0
let disconnectTimeout: ReturnType<typeof setTimeout> | null = null

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [client] = useState<RealtimeSSEClient>(() => {
    if (!globalClient) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'
      const sseUrl = `${apiUrl}/realtime/events`
      globalClient = new RealtimeSSEClientImpl(sseUrl)
    }
    return globalClient
  })

  useEffect(() => {
    if (disconnectTimeout) {
      clearTimeout(disconnectTimeout)
      disconnectTimeout = null
    }

    activeConnectionsCount++

    return () => {
      activeConnectionsCount--
      if (activeConnectionsCount === 0) {
        // Si el usuario cerró sesión (el localStorage ya no tiene 'uecg_user'), desconectamos de inmediato por seguridad
        const isUserLoggedIn = !!localStorage.getItem('uecg_user')
        if (!isUserLoggedIn) {
          if (globalClient) {
            globalClient.disconnect()
            globalClient = null
          }
        } else {
          // De lo contrario, debouncamos la desconexión 1.5s por si es solo un remount de rutas (TanStack Router)
          disconnectTimeout = setTimeout(() => {
            if (globalClient) {
              globalClient.disconnect()
              globalClient = null
            }
          }, 1500)
        }
      }
    }
  }, [])

  return <SocketContext.Provider value={client}>{children}</SocketContext.Provider>
}
