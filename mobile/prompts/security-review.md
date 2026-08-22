# Prompt: Auditoría de Seguridad Móvil

Este prompt se utiliza para auditar el código móvil de la aplicación **UECG** en busca de vulnerabilidades, fugas de credenciales, persistencia insegura o malas prácticas en la red.

---

## Instrucciones para el Asistente

> **Rol**: Lead Mobile Security Engineer & Penetration Tester.
> **Objetivo**: Auditar el código móvil adjunto en busca de vectores de ataque o vulnerabilidades de seguridad comunes en dispositivos móviles.

Por favor, revisa el código fuente y las configuraciones de compilación prestando especial atención a las siguientes amenazas de seguridad móvil:

### 1. Fuga y Persistencia del JWT (Sesión)
* **¿Cierre de Sesión Completo?**: Comprueba si el botón o acción de "Cerrar Sesión" limpia físicamente el token en `SecureStorageService.deleteToken()`. Reporta cualquier botón que solo aplique redirección visual (`context.go` o `Navigator.pop`) dejando la sesión activa por debajo.
* **¿Almacenamiento Seguro?**: Verifica que el token JWT y otros secretos nunca se escriban en `SharedPreferences` o bases de datos SQLite/Isar desprotegidas en texto plano.

### 2. Seguridad en Comunicaciones (HTTPS)
* **¿Conexiones Seguras?**: Inspecciona las URLs de la API para garantizar que todas utilicen estrictamente el esquema `https://`.
* **¿Fuga de Cabeceras?**: Verifica que los interceptores de red no impriman el token JWT plano en las consolas de depuración pública (`print` o `logger` sin enmascarar).

### 3. Exposición de Código y Obfuscación
* **¿Metadatos en Android/iOS?**: Revisa si se están exponiendo claves de APIs externas (e.g. Firebase API Keys, tokens de mapas) en texto plano dentro de repositorios en lugar de utilizar variables de entorno compiladas (`String.fromEnvironment`).

### 4. Permisos de Hardware y Datos del Dispositivo
* **¿Sobre-solicitud de Permisos?**: Comprueba que la aplicación solo declare y solicite permisos estrictamente necesarios en `AndroidManifest.xml` e `Info.plist`. (e.g. acceso a cámara para escáner QR de asistencia).
* **¿Descripciones de Privacidad en iOS?**: Verifica que `Info.plist` contenga justificaciones claras en español para los permisos de cámara y notificaciones, de lo contrario la aplicación será rechazada en la revisión de la App Store de Apple.
