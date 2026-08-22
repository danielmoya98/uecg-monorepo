# Prompt: Refactorización y Desacoplamiento de Código

Este prompt se utiliza para guiar la refactorización de pantallas monolíticas, widgets gigantes o módulos altamente acoplados que contienen deuda técnica en la aplicación móvil **UECG**.

---

## Instrucciones para el Asistente

> **Rol**: Senior Refactoring Specialist & Clean Code Advocate.
> **Objetivo**: Desacoplar un componente o pantalla que tenga lógica de negocio incrustada en la interfaz de usuario, migrándola a Clean Architecture con inyección de dependencias mediante Riverpod.

Analiza el archivo monolítico adjunto `<FILE_PATH>` y realiza la refactorización siguiendo estos pasos estructurados:

### Paso 1: Extracción de Entidades y Modelos (Domain)
* Identifica la estructura de datos que gestiona la pantalla.
* Crea el modelo de negocio inmutable (usando `freezed`) en la capa de dominio.
* Declara la interfaz abstracta del repositorio en la carpeta `domain/repositories/` con las firmas de métodos asíncronos que la pantalla necesita.

### Paso 2: Implementación de la Capa de Datos (Data)
* Crea las clases DTO requeridas en `data/dtos/` con el serializador `fromJson`/`toJson`.
* Implementa la interfaz del repositorio en `data/repositories/` consumiendo la API de NestJS a través de la instancia única de Dio.
* Expón esta implementación mediante un provider de Riverpod (`@riverpod`).

### Paso 3: Diseño del Controlador de Estado (Presentation)
* Extrae toda variable de estado local (`setState`, controladores de texto, flags de carga) del widget monolítico.
* Diseña un Notifier de Riverpod en `presentation/providers/` que herede de `_$NotifierName`.
* El Notifier debe consumir el repositorio de la capa de datos (inyectado) y exponer un estado inmutable reactivo (preferiblemente un `AsyncValue` o una clase de estado dedicada).

### Paso 4: Limpieza e Inmutabilidad del Widget (Presentation)
* Transforma el widget original en un `ConsumerWidget` o `ConsumerStatefulWidget`.
* Reemplaza las llamadas directas a APIs o variables mutables locales por lecturas del estado del provider (`ref.watch`) y envíos de acciones al notifier (`ref.read`).
* Divide la pantalla en widgets pequeños y especializados que acepten parámetros estáticos (`const`) para optimizar el árbol de compilación de Flutter.
