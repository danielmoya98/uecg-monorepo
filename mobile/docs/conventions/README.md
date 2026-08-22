# Convenciones de Código y Estilo UECG

Este documento establece las directrices de formateo, nomenclatura, linter y gestión de recursos que deben cumplir todas las contribuciones al proyecto móvil **UECG**.

---

## 1. Reglas de Estilo de Dart y Flutter

Se adoptan los estándares recomendados por el equipo de Google Dart:

* **Nomenclatura (Naming)**:
  - **Archivos y Directorios**: `snake_case` (e.g. `login_screen.dart`, `auth_repository.dart`).
  - **Clases, Mixins y Enums**: `UpperCamelCase` (e.g. `StudentDashboard`, `AuthStatus`).
  - **Variables y Funciones**: `lowerCamelCase` (e.g. `currentIndex`, `checkAuthStatus()`).
  - **Constantes**: `lowerCamelCase` (e.g. `swissBlue`, `connectTimeout`).
* **Límites de Líneas**: Evitar archivos que superen las 300 líneas de código. Si una pantalla crece demasiado, debe fragmentarse en sub-widgets y vistas independientes en lugar de mantener lógica anidada masiva.
* **Uso de Constructores `const`**: Declarar siempre como `const` los widgets estáticos que no cambien de estado. Esto mejora el rendimiento del recolector de basura de Dart, evitando la reconstrucción innecesaria del árbol de widgets.

---

## 2. Formateo y Linter

La validación estática se realiza mediante el linter oficial y el formateador integrado.

### Herramienta de Formateo
Antes de realizar cualquier commit o pull request, es obligatorio pasar el formateador de Dart para estandarizar el espaciado e indentación:

```bash
flutter format lib/
```

### Configuración del Linter (`analysis_options.yaml`)
El archivo [analysis_options.yaml](file:///home/daniel/AndroidStudioProjects/uecg_app/analysis_options.yaml) debe estar configurado para ser estricto y prevenir malas prácticas habituales.

#### Reglas Clave a Cumplir
* `prefer_const_constructors`: Advierte sobre constructores que deberían declararse const.
* `avoid_print`: Prohíbe el uso de `print()` en producción (utilizar `logger` o `debugPrint`).
* `always_declare_return_types`: Exige definir el tipo de retorno en métodos y funciones.
* `use_build_context_synchronously`: Evita llamadas asíncronas que usen `BuildContext` después de un await sin validar si el widget sigue montado en pantalla (`if (!context.mounted) return`).

---

## 3. Convenciones de Recursos (Assets)

* **Formato de Archivo**: Se prefiere el formato vectorial SVG para todos los iconos, logotipos y siluetas complejas para evitar pixelado en pantallas de alta resolución.
* **Nomenclatura**: Todos los recursos gráficos colocados en la carpeta `assets/` deben nombrarse en minúsculas y con guiones bajos (`snake_case`) (e.g. `lg.svg`, `family.svg`).
* **Declaración**: Todo asset debe registrarse en la sección `flutter: assets:` del archivo `pubspec.yaml` indicando su ruta específica.
* **Uso en Código**: Utilizar la biblioteca `flutter_svg` para renderizar archivos vectoriales:
  ```dart
  SvgPicture.asset(
    'assets/lg.svg',
    width: 170,
    colorFilter: const ColorFilter.mode(AppTheme.pureWhite, BlendMode.srcIn),
  )
  ```
