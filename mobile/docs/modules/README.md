# Módulos del Sistema Móvil UECG

Este documento describe detalladamente las funcionalidades, diseño y flujos de trabajo de los módulos existentes en la aplicación móvil **UECG**.

---

## 1. Módulo: Onboarding
* **Ruta Física**: `lib/features/onboarding/`
* **Propósito**: Dar la bienvenida al usuario y orquestar el flujo inicial al abrir la aplicación por primera vez.

### Pantallas y Flujos
1. **[splash_screen.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/onboarding/presentation/screens/splash_screen.dart)**:
   - Pantalla de presentación animada con `flutter_animate`.
   - Implementa una animación geométrica ("impacto del punto viajero") de 1.2 segundos.
   - **Lógica de Entrada**: Al terminar la animación, consulta si existe un token JWT local. Si existe, intenta actualizar el perfil (`refreshProfile()`) y redirige al panel según su rol. Si no hay token, redirige al `WelcomeScreen`.
2. **[onboarding_screen.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/onboarding/presentation/screens/onboarding_screen.dart)**:
   - Slider con información sobre las capacidades del sistema (asistencia instantánea, comunicación directa, control académico).
3. **[welcome_screen.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/onboarding/presentation/screens/welcome_screen.dart)**:
   - Pantalla de bifurcación de acceso: Iniciar Sesión (`/login`) o Crear Cuenta (`/register`).

---

## 2. Módulo: Auth (Autenticación)
* **Ruta Física**: `lib/features/auth/`
* **Propósito**: Administrar la sesión del usuario, el registro de nuevas cuentas y la recuperación de contraseñas.

### Flujo de Datos
- **Entrada**: Formulario con credenciales.
- **Servicio Seguro**: Persiste el token en `SecureStorageService`.
- **Integración FCM**: Sincroniza el token de notificaciones push de Firebase con NestJS tras la autenticación exitosa.

### Pantallas
* **[login_screen.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/auth/presentation/screens/login_screen.dart)**: Formulario de inicio de sesión con validación de credenciales institucionales.
* **[register_screen.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/auth/presentation/screens/register_screen.dart)**: Registro segregado para Estudiantes y Tutores/Padres, utilizando el carnet de identidad (CI) como validador principal.
* **[forgot_password_screen.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/auth/presentation/screens/forgot_password_screen.dart)**: Recuperación en dos pasos mediante el envío de un código otp por correo y actualización de contraseña.

---

## 3. Módulo: Dashboard (Paneles de Control)
* **Ruta Física**: `lib/features/dashboard/`
* **Propósito**: Panel centralizador de funcionalidades según el rol del usuario autenticado.

### Vistas por Rol
El módulo se divide en subcarpetas de vistas en `presentation/views/`:

#### A. Estudiante (`views/student/`)
- **[student_home_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/student/student_home_view.dart)**: Resumen del estado académico, accesos rápidos y notificaciones del día.
- **[student_grades_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/student/student_grades_view.dart)**: Visualización de promedios trimestrales y materias cursadas.
- **[student_schedule_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/student/student_schedule_view.dart)**: Agenda de clases del día con horas y aulas.
- **[student_profile_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/student/student_profile_view.dart)**: Datos de filiación del estudiante e información de su tutor.

#### B. Tutor/Padre (`views/parent/`)
- **[parent_home_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/parent/parent_home_view.dart)**: Selector de hijo a consultar, con el último estado de ingreso al plantel escolar.
- **[parent_grades_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/parent/parent_grades_view.dart)**: Calificaciones del hijo seleccionado.
- **[parent_messages_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/parent/parent_messages_view.dart)**: Comunicados institucionales directos de directores y profesores.
- **[parent_profile_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/parent/parent_profile_view.dart)**: Datos familiares y lista de hijos vinculados.

#### C. Docente (`views/teacher/`)
- **[teacher_home_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/teacher/teacher_home_view.dart)**: Panel con resumen de materias del día y porcentaje de asistencia registrada.
- **[teacher_courses_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/teacher/teacher_courses_view.dart)**: Lista de paralelos asignados.
- **[teacher_attendance_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/teacher/teacher_attendance_view.dart)**: Selector de modalidad de registro (QR o manual).
- **[teacher_profile_view.dart](file:///home/daniel/AndroidStudioProjects/uecg_app/lib/features/dashboard/presentation/views/teacher/teacher_profile_view.dart)**: Datos del docente y carga horaria asignada.

---

## 4. Módulo: Profile (Perfiles)
* **Ruta Física**: `lib/features/profile/`
* **Propósito**: Módulo diseñado para concentrar el manejo de datos personales y configuraciones del dispositivo de forma aislada a la vista de dashboard. Actualmente, las pantallas de perfil heredan de los sub-paneles del dashboard, pero deben migrarse a este módulo independiente para asegurar la reutilización de código.
