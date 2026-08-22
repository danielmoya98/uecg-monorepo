# Reporte de Migración: WebSockets → Server-Sent Events (SSE)

Este reporte técnico consolida el resultado del proceso de migración de la capa de comunicación en tiempo real en la Unidad Educativa Che Guevara (UECG).

---

## 1. Cambios Realizados y Arquitectura

Se ha reemplazado exitosamente la pila de WebSockets basada en Socket.io por **Server-Sent Events (SSE)** nativos sobre el protocolo HTTP/2.

- **Centralización Realtime:** Se creó el `RealtimeModule` encapsulando `RealtimeService` y `RealtimeController` en `src/realtime/`.
- **Canalización Desacoplada (Mediator Pattern):** Los workers BullMQ emiten eventos locales vía `EventEmitter2`, los cuales son capturados por el servicio de realtime y distribuidos a los streams SSE correspondientes.
- **Eliminación de Código Obsoleto:** Se eliminaron los gateways `IdentityGateway`, `ReportsGateway`, `TimetablesGateway`, y se desinstalaron las dependencias `@nestjs/websockets`, `@nestjs/platform-socket.io`, y `socket.io` del proyecto.

---

## 2. Mejoras de Seguridad y Aislamiento

1. **Protección Criptográfica (Authentication Guard):** El stream SSE ahora pasa obligatoriamente por el `JwtAuthGuard` a través de HTTP GET normal, lo que garantiza que solo usuarios debidamente autenticados puedan suscribirse.
2. **Uso de Cookies HttpOnly:** La conexión se establece enviando automáticamente la cookie segura `uecg_access_token` del navegador (`withCredentials: true`), evitando exponer tokens JWT en la URL o handshakes desprotegidos.
3. **Resolución del Bug de ID de Usuario:** Se corrigió en `ReportsController` la llamada `req.user.id` a `req.user.userId`. Anteriormente, el ID se resolvía como `undefined`, provocando que las notificaciones de libretas se emitieran a un canal común de broadcast `export-reports-ready-undefined`, lo cual representaba una fuga crítica de datos de calificaciones RUDE. Ahora, las notificaciones viajan aisladas por el ID único del usuario solicitante.

---

## 3. Mejoras de Rendimiento y Escalabilidad

1. **Ahorro de Memoria RAM:** Se elimina el mantenimiento en memoria de sockets TCP bidireccionales y latidos pesados de la capa de transporte de Socket.io. SSE funciona de manera pasiva y ligera.
2. **Eficiencia de Conexiones (HTTP/2):** Al utilizar HTTP/2 en producción, las conexiones SSE se multiplexan sobre el mismo socket de red TCP que el resto de las peticiones REST de la aplicación, eliminando el límite de 6 conexiones por dominio de HTTP/1.1 y previniendo la degradación del frontend.
3. **Keep-Alive Robusto:** Se integró un heartbeat asíncrono con operadores RxJS (`interval(15000)`) que inyecta latidos leves (`keep-alive`) cada 15 segundos para mantener vivas las conexiones ante proxies reverso (como Nginx) o firewalls (como Cloudflare) sin consumir recursos de CPU.

---

## 4. Impacto e Integración

### Impacto Backend
- Todo el tráfico en tiempo real sigue las convenciones, guards, CORS e interceptores REST estándar de la aplicación.
- Simplificación del entorno de pruebas unitarias.

### Impacto Frontend
- Se elimina la necesidad de inicializar y mantener el cliente `socket.io-client`.
- Integración directa del `EventSource` nativo del navegador para la reconexión exponencial automática.
- Sincronización reactiva con **TanStack Query** mediante invalidación de caché (`queryClient.invalidateQueries`) al recibir los eventos de finalización de exportaciones, manteniendo la interfaz consistente y libre de fugas de memoria.
