# Resumen de Módulos (Features) - UECG React Vite

Este documento cataloga y detalla el estado actual, las dependencias y la deuda técnica de cada característica (feature) del proyecto.

## 1. Módulos Migrados y Funcionales

### A. Autenticación (`auth`)
* **Responsabilidad:** Inicio de sesión, control de acceso, guardas de rutas y refresco silencioso de tokens JWT.
* **Componentes Clave:** Formularios de acceso, layouts de protección de sesión (`_authenticated.tsx` guard).
* **Almacenamiento de Estado:** Estado de usuario almacenado en `localStorage` (`uecg_user`) y cookies de control visual (`uecg_is_logged_in`).

### B. Estructura Académica (`academic-years`)
* **Responsabilidad:** Gestión de Años Lectivos (Gestiones Escolares) y periodos trimestrales.
* **Características Especiales:** Alta interactividad visual basada en el patrón Drawer con Portal e integraciones de animaciones rápidas con Framer Motion en tablas y menús de opciones flotantes.
* **Estado:** Totalmente funcional y migrado con separación UI/Lógica limpia a nivel de hooks customizados.

### C. Configuración de Instituciones (`institutions`)
* **Responsabilidad:** Panel de configuración general del colegio, incluyendo control de asistencia, campañas escolares y bloques de periodos.
* **Componentes Clave:** `InstitutionForm`, `CampaignSettingsPanel`, `AttendanceSettingsPanel`, `ClassPeriodsSettingsPanel`.
* **Estado:** Altamente funcional, sirviendo como núcleo de la pantalla de ajustes de la institución.

### D. Métricas y Estadísticas (`dashboard`)
* **Responsabilidad:** Widgets visuales de rendimiento y asistencia para administradores, directores y profesores.
* **Componentes Clave:** `global-metrics-widget.tsx`, `root-metrics-widget.tsx`, `teacher-metrics-widget.tsx`.
* **Estado:** Funcional y adaptado al enrutamiento dinámico.

### E. Cuenta de Usuario (`profile`)
* **Responsabilidad:** Gestión de datos personales del usuario y cambio de contraseña.
* **Componentes Clave:** `profile-form.tsx`, `change-password-drawer.tsx`.
* **Estado:** Totalmente funcional.

### F. Centro de Carnetización e Identidad Digital (`identity`)
* **Responsabilidad:** Generación masiva e individual de credenciales escolares en PDF y habilitación criptográfica de códigos de barra y QR.
* **Componentes Clave:** `identity-command-center.tsx`, `student-carnet-drawer.tsx`, `custom-select.tsx`, `student-carnet-document.tsx`.
* **Estado:** **100% Migrado y optimizado.**
  * WebSocket encapsulado localmente.
  * Cero lógica de red en elementos de presentación visual.
  * Selector accesible WCAG 2.1 AA implementado.

### G. Actualizaciones RUDE (`data-updates`)
* **Responsabilidad:** Bandeja de resoluciones RUDE enviadas por los padres. Auditoría side-by-side de diferencias del expediente de inscripción (nombres, CI, dirección, contacto) contra el original en base de datos. Campaña omnicanal segmentada y masiva.
* **Componentes Clave:** `data-updates-page.tsx`, `diff-update-drawer.tsx`, `broadcast-command-center.tsx`, `broadcast-preview-drawer.tsx`.
* **Estado:** **100% Migrado y optimizado.**
  * Lógica totalmente desacoplada de la UI a nivel de hooks customizados (`useDataUpdatesData`, `useBroadcastCenter`).
  * Estructura 100% tipada estrictamente sin `any`.
  * Portales con Framer Motion, focus trap y control Escape accesibles según WCAG 2.1 AA.
  * Barreras de seguridad ABAC síncronas en el enrutamiento TanStack Router.

### H. Control de Asistencia (`attendance`)
* **Responsabilidad:** Gestión y monitoreo en vivo de la asistencia estudiantil, control por pase de lista manual, estación biométrica por códigos QR con audio beeps de retroalimentación y justificación de licencias disciplinarias.
* **Componentes Clave:** `attendance-page.tsx`, `attendance-monitor.tsx`, `qr-scanner.tsx`, `justifications-panel.tsx`.
* **Estado:** **100% Migrado y optimizado.**
  * Lógica 100% separada en custom hooks (`useAttendanceWorkspace`, `useAttendanceData`).
  * Optimización de rendimiento mediante debounce (500ms) de consultas Query en búsqueda de alumnos.
  * Captura y detención segura de cámaras (`Html5Qrcode`) blindado contra re-inicializaciones en React Strict Mode.
  * Portales accesibles WCAG 2.1 AA con focus trap y tecla Escape en el Drawer de justificaciones.
  * Tipado estricto en toda la capa de servicio HTTP y presentación.

### I. Periodos de Clase (`class-periods`)
* **Responsabilidad:** Control y configuración de los bloques horarios de los turnos escolares (Mañana, Tarde, Noche).
* **Estado:** **100% Migrado.**
  * Co-localizado en hooks (`useClassPeriodsData`), tipos (`types/class-periods.types.ts`) y componentes independientes (`ShiftTabs`, `ClassPeriodForm`, `ClassPeriodsTable`).
  * Integración total con el backend mediante mutaciones HTTP reales de creación y eliminación.
  * Formulario validado mediante React Hook Form y esquemas de Zod estrictos.
  * 100% de cobertura de pruebas unitarias y de humo para componentes y formularios.

---

## 2. Módulos Incompletos o en Proceso de Migración

*(Todos los módulos han sido migrados y se encuentran en estado funcional).*

