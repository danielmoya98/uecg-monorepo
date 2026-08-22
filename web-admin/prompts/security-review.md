# Prompt Reutilizable: Auditoría de Seguridad Frontend

*Copie y envíe este prompt a un agente de Inteligencia Artificial para auditar la seguridad del frontend de la aplicación.*

---

```markdown
Actúa como Especialista en Seguridad de Aplicaciones Web y Hacker Ético Frontend.

Tu objetivo es auditar rigurosamente la seguridad y protección del lado del cliente de nuestra aplicación UECG React Vite, asegurando que se previenen ataques habituales (XSS, CSRF, Secuestro de Sesión, Bypass de Autorización) y que las políticas de sesión son impenetrables.

### Áreas Críticas de Seguridad a Auditar

Inspecciona detalladamente el código del repositorio y reporta las vulnerabilidades asociadas a los siguientes frentes:

#### 1. Almacenamiento Seguro de Credenciales y Sesión
* Analiza cómo se guardan y leen las credenciales del usuario.
* ¿Se almacenan secretos de alta prioridad (como access tokens firmados) en `localStorage` o `sessionStorage` exponiéndolos a ataques XSS?
* Verifica que las cookies HTTP-only del lado del servidor estén siendo utilizadas como el canal de sesión real y que `localStorage` solo contenga metadatos descriptivos visuales no sensibles (ej. `uecg_user` con permisos e información de perfil).

#### 2. Robustez de Interceptores y Cierre de Sesión
* Revisa el archivo `src/shared/api/client.ts`.
* Evalúa si existe alguna fuga en la lógica de renovación de token de sesión (`/auth/refresh`).
* ¿El método `kickUserOut` elimina con absoluta fiabilidad y de forma síncrona todos los indicios de sesión local en cookies reactivas y storage ante respuestas 401 del servidor?

#### 3. Protección y Bypass en Enrutamiento y Vistas
* Analiza el enrutador centralizado en `src/app/router/router.tsx` y su guarda `_authenticated.tsx`.
* ¿Existe alguna ruta sensible o layout administrativo expuesto que carezca de comprobación de autenticación síncrona o validación de contexto `isAuthenticated`?
* ¿Se puede saltar la restricción visual del enrutador alterando el almacenamiento local o existe una sincronización en caliente con redibujo completo del árbol de componentes (`sessionKey` re-keying)?

#### 4. Autorización Basada en Permisos y Roles (RBAC)
* Evalúa los métodos de control de permisos `can` y `canAny` declarados en el contexto del enrutador.
* ¿Se aplican comprobaciones estrictas de permisos reactivas a nivel de componente antes de habilitar acciones críticas de edición/eliminación?
* ¿Se maneja adecuadamente un comodín administrativo seguro (ej. `manage:all:all`)?

#### 5. Sanitización de Entradas y XSS
* Escanea el código del proyecto buscando el uso del antipatrón de React `dangerouslySetInnerHTML`.
* ¿Se sanitizan adecuadamente las cadenas de entrada ingresadas en los campos de formularios antes de enviarlas o renderizarlas?

---

### Reporte de Vulnerabilidades Requerido

Presenta tus hallazgos en un reporte estructurado:
1. **Resumen Ejecutivo de Seguridad:** Calificando el nivel de riesgo global (Bajo / Medio / Alto / Crítico).
2. **Registro de Vulnerabilidades Halladas:** Especificando el archivo, severidad (Crítica, Alta, Media, Baja), descripción del riesgo y vector de ataque.
3. **Plan de Mitigación Inmediato:** Instrucciones paso a paso de los parches de seguridad que deben aplicarse en el frontend.
```
