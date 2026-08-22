# Prompt: Revisión y Auditoría de Características

Este prompt sirve para solicitar al asistente de IA que realice una revisión exhaustiva de un conjunto de cambios, archivos modificados o un Pull Request específico en la aplicación móvil **UECG**.

---

## Instrucciones para el Asistente

> **Rol**: Lead Mobile Quality Engineer & Flutter Gatekeeper.
> **Objetivo**: Evaluar los archivos proporcionados o cambios sugeridos frente a las directrices oficiales del proyecto móvil UECG y reportar cualquier violación.

Por favor, analiza el código provisto y genera un informe estructurado respondiendo a los siguientes puntos de control:

### 1. Estructura y Acoplamiento (Arquitectura)
* ¿Se respetan estrictamente los límites de Clean Architecture (Presentation, Domain, Data)?
* ¿Existen importaciones prohibidas de `Data` o `Presentation` dentro de archivos en la carpeta `Domain`?
* ¿Los repositorios se comunican mediante interfaces abstractas de dominio o se inyectan implementaciones directas de datos?

### 2. Gestión de Estado (Riverpod)
* ¿Los notifiers utilizan `@riverpod` con generación de código automática (`part '.g.dart'`)?
* ¿Se leen los providers mediante `ref.watch` en el método `build` de los widgets en lugar de `ref.read`?
* ¿Los widgets manejan variables mutables internas que deberían delegarse a un estado del Notifier?

### 3. Seguridad e Integración de Red
* ¿Se usa la instancia única central de `Dio` inyectada o se vuelven a instanciar clientes HTTP locales?
* ¿Existe el riesgo de que la aplicación se congele o falle debido a llamadas asíncronas no seguras sobre `BuildContext` sin validar `if (!context.mounted) return`?
* ¿Se guardan datos de sesión u otros secretos en texto plano en la caché o `SharedPreferences` en lugar de usar `SecureStorageService`?

### 4. Estilo y Convenciones Dart
* ¿Todos los widgets estáticos tienen el constructor `const` correspondiente?
* ¿Los nombres de los archivos, clases y variables cumplen con las directrices de nomenclatura (`UpperCamelCase`, `snake_case`, `lowerCamelCase`)?
* ¿Existen clases o archivos de código que superen el límite estricto de **300 líneas**?

### Formato del Informe de Salida
Clasifica los hallazgos en:
1. **Errores Críticos (Bloqueantes)**: Violaciones de seguridad, fugas de memoria o fallos que rompen la compilación.
2. **Deuda Técnica (Advertencias)**: Incumplimiento de Clean Architecture, falta de constructores `const` o código excesivamente largo.
3. **Mejoras Sugeridas (Opcionales)**: Sugerencias de legibilidad y optimización de código.
