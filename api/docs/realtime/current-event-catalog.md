# Catálogo de Eventos Realtime (Pre-Migración)

Este catálogo documenta los gateways, eventos y dependencias de WebSockets actualmente configurados en el backend de UECG.

## 📦 Dependencias de WebSockets en `package.json`

- `@nestjs/websockets`: `^11.1.17` (Módulo WebSocket de NestJS)
- `@nestjs/platform-socket.io`: `^11.1.17` (Implementación de Socket.io para NestJS)
- `socket.io`: `^4.8.3` (Motor del servidor de WebSockets)

---

## 📡 Gateways y Eventos Catalogados

### 1. `IdentityGateway`
- **Archivo:** `src/identity/identity.gateway.ts`
- **Canal/Evento Emitido:** `carnets-ready-${academicYearId}`
- **Payload Emitido:**
  ```json
  {
    "message": "¡Tu lote de carnets está listo para impresión!",
    "fileName": "string"
  }
  ```
- **Frecuencia:** Muy baja. Ejecutado al inicio de la gestión escolar o por solicitudes extraordinarias de impresión.
- **Acción Desencadenante (BullMQ):** Job `generate-massive-carnets` procesado por `IdentityProcessor` en la cola `export-queue`.
- **Ámbito (Scope):** Global a nivel del año académico (`academicYearId`). Cualquier usuario conectado a este canal recibe el evento.

### 2. `ReportsGateway`
- **Archivo:** `src/reports/gateways/reports/reports.gateway.ts`
- **Canal/Evento Emitido:** `export-reports-ready-${userId}`
- **Payload Emitido:**
  ```json
  {
    "message": "¡El paquete de Libretas (Ley 070) está listo!",
    "fileName": "string"
  }
  ```
- **Frecuencia:** Baja / Concentrada. Ocurre al finalizar cada uno de los tres trimestres escolares.
- **Acción Desencadenante (BullMQ):** Job `generate-massive-bulletins` procesado por `ReportsProcessor` en la cola `reports-queue`.
- **Ámbito (Scope):** Aislado por `userId`. Sin embargo, debido al bug identificado (se envía `req.user.id` el cual es `undefined`), en la práctica se emite como `export-reports-ready-undefined`.

### 3. `TimetablesGateway`
- **Archivo:** `src/timetables/timetables.gateway.ts`
- **Canal/Evento Emitido:** `export-ready-${academicYearId}`
- **Payload Emitido:**
  ```json
  {
    "message": "¡Tus horarios masivos están listos!",
    "fileName": "string"
  }
  ```
- **Frecuencia:** Muy baja. Ocurre una o dos veces por gestión académica al fijar el horario oficial.
- **Acción Desencadenante (BullMQ):** Job `generate-massive-zip` procesado por `TimetablesProcessor` en la cola `export-queue`.
- **Ámbito (Scope):** Global a nivel del año académico (`academicYearId`).

---

## 🕵️‍♂️ Análisis de Consumidores e Impacto

| Evento de Salida | Emisor (Worker) | Receptor Esperado (Frontend) | ¿Bidireccional? | Estado |
| :--- | :--- | :--- | :---: | :--- |
| `carnets-ready-${academicYearId}` | `IdentityProcessor` | Panel de Carnetización (Admin/Secretaría) | No | Activo |
| `export-reports-ready-${userId}` | `ReportsProcessor` | Panel de Calificaciones / Libretas | No | **Bug: `userId` es `undefined`** |
| `export-ready-${academicYearId}` | `TimetablesProcessor`| Panel de Horarios Escolares (Gestión) | No | Activo |

---

## 🚨 Riesgos Técnicos Críticos Identificados

1. **Falta Absoluta de Autenticación:** Ningún gateway WebSocket cuenta con `JwtAuthGuard` o similar. Cualquier cliente WebSocket puede suscribirse sin credenciales.
2. **Fuga de Información (Broadcast):** Los eventos se emiten globalmente a nivel de `academicYearId` o a un canal unificado `undefined`. Un usuario malicioso podría interceptar los nombres de archivos ZIP que contienen datos personales (RUDE, notas, CIs) e intentar descargarlos directamente mediante el endpoint GET expuesto en REST.
3. **Bug del `userId` en Reportes:** `ReportsController` utiliza `req.user.id` para asignar el identificador que BullMQ reenviará al finalizar. Como el objeto de usuario devuelto por `JwtStrategy` mapea la clave como `userId`, `req.user.id` es `undefined`, rompiendo el flujo de notificación individual segura.
