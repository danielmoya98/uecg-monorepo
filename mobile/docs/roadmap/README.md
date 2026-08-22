# Roadmap de Desarrollo Móvil UECG

Este documento establece el plan de trabajo estructurado en fases para evolucionar la aplicación Flutter de la **U.E. Ernesto Che Guevara (UECG)** desde su estado actual de maqueta (mock) hasta un cliente de producción seguro y de alto rendimiento.

---

## Plan de Fases

```
┌────────────────────────────────────────────────────────┐
│      FASE 1: SANEAMIENTO, SEGURIDAD Y INFRAESTRUCTURA   │
│      - Corrección de Cierre de Sesión                   │
│      - Singleton DioClient via Riverpod                 │
│      - Reparación de Suite de Test compile error        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│      FASE 2: MODELADO DE DOMINIO Y GUARDAS DE RUTA     │
│      - Modelos Freezed (User, Student, Guardian)       │
│      - Enrutamiento GoRouter Reactivo a AuthState       │
│      - Mapeador de Excepciones del Backend             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│      FASE 3: INTEGRACIÓN API REAL Y SSE                │
│      - Listar Estudiantes Reales en dashboard de Padres │
│      - Conectar Escáner QR de Asistencias a la API      │
│      - Servicio SSE (Server-Sent Events) en Background  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│      FASE 4: CAPACIDAD OFFLINE Y SINCRONIZACIÓN        │
│      - Base de datos local (Isar)                      │
│      - Sincronización en segundo plano de Asistencias   │
│      - Persistencia de horarios y notas offline         │
└────────────────────────────────────────────────────────┘
```

---

## Detalle de Tareas por Fase

### Fase 1: Saneamiento y Seguridad (Sprint 1)
* **Corrección de Logout**:
  - Reemplazar el botón simulado `context.go('/welcome')` en `student_profile_view.dart`, `parent_profile_view.dart` y `teacher_profile_view.dart` por la invocación de la acción real: `ref.read(authProvider.notifier).logout()`.
* **Refactor de ApiClient**:
  - Eliminar el getter estático `ApiClient.dio` que crea instancias nuevas en cada llamada.
  - Implementar un provider de Riverpod `@riverpod Dio dioClient` para inyectar una instancia única y reutilizar sockets HTTP.
* **Soporte de Linter y Test**:
  - Modificar `test/widget_test.dart` para cambiar la llamada `MyApp()` por `UECGApp()`.
  - Asegurar la ejecución de `flutter test` y `flutter analyze` libres de errores.

### Fase 2: Modelado de Dominio y Guardas de Ruta (Sprint 2)
* **Modelos Tipados Seguros**:
  - Implementar los modelos de negocio del Dominio (`User`, `Student`, `Guardian`, `Course`, `AttendanceRecord`) usando `@freezed` para su serialización segura desde las respuestas JSON de NestJS.
* **GoRouter Reactivo**:
  - Crear el provider de navegación `routerProvider` para controlar los redireccionamientos de rol e inicio de sesión de forma centralizada eliminando la lógica de navegación esparcida en widgets.
* **Mapeo de Excepciones**:
  - Implementar un interceptor de errores HTTP en `Dio` para transformar códigos de respuesta (e.g., 400, 403, 404, 500) en excepciones personalizadas del dominio Dart legibles para el usuario.

### Fase 3: Integración de API Real y SSE (Sprint 3)
* **Vincular Familiares**:
  - Conectar el selector de hijos de `ParentHomeView` con el endpoint de NestJS `/guardians/me` para obtener el listado real de estudiantes a cargo desde la base de datos de Prisma.
* **Registro de Asistencias QR**:
  - Vincular la detección de códigos de barra en `QRAttendanceScreen` con el endpoint de asistencia para registrar de inmediato en NestJS los ingresos estudiantiles detectados.
* **Implementar SSE**:
  - Construir un provider basado en `StreamProvider` que consuma el stream SSE del servidor NestJS, desplegando notificaciones locales emergentes (in-app alerts) en tiempo real al detectar eventos relevantes.

### Fase 4: Modo Offline First (Sprint 4)
* **Caché Local de Datos Académicos**:
  - Configurar Isar Database para almacenar esquemas de cursos, horarios de clase y promedios trimestrales.
* **Cola de Sincronización Offline**:
  - Desarrollar la cola de peticiones locales que almacena capturas de QR de asistencia en memoria flash en ausencia de red.
  - Diseñar el despachador automático que sincroniza los registros en NestJS al detectar la recuperación de conectividad.
* **Manejo de Idempotencia**:
  - Validar el flujo de sincronización enviando identificadores UUID únicos por cada registro de asistencia offline para evitar registros duplicados en el backend.
