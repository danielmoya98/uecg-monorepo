# Guía de Integración Frontend ↔ Backend

## Configuración Base del Cliente HTTP

```typescript
// src/lib/api.ts — Configuración Axios recomendada

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,  // CRÍTICO: envía y recibe cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Refresh automático en 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await api.post('/auth/refresh');
        return api(originalRequest); // Reintentar request original
      } catch {
        // Refresh falló → redirigir al login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## Formato de Respuesta Estándar

### Éxito Simple
```typescript
// Tipo TypeScript para respuestas del backend
interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

// Éxito con paginación
interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;       // 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN', etc.
    message: string;    // Mensaje legible para el usuario
  };
}
```

### Manejo de errores en React
```typescript
try {
  const { data } = await api.post('/students/register-rude', formData);
  // data.data contiene el resultado exitoso
  toast.success(data.message);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    toast.error(apiError?.error?.message || 'Error inesperado');
  }
}
```

---

## Flujo de Autenticación Frontend

### 1. Login
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginSuccessResponse {
  status: 'SUCCESS';
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

interface LoginSetupRequiredResponse {
  status: 'SETUP_REQUIRED';
  message: string;
  setupToken: string;  // JWT temporal de 15 min para cambiar contraseña
}

const login = async (credentials: LoginRequest) => {
  const { data } = await api.post<ApiResponse<LoginSuccessResponse | LoginSetupRequiredResponse>>(
    '/auth/login', 
    credentials
  );
  
  if (data.data.status === 'SETUP_REQUIRED') {
    // Redirigir a pantalla de cambio de contraseña
    navigate(`/setup-password?token=${data.data.setupToken}`);
  } else {
    // Guardar user en estado global (las cookies se manejan automáticamente)
    setUser(data.data.user);
    navigate('/dashboard');
  }
};
```

### 2. Verificar sesión activa (al cargar la app)
```typescript
const checkAuth = async () => {
  try {
    // El backend valida la cookie automáticamente
    const { data } = await api.get('/auth/me');
    setUser(data.data);
  } catch {
    setUser(null); // Cookie expirada o inválida
  }
};
```

### 3. Logout
```typescript
const logout = async () => {
  await api.post('/auth/logout'); // Backend borra las cookies
  setUser(null);
  navigate('/login');
};
```

---

## Permisos y RBAC en Frontend

### Extraer permisos del estado de usuario
```typescript
// src/hooks/usePermissions.ts
import { useAuthStore } from '@/stores/auth.store';
import { SystemPermissions } from '@/constants/permissions';

export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const hasPermission = (permission: string) => {
    if (!user) return false;
    return (
      user.permissions.includes('manage:all:all') ||  // SUPER_ADMIN bypass
      user.permissions.includes(permission)
    );
  };
  
  const hasAnyPermission = (...permissions: string[]) => 
    permissions.some(p => hasPermission(p));
  
  return { hasPermission, hasAnyPermission };
};
```

### Uso en componentes
```tsx
const StudentsList = () => {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {hasPermission('read:all:Student') && <AllStudentsTable />}
      {hasPermission('read:own:Student') && !hasPermission('read:all:Student') && <MyStudentsTable />}
      {hasPermission('write:any:Enrollment') && <EnrollButton />}
    </div>
  );
};
```

---

## Endpoints por Funcionalidad Frontend

### Panel de Login
```
POST /auth/login         → Login
POST /auth/setup-password → Cambio contraseña inicial
POST /auth/forgot-password → Solicitar OTP
POST /auth/reset-password  → Confirmar OTP y nueva contraseña
```

### Dashboard
```
GET /dashboard/root     → Stats SUPER_ADMIN (cuentas, roles, DB)
GET /dashboard/global   → Stats académicas (estudiantes, cursos, docentes)
GET /dashboard/teacher  → Stats docente (próxima clase, trimestre actual)
```

### Gestión de Usuarios (Admin)
```
GET  /users             → Lista paginada con búsqueda ?search=&role=&page=&limit=
POST /users             → Crear usuario
PATCH /users/:id        → Actualizar
DELETE /users/:id       → Desactivar
PATCH /users/:id/reactivate → Reactivar
POST /users/:id/reset-password → Resetear contraseña
GET  /users/profile     → Perfil propio
PATCH /users/profile    → Actualizar perfil propio
```

### Gestión Académica
```
GET  /academic-years           → Lista de gestiones
POST /academic-years           → Crear gestión
PATCH /academic-years/:id/status → Cambiar estado (PLANNING→ACTIVE→CLOSED)

GET  /classrooms               → Lista de cursos del año activo
POST /classrooms               → Crear curso

GET  /subjects                 → Catálogo de materias
GET  /subjects?level=SECUNDARIA → Filtrado por nivel

POST /teacher-assignments      → Asignar docente a materia/curso
GET  /teacher-assignments?classroomId= → Asignaciones de un curso

GET  /class-periods?shift=MANANA → Periodos del turno
POST /timetables/slot          → Agregar casilla al horario
GET  /timetables/classroom/:id → Horario completo de un curso
```

