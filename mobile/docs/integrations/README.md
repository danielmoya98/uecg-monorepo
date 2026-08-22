# Integraciones y Servicios Nativos

Este documento describe la configuración, arquitectura y mejores prácticas para el uso de SDKs nativos y hardware de dispositivo en la aplicación móvil **UECG**.

---

## 1. Firebase Cloud Messaging (FCM)

El canal principal de notificaciones push de la app utiliza el SDK de Firebase.

### Configuración e Inicialización
Se define en [push_notification_service.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/core/services/push_notification_service.dart):
* **Handler de Background**: Se utiliza `_firebaseMessagingBackgroundHandler` con la anotación `@pragma('vm:entry-point')` para asegurar que el motor de Dart pueda invocarlo en segundo plano incluso si la app está cerrada.
* **Permisos**: Solicita permisos dinámicos (`requestPermission`) para mostrar alertas, globos de icono y sonidos. Crítico para Android 13+ e iOS.
* **Sincronización**: Llama a `/auth/fcm-token` del backend NestJS cada vez que se autentica un usuario o cuando Firebase rota el token mediante `onTokenRefresh`.

---

## 2. Escáner de Códigos QR (`mobile_scanner`)

La aplicación móvil proporciona a los docentes un lector de códigos QR para agilizar el registro de asistencia estudiantil.

* **Componente de Cámara**: `MobileScanner` integrado en la vista.
* **Controlador**: `MobileScannerController` permite manipular el encendido del flash (`toggleTorch()`) y alternar cámaras.
* **Lógica de Detección**:
  - Lee códigos QR que contienen los identificadores de los estudiantes (C Rude o CI).
  - Previene escaneos duplicados en la sesión actual mediante listas en memoria.

> [!IMPORTANT]
> **Permisos de Cámara**:
> La primera vez que se accede a `QRAttendanceScreen`, el SDK de `mobile_scanner` solicita el permiso del sistema de forma automática.
> Se debe asegurar que las configuraciones de permisos estén presentes en los archivos de manifiesto nativos:
> - **Android** (`AndroidManifest.xml`): `<uses-permission android:name="android.permission.CAMERA" />`
> - **iOS** (`Info.plist`): `NSCameraUsageDescription` con una justificación de uso clara e institucional.

---

## 3. Navegador In-App y Enlaces Externos (`url_launcher`)

Para notificaciones que contienen enlaces a documentos institucionales o páginas informativas, la aplicación utiliza `url_launcher`.

* **Estrategia Swiss Style**: Se prioriza abrir las URLs utilizando un WebView interno dentro de la app (`LaunchMode.inAppWebView`) en lugar de forzar la apertura del navegador por defecto del sistema operativo. Esto mantiene una experiencia de usuario unificada.
* **Parámetro de Configuración**: `webViewConfiguration: const WebViewConfiguration(enableJavaScript: true)` garantiza la compatibilidad con páginas modernas que requieren la ejecución de scripts.
