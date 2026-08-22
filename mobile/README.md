# 📱 UECG Mobile — Aplicación Móvil Estudiantil y Docente

Aplicación móvil oficial de la **Unidad Educativa Colegio Che Guevara (UECG)** para estudiantes, padres/tutores y profesores.

---

## 🏗️ Arquitectura y Tecnologías

- **Framework:** Flutter 3.x / Dart
- **Arquitectura:** **Clean Architecture** (Capa de Presentación, Dominio y Datos)
- **Gestor de Estado:** Flutter Riverpod
- **Navegación:** GoRouter
- **Cliente de Red:** Dio con interceptores JWT Bearer
- **Almacenamiento Seguro:** `flutter_secure_storage` para tokens de sesión
- **Notificaciones Push:** Firebase Cloud Messaging (`firebase_messaging` + `firebase_core`)
- **Lector QR / Código de Barras:** `mobile_scanner`

---

## 📁 Estructura del Código (Clean Architecture)

```
lib/
├── core/                 # Configuración de red (Dio), temas, constantes, router
│   ├── network/          # ApiClient, interceptores Bearer y manejo de errores
│   ├── router/           # Configuración de rutas protegidas con GoRouter
│   ├── services/         # SecureStorageService, PushNotificationService
│   └── theme/            # Paleta de colores institucional y tipografía
└── features/             # Módulos organizados por Clean Architecture
    ├── auth/             # Login, Registro, Recuperación de contraseña
    │   ├── data/         # AuthRepository, datasources remotos y DTOs
    │   ├── domain/       # Entidades de dominio e interfaces
    │   └── presentation/ # Pantallas de login, splash, providers Riverpod
    ├── dashboard/        # Paneles por rol (Estudiante, Tutor, Docente)
    ├── attendance/       # Lector QR de asistencia y visualización de faltas/atrasos
    ├── grades/           # Consulta de calificaciones y boletines
    └── notifications/    # Centro de avisos y alertas push institucionales
```

---

## 🚀 Inicio y Compilación

```bash
# 1. Obtener paquetes y dependencias
flutter pub get

# 2. Ejecutar análisis de código
flutter analyze

# 3. Correr la app en emulador o dispositivo
flutter run

# 4. Compilar para Android (APK)
flutter build apk --release
```

---

## 🔗 Integración con el Backend

- **Autenticación:** Cabeceras HTTP `Authorization: Bearer <jwt_token>`.
- **Sincronización FCM:** Envío automático del FCM token al iniciar sesión al endpoint `/auth/fcm-token`.
- **Regla de Integración:** Ante cualquier cambio en los endpoints de backend, verificar la compatibilidad de contratos en `ApiClient` y repositorios.