### Inscripciones (Secretaría)
```
POST /students/register-rude      → Inscripción completa (Form RUDE)
POST /students/import-excel/:yearId → Importación masiva Excel
GET  /enrollments?classroomId=    → Nómina del curso
PATCH /enrollments/:id/status     → Aprobar/Rechazar/Retirar inscripción
```

### Asistencia (Docente)
```
GET  /attendance/schedule?date=2026-05-26 → Horario del día (bloques)
GET  /attendance/classroom?classroomId=&classPeriodId=&date= → Lista de alumnos
POST /attendance/bulk                    → Guardar asistencia masiva
POST /attendance/scan                    → Escanear QR
GET  /attendance/monitor?classroomId=&classPeriodId= → Monitor en vivo
```

### Calificaciones (Docente)
```
GET  /grades/assignment/:assignmentId/trimester/:trimesterId → Planilla de notas
PUT  /grades/bulk → Guardar planilla completa
PUT  /grades      → Guardar nota individual
POST /grades/change-requests → Solicitar corrección
GET  /grades/change-requests/pending → Solicitudes pendientes (Director)
PATCH /grades/change-requests/:id/resolve → Aprobar/Rechazar corrección
```

---

## Convenciones de Tipos TypeScript Compartidos

Se recomienda mantener un paquete o directorio de tipos compartidos entre frontend y backend:

```typescript
// types/shared.ts — Replicar en el frontend

export type AcademicStatus = 'PLANNING' | 'ACTIVE' | 'CLOSED';
export type EnrollmentStatus = 'REVISION_SIE' | 'INSCRITO' | 'RETIRADO' | 'TRASPASO' | 'RECHAZADO' | 'OBSERVADO';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
export type EducationLevel = 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
export type Shift = 'MANANA' | 'TARDE' | 'NOCHE';
export type Gender = 'MASCULINO' | 'FEMENINO';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

---

## Variables de Entorno Frontend

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_WS_URL=http://localhost:4000          # Para WebSocket (identity gateway)
```

---

## Notas de Migración Incremental

El frontend React + Vite está en **migración incremental** desde el sistema anterior. Consideraciones:

1. **CORS:** El backend permite `credentials: true`. El frontend DEBE usar `withCredentials: true` en Axios o `credentials: 'include'` en fetch.

2. **Cookies vs localStorage:** El backend usa HttpOnly Cookies, NO localStorage. No intentar almacenar tokens manualmente.

3. **Versión de API:** Todos los endpoints tienen prefijo `/api/v1/`. Al agregar nuevas versiones, usar `/api/v2/` y mantener v1 para retrocompatibilidad.

4. **Manejo de errores:** Los errores siempre tienen forma `{ success: false, error: { code, message } }`. El frontend debe tipar esto correctamente.

5. **Paginación:** Las listas paginadas retornan `{ data: [], meta: { page, limit, total, totalPages } }` dentro del wrapper estándar.

6. **Desempaquetado Automático en Axios (Próxima Fase):** Para evitar repetir `response.data.data !== undefined ? response.data.data : response.data` en más de 70 archivos del frontend, se recomienda actualizar el interceptor de Axios en `src/shared/api/client.ts` para que resuelva la propiedad `.data` interna del sobre del backend de manera transparente.

7. **Sincronización del Módulo `class-periods`:** La eliminación de bloques horarios en la UI no debe simularse localmente en el caché visual. El botón de eliminación debe invocar la mutación real que ejecute `DELETE /class-periods/:id` para persistir la acción en la base de datos de manera definitiva.

---

## 📱 Integración Cliente Móvil (Flutter / Dio)

A diferencia del cliente web que utiliza cookies HttpOnly, el cliente móvil Flutter interactúa con la API mediante encabezados **Bearer Token**:

### 1. Configuración de Cliente Dio
```dart
// mobile/lib/core/network/api_client.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const storage = FlutterSecureStorage();
  
  static Dio createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: 'https://ue-cheguevara-backend-1.onrender.com/api/v1',
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await storage.read(key: 'uecg_jwt_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );

    return dio;
  }
}
```

### 2. Sincronización de FCM Token (Push Notifications)
Al iniciar sesión con éxito en la app móvil:
```dart
// POST /auth/fcm-token
await dio.post('/auth/fcm-token', data: {
  'fcmToken': firebaseToken,
  'deviceInfo': 'Android/iOS'
});
```


