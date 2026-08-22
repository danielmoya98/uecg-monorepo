# Notificaciones Push y Alertas Móviles

Este documento detalla el diseño e integración del sistema de notificaciones push de **Firebase Cloud Messaging (FCM)** con la aplicación móvil y el backend NestJS.

---

## 1. Arquitectura de Control de Notificaciones

La aplicación móvil maneja notificaciones en tres estados del ciclo de vida del dispositivo:

```
┌───────────────────┬────────────────────────────────────────────────────────┐
│ Estado de la App  │ Canal de Procesamiento                                 │
├───────────────────┼────────────────────────────────────────────────────────┤
│ **Primer Plano**  │ `FirebaseMessaging.onMessage`                          │
│ (Foreground)      │ Genera una alerta visual in-app o notificación local.  │
├───────────────────┼────────────────────────────────────────────────────────┤
│ **Segundo Plano** │ `FirebaseMessaging.onMessageOpenedApp`                 │
│ (Background)      │ Captura la interacción del usuario con la bandeja.     │
├───────────────────┼────────────────────────────────────────────────────────┤
│ **Cerrada**       │ `FirebaseMessaging.getInitialMessage`                  │
│ (Terminated)      │ Despierta la app y procesa el payload de arranque.     │
└───────────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Contrato de Datos (Payload Action)

Las notificaciones institucionales no son meramente informativas; a menudo requieren dirigir al usuario a recursos web o pantallas específicas de la aplicación.

### Payload de Ejemplo (Formato JSON de FCM)
```json
{
  "to": "FCM_TOKEN_DEL_USUARIO",
  "notification": {
    "title": "Comunicado de Dirección",
    "body": "Se ha publicado el calendario de exámenes del Segundo Trimestre."
  },
  "data": {
    "click_action": "FLUTTER_NOTIFICATION_CLICK",
    "updateUrl": "https://uecg.edu.bo/comunicados/trimestre-2.pdf"
  }
}
```

### Acciones Definidas
* **`updateUrl`**: Cuando este parámetro viaja en el mapa de `data`, la aplicación activa la función `_launchInAppWebView(url)`. Utiliza `url_launcher` para cargar el documento PDF o la página web en un WebView interno. Esto evita que el usuario abandone el flujo de la aplicación.

---

## 3. Flujo de Sincronización del Token FCM

El token FCM identifica al dispositivo del usuario. Debe mantenerse sincronizado con el backend NestJS para garantizar la entrega de notificaciones segmentadas por curso o rol.

```
       ┌──────────┐                     ┌──────────┐                     ┌──────────┐
       │ Firebase │                     │ App Movil│                     │  NestJS  │
       └────┬─────┘                     └────┬─────┘                     └────┬─────┘
            │                                │                                │
            │ Genera/Rota Token              │                                │
            ├───────────────────────────────>│                                │
            │                                │                                │
            │                                │ Leer JWT                       │
            │                                ├──────────┐                     │
            │                                │          │                     │
            │                                |<─────────┘                     │
            │                                │                                │
            │                                │ JWT Activo?                    │
            │                                ├───────────────────────────────>│
            │                                │   PATCH /auth/fcm-token        │
            │                                │   { fcmToken: "..." }          │
            │                                │                                │
```

### Puntos Críticos de Sincronización
1. **Inicio de Sesión exitoso**: Inmediatamente después de recibir el JWT del backend, la app solicita el token FCM mediante `FirebaseMessaging.instance.getToken()` y lo envía al backend para asociarlo al usuario.
2. **Registro de Cuenta**: Funciona igual que el inicio de sesión para habilitar las notificaciones de inmediato.
3. **Rotación Automática (`onTokenRefresh`)**: Firebase puede invalidar el token FCM por inactividad o problemas del servidor de Google. La app se suscribe a este evento dinámico. Si detecta un JWT activo en storage, actualiza el nuevo token en NestJS en segundo plano.
4. **Cierre de Sesión (Desvinculación)**: Al hacer logout, antes de borrar el JWT local, es recomendable enviar una petición para desvincular el token FCM actual en la base de datos del servidor, evitando que el dispositivo siga recibiendo notificaciones del usuario anterior.
