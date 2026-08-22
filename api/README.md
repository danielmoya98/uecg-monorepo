# ⚙️ UECG Backend API — REST, SSE & Background Workers

Servicio central de backend para la **Unidad Educativa Colegio Che Guevara (UECG)**, desarrollado sobre **NestJS v11**, **Prisma ORM v7**, **PostgreSQL**, **Redis** y colas asíncronas **BullMQ**.

---

## 🏗️ Arquitectura y Tecnologías

- **Framework:** NestJS v11 (TypeScript)
- **ORM & Base de Datos:** Prisma ORM v7 con adaptador PostgreSQL (`@prisma/adapter-pg`)
- **Seguridad & Autorización:** JWT + Refresh Tokens en cookies HttpOnly / Bearer + Guard ABAC (`PermissionsGuard`) + Encriptación PII AES-256
- **Tiempo Real & Eventos:** Server-Sent Events (SSE) y EventEmitter de dominio
- **Colas & Tareas en Segundo Plano:** BullMQ + Redis (Generación de Carnets QR, generación masiva de PDFs/Boletines, Push Notifications FCM)
- **Notificaciones Push:** Firebase Admin SDK (FCM)
- **Mailing:** Nodemailer (recuperación de contraseña con OTP)
- **Documentación de API:** OpenAPI / Swagger UI

---

## 🌐 Endpoints y Módulos Principales

| Módulo | Ruta Base | Descripción |
| :--- | :--- | :--- |
| **`auth`** | `/api/v1/auth` | Login, refresco de sesión, lockout por intentos, tokens FCM y recuperación OTP |
| **`users`** | `/api/v1/users` | Gestión de usuarios, perfiles, asignación de roles y encriptación de PII |
| **`institutions`** | `/api/v1/institutions` | Configuración institucional, código SIE/RUE y datos geográficos |
| **`academic-years`** | `/api/v1/academic-years` | Gestión de ciclos lectivos y estados de gestión |
| **`classrooms`** | `/api/v1/classrooms` | Cursos, grados, paralelos y turnos |
| **`subjects`** | `/api/v1/subjects` | Catálogo de materias por nivel educativo |
| **`teacher-assignments`** | `/api/v1/teacher-assignments` | Asignación de carga horaria docente por curso y materia |
| **`timetables`** | `/api/v1/timetables` | Matriz de horarios sin solapamiento de docentes ni aulas |
| **`students`** | `/api/v1/students` | Registro de estudiantes y datos RUDE del Ministerio |
| **`enrollments`** | `/api/v1/enrollments` | Inscripciones con máquina de estados finitos (FSM) |
| **`attendance`** | `/api/v1/attendance` | Asistencia por QR, manual, licencias y justificaciones |
| **`grades`** | `/api/v1/grades` | Calificaciones Ley 070 (SER/SABER/HACER/DECIDIR/AUTO) y solicitudes de cambio |
| **`identity`** | `/api/v1/identity` | Generación de credenciales y carnets estudiantiles con QR |
| **`reports`** | `/api/v1/reports` | Exportación de libretas y centralizadores de calificaciones |
| **`realtime`** | `/api/v1/realtime` | Canal SSE para alertas y notificaciones en vivo |

---

## 🚀 Instalación y Puesta en Marcha

### 1. Variables de Entorno
Copiar el archivo de ejemplo y configurar las credenciales:
```bash
cp .env.example .env
cp firebase-credentials.example.json firebase-credentials.json
```

### 2. Instalación de dependencias
```bash
npm install
```

### 3. Generación del cliente de Prisma y migraciones
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Iniciar servidor en modo desarrollo
```bash
npm run start:dev
```
- **API URL:** `http://localhost:4000/api/v1`
- **Swagger Docs:** `http://localhost:4000/api/docs`

---

## 🚢 Despliegue en Producción

El backend se despliega automáticamente en **Render** como servicio web (`web_service`) ante fusiones en la rama `main`:
- **Build Command:** `npm install --include=dev && npx prisma generate && npm run build`
- **Start Command:** `npm run start:prod`
- **Health Check Path:** `/api/v1`

---

## 📖 Documentación Detallada

Para guías de arquitectura, estándares de código, DTOs y seguridad, revisa la carpeta [`docs/`](docs/README.md).
