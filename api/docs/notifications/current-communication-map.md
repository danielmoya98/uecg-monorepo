# Mapa de Comunicaciones Actual

Este documento detalla cómo se comunican las notificaciones y avisos a los usuarios dentro del backend de la Unidad Educativa Che Guevara (UECG). Muestra la procedencia, el canal, el evento y el destinatario final para cada flujo.

---

## 🗺️ Matriz de Comunicaciones

| Módulo Origen | Evento de Negocio / Flujo | Canal Utilizado | Mecanismo Técnico | Destinatario | Frecuencia |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | Solicitud de recuperación de contraseña (OTP) | **Email** | Síncrono `EventEmitter` (`auth.password_reset.requested`) $\rightarrow$ Encolado asíncrono BullMQ (cola `mail`, job `password-reset`) $\rightarrow$ `Nodemailer` (SMTP) | Personal, Docente o Tutor | Media |
| **Attendance** | Registro de asistencia (Entrada/Salida, Atraso, Ausencia, Manual, QR, Bulk) | **Push Notification (FCM)** | Síncrono `EventEmitter` (`attendance.*`) $\rightarrow$ Envío multicast directo a través de `FirebaseService` (síncrono/sin cola) | Tutor (Padre de familia) | Alta / Diaria |
| **Grades** | Calificación insuficiente registrada (< 51 puntos en estado publicado) | **Push Notification (FCM)** | Inyección directa de BullMQ (cola `notifications-queue`, job `grade-alert`) $\rightarrow$ `FirebaseService` (multicast) | Tutor (Padre de familia) | Media (Cierre de trimestre) |
| **Data Updates** | Lanzamiento manual de Campaña de Actualización RUDE (Individual/Curso) | **Omnicanal**:<br>1. **Push FCM** (preferente)<br>2. **Email** (fallback)<br>3. **WhatsApp Link** (fallback manual) | Inyección directa de BullMQ (cola `mail`, jobs `push-notification` o `rude-update-email`) para Push y Email. Para WhatsApp, se genera un enlace dinámico `api.whatsapp.com` retornado en la respuesta HTTP para que el administrador lo cliquee manualmente. | Tutor (Padre de familia) | Baja (Inicio de gestión) |
| **Data Updates** | Aprobación de datos RUDE en cuarentena | **Push Notification (FCM)** | Síncrono `EventEmitter` (`data.update.approved`) $\rightarrow$ Envío directo multicast a través de `FirebaseService` (síncrono/sin cola) | Tutor (Padre de familia) | Baja |
| **Data Updates** | Rechazo/Observación de datos RUDE en cuarentena | **Push Notification (FCM)** | Síncrono `EventEmitter` (`data.update.rejected`) $\rightarrow$ Envío directo multicast a través de `FirebaseService` (síncrono/sin cola) | Tutor (Padre de familia) | Baja |
| **Identity** | Generación masiva de carnets escolares en lote ZIP | **Sistema Interno / WebSocket** | Asíncrono en BullMQ (cola `export-queue`, job `generate-massive-carnets`) $\rightarrow$ Transmisión vía `IdentityGateway` con evento `carnets-ready-${academicYearId}` | Personal Administrativo | Muy baja |
| **Reports** | Generación masiva de libretas escolares en lote ZIP | **Sistema Interno / WebSocket** | Asíncrono en BullMQ (cola `reports-queue`, job `generate-massive-bulletins`) $\rightarrow$ Transmisión vía `ReportsGateway` con evento `export-reports-ready-${userId}` | Director o Administrador | Baja (Trimestral) |
| **Timetables** | Generación masiva de horarios escolares en lote ZIP | **Sistema Interno / WebSocket** | Asíncrono en BullMQ (cola `export-queue`, job `generate-massive-zip`) $\rightarrow$ Transmisión vía `TimetablesGateway` con evento `export-ready-${academicYearId}` | Personal Administrativo / Director | Muy baja |

---

## 🔍 Detalles por Canal

### 1. WhatsApp
*   **Estado:** Semimanual. No hay integración con API nativa de WhatsApp (ej. WhatsApp Business Platform).
*   **Enlace hardcodeado:** Se genera un enlace en el servicio `DataUpdatesBroadcastService` usando el prefijo de Bolivia (`591`) y sanitizando el número de teléfono del tutor.
*   **Flujo:** `https://api.whatsapp.com/send/?phone=591${cleanPhone}&text=${encodeURIComponent(textMessage)}&type=phone_number&app_absent=0`
*   **Mensaje de ejemplo:** `"Hola, el colegio requiere actualizar los datos de *{studentName}*. Por favor, ingresa a este enlace oficial: {updateUrl}"`

### 2. Email
*   **Librería:** `nodemailer` con transporte SMTP directo de Gmail.
*   **Servicio:** `MailService`
*   **Templates:** Embebidos directamente como HTML inline en los métodos de `MailService`:
    *   *Password Reset:* Contiene el código OTP numérico con un recuadro estilizado y aviso de expiración de 15 minutos.
    *   *RUDE Update:* Contiene un botón estilizado con enlace seguro (JWT firmado de 7 días de duración) para actualizar los datos.

### 3. Push Notifications (FCM)
*   **Librería:** `firebase-admin`
*   **Servicio:** `FirebaseService` (`sendMulticastNotification`)
*   **Tokens:** Se extraen del array de strings `fcmTokens` en el modelo `User` del Tutor o del Estudiante.

### 4. WebSocket (Realtime)
*   **Motor:** Socket.io integrado en NestJS con `@nestjs/websockets`.
*   **Flujo:** Procesadores BullMQ que emiten eventos a canales de WebSocket globales o específicos del usuario al completar la compilación de archivos ZIP/PDF en disco.
