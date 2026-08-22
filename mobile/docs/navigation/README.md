# Navegación y Enrutamiento Móvil

La aplicación móvil **UECG** utiliza el paquete **GoRouter** para gestionar el enrutamiento declarativo de pantallas.

---

## 1. Configuración de GoRouter

La configuración central se localiza en [app_router.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/core/routes/app_router.dart). Las rutas son estáticas e imitan la estructura de vistas web.

### Rutas Declaradas

| Ruta | Pantalla | Propósito |
| :--- | :--- | :--- |
| `/` | `SplashScreen` | Inicialización de la app, comprobación de sesión y animaciones de bienvenida. |
| `/onboarding` | `OnboardingScreen` | Slider informativo para nuevos usuarios. |
| `/welcome` | `WelcomeScreen` | Pantalla de bienvenida y selección de inicio/registro. |
| `/login` | `LoginScreen` | Formulario de autenticación. |
| `/register` | `RegisterScreen` | Formulario de registro (Estudiante / Tutor). |
| `/forgot-password`| `ForgotPasswordScreen` | Recuperación de credenciales. |
| `/dashboard/student` | `StudentDashboard` | Panel principal para el Estudiante. |
| `/dashboard/parent` | `ParentDashboard` | Panel principal para el Tutor/Padre. |
| `/dashboard/teacher` | `TeacherDashboard` | Panel principal para el Docente. |
| `/attendance/qr` | `QRAttendanceScreen` | Escáner QR de asistencia para el Docente. |
| `/attendance/manual` | `ManualAttendanceScreen` | Registro de asistencia manual para el Docente. |
| `/course-detail` | `CourseDetailScreen` | Detalle académico del curso seleccionado. |

---

## 2. Redirección Basada en Estado (Guards)

> [!CAUTION]
> **Deficiencia Actual**:
> La navegación y la comprobación de roles se realizan de manera imperativa dentro de las pantallas (por ejemplo, en `SplashScreen` y `LoginScreen` se lee `authProvider` y se llama a `context.go(...)`).
> Esto expone la aplicación a fallos de seguridad donde una pantalla interior pueda ser accedida sin credenciales activas escribiendo o forzando la ruta.

### Solución Arquitectónica: Router Guards Reactivos
Se debe integrar `GoRouter` de forma que escuche los cambios de `authProvider` y calcule la redirección correcta de forma centralizada y atómica.

#### Ejemplo de Implementación del Router Guard
```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: authStateListenable(ref), // Escuchar cambios
    redirect: (context, state) {
      final status = authState.status;
      final role = authState.user?['role'];
      
      final isLoggingIn = state.matchedLocation == '/login' ||
                          state.matchedLocation == '/register' ||
                          state.matchedLocation == '/welcome' ||
                          state.matchedLocation == '/onboarding' ||
                          state.matchedLocation == '/forgot-password';

      // 1. Si está comprobando la sesión, mantener en el Splash
      if (status == AuthStatus.checking) return '/';

      // 2. Si no está autenticado y no está en login/onboarding, forzar Welcome
      if (status == AuthStatus.unauthenticated) {
        return isLoggingIn ? null : '/welcome';
      }

      // 3. Si está autenticado e intenta ir a login/welcome, redirigir a su Dashboard
      if (status == AuthStatus.authenticated && isLoggingIn) {
        if (role == 'DOCENTE') return '/dashboard/teacher';
        if (role == 'PADRE' || role == 'TUTOR') return '/dashboard/parent';
        return '/dashboard/student';
      }

      return null; // Permitir navegación
    },
    routes: [
      // Declaración de rutas...
    ],
  );
});
```

Este enfoque garantiza que cualquier expiración de token o cierre de sesión dispare una redirección automática instantánea al portal de acceso, bloqueando pantallas internas sin añadir validaciones repetitivas en cada Widget.
