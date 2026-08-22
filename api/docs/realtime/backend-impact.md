# Impacto y Arquitectura Backend (SSE)

La migración de WebSockets (Socket.io) a Server-Sent Events (SSE) introduce un desacoplamiento limpio entre los procesos asíncronos en segundo plano (Workers) y la entrega de notificaciones en tiempo real al cliente.

## 1. Arquitectura de Flujo de Eventos

La nueva arquitectura utiliza un patrón mediador mediante **`EventEmitter2`** para transferir eventos desde las colas/workers hacia un controlador centralizado de SSE.

```
+--------------------+      Termina Job      +-----------------------+
|  BullMQ Worker     | --------------------> |  EventEmitter2 Bus    |
| (Reports, Identity,|                       |                       |
|  Timetables)       |                       +-----------------------+
+--------------------+                                   |
                                                         | Fuego local
                                                         v
+--------------------+     Inyecta Evento    +-----------------------+
|   SSE Controller   | <-------------------- |   RealtimeService     |
| (RxJS Subject Map) |                       | (Filtra por User ID)  |
+--------------------+                       +-----------------------+
         |
         | HTTP/2 stream (text/event-stream)
         v
+--------------------+
|  Cliente React     |
+--------------------+
```

---

## 2. Definición del Contrato de Eventos y Convención de Nombres

### Eventos Internos (EventEmitter2)
Usaremos nombres con la estructura `<modulo>.<accion>.<resultado>`:
- `identity.massive.completed` (Payload: `{ userId: string; academicYearId: string; fileName: string }`)
- `reports.massive.completed` (Payload: `{ userId: string; fileName: string }`)
- `timetables.massive.completed` (Payload: `{ userId: string; academicYearId: string; fileName: string }`)

### Eventos de Salida (SSE Client Event Types)
Los nombres de los eventos SSE serán los mismos que usaba el frontend anteriormente para evitar romper la compatibilidad:
- `carnets-ready` (Payload: `{ message: string; fileName: string }`)
- `export-reports-ready` (Payload: `{ message: string; fileName: string }`)
- `export-ready` (Payload: `{ message: string; fileName: string }`)
- `heartbeat` (Payload: `"keep-alive"`)

---

## 3. Modelo de Seguridad e Aislamiento

1. **Autenticación Nativa:** El endpoint `GET /api/v1/realtime/events` está decorado con `@UseGuards(AuthGuard('jwt'), PermissionsGuard)`. La conexión se rechaza inmediatamente si no se provee una cookie de sesión válida.
2. **Aislamiento de Streams:** `RealtimeService` mantiene un `Subject` de RxJS por cada `userId` activo. Cuando se emite un evento, solo se inyecta en el Subject del `userId` destinatario. Un administrador nunca podrá escuchar los eventos de otro administrador o docente.
3. **Control de Fugas de Memoria:** Al desconectarse el cliente, el flujo se cierra y el operador `finalize()` de RxJS decrementa las referencias de conexión activa. Si llega a 0, se destruye el `Subject` del mapa de memoria de forma segura.
