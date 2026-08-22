# Seguridad Móvil UECG

Este documento define la arquitectura y las políticas de seguridad implementadas en el cliente móvil Flutter de la **U.E. Ernesto Che Guevara (UECG)**.

---

## 1. Almacenamiento Seguro de Datos

Cualquier dato de carácter sensible (tokens de autenticación, información identificativa del carnet de identidad o Rude) **nunca** debe almacenarse en `SharedPreferences` de forma plana.

### Uso de `flutter_secure_storage`
La aplicación utiliza `flutter_secure_storage`, la cual encripta los datos bajo el capó mediante:
* **Android**: Encriptación AES en combinación con la Keystore de Android (cifrado por hardware si el terminal lo soporta).
* **iOS**: Almacenamiento protegido dentro del Keychain del sistema operativo.

#### Reglas de Almacenamiento
* Solo se almacena el JWT con la clave `uecg_jwt_token`.
* Queda terminantemente prohibido almacenar contraseñas en texto plano dentro del dispositivo.
* Toda información de caché no sensible (como listados de materias u horarios) se puede guardar en una base de datos local (Hive/Isar) sin encriptar, siempre y cuando no comprometa datos personales o académicos protegidos por leyes de privacidad de menores.

---

## 2. Gestión de Sesión y Ciclo de Vida del Token

### Cierre de Sesión Seguro
Para prevenir la usurpación de cuenta en dispositivos compartidos, el cierre de sesión debe invalidar todos los tokens locales:

1. **Borrado Físico**: Se debe llamar a `SecureStorageService.deleteToken()`.
2. **Actualización de Estado**: Se debe actualizar el estado del provider global de Riverpod (`authProvider`) a `AuthStatus.unauthenticated` y resetear el objeto `user` a `null`.
3. **Navegación**: GoRouter debe redirigir al usuario al `/welcome` de forma reactiva.

> [!CAUTION]
> **Riesgo de Seguridad Actual**:
> La implementación actual en las vistas de perfil solo ejecuta la navegación `context.go('/welcome')`. Esto deja el token intacto en el almacenamiento seguro. Se debe corregir esto modificando el widget a un `ConsumerWidget` y llamando al notifier del proveedor de autenticación.

---

## 3. Seguridad de Red y HTTPS

* **HTTP Enforcing**: Todas las peticiones salientes dirigidas a la API deben utilizar estrictamente el protocolo seguro `HTTPS`. El cliente Dio rechazará conexiones en texto plano (`http://`) en entornos de producción.
* **SSL Pinning (Roadmap)**: En etapas avanzadas de despliegue, se implementará SSL Pinning para validar los certificados SSL de los servidores del backend y evitar ataques de intermediarios (Man-in-the-Middle) en redes públicas (por ejemplo, el Wi-Fi de la institución educativa).

---

## 4. Ofuscación y Compilación de Producción

Durante el despliegue del binario para producción en Google Play Store y Apple App Store, se debe aplicar ofuscación de código para dificultar la ingeniería inversa en el código Dart compilado.

### Comando de Compilación Segura
Para compilar la aplicación, se debe usar la bandera de ofuscación de Flutter:

```bash
# Android
flutter build apk --obfuscate --split-debug-info=build/app/outputs/symbols

# iOS
flutter build ipa --obfuscate --split-debug-info=build/ios/outputs/symbols
```

Esta configuración sustituye nombres de variables, clases y métodos por caracteres aleatorios no legibles en los binarios finales.
