# Prompt: Crear Nueva Característica (Clean Architecture + Riverpod)

Este prompt debe ser copiado e ingresado al asistente de IA cuando se le asigne la tarea de desarrollar un nuevo módulo o característica en la aplicación móvil **UECG**.

---

## Instrucciones para el Asistente

> **Rol**: Principal Mobile Architect & Flutter Expert.
> **Objetivo**: Generar una nueva característica llamada `<FEATURE_NAME>` respetando la estructura Clean Architecture y los estándares del proyecto móvil UECG.

### 1. Estructura de Directorios a Crear
Crea la siguiente estructura de carpetas en `lib/features/<feature_name>/` (reemplaza `<feature_name>` con el nombre en snake_case):

```
lib/features/<feature_name>/
├── data/
│   ├── datasources/
│   │   ├── <feature_name>_remote_data_source.dart
│   │   └── <feature_name>_local_data_source.dart
│   ├── dtos/
│   │   └── <feature_name>_dto.dart          # Freezed JSON Serializer
│   └── repositories/
│       └── <feature_name>_repository_impl.dart
├── domain/
│   ├── models/
│   │   └── <feature_name>_model.dart        # Freezed pure business entity
│   └── repositories/
│       └── <feature_name>_repository.dart   # Abstract contract class
└── presentation/
    ├── providers/
    │   └── <feature_name>_provider.dart     # Riverpod Notifier
    ├── screens/
    │   └── <feature_name>_screen.dart
    └── widgets/
```

### 2. Contratos y Requisitos de Código

1. **Inmutabilidad (Freezed)**: Define el modelo de dominio en `domain/models/` y el DTO en `data/dtos/` utilizando `@freezed`. Implementa la conversión DTO -> Dominio (`toDomain()`) dentro del archivo DTO.
2. **Capa Domain**: Crea el contrato abstracto del repositorio en `domain/repositories/` libre de librerías como `Dio` o `Isar`. Solo expone tipos puros de Dart y del dominio.
3. **Capa Data**:
   - Implementa el repositorio en `data/repositories/` heredando de la clase abstracta de dominio.
   - Consume los datos desde la API de NestJS usando el cliente de red `Dio` inyectado a través del provider global (`ref.watch(dioClientProvider)` o la instancia única de Dio).
   - Captura y propaga excepciones específicas.
4. **Capa Presentation**:
   - Desarrollar el notifier utilizando las anotaciones del generador de Riverpod (`@riverpod` o `@Riverpod(keepAlive: true)`).
   - Evita la manipulación de estados de carga y error en los widgets. Expón un estado de tipo `AsyncValue` desde el provider para que la UI use de forma declarativa `state.when(data: ..., error: ..., loading: ...)`.
   - Modela la pantalla y widgets utilizando el tema visual institucional Swiss Style (botones rectangulares, tipografía Jost, colores de `AppTheme`).

### 3. Código Boilerplate para Empezar
Proporciona el código de plantilla inicial para el modelo de Dominio, la interfaz de Repositorio y el Notifier de Riverpod para esta nueva característica.
