# Arquitectura del Proyecto Móvil UECG

Este documento define las directrices de la arquitectura de software del cliente móvil Flutter de la **U.E. Ernesto Che Guevara (UECG)**.

---

## 1. Patrón Arquitectónico: Clean Architecture

El proyecto se rige por los principios de **Clean Architecture**, dividiendo cada módulo funcional en tres capas bien diferenciadas: **Data (Datos)**, **Domain (Dominio)** y **Presentation (Presentación)**. El flujo de dependencia es estrictamente unidireccional hacia adentro (las capas externas dependen de las internas, pero las internas nunca conocen a las externas).

```
┌─────────────────────────────────────────────────────────────┐
│                       PRESENTATION                          │
│        (Widgets, Screens, Controllers/Notifiers)            │
└──────────────┬──────────────────────────────────────────────┘
               │  Escucha y Observa
               ▼
┌─────────────────────────────────────────────────────────────┐
│                         DOMAIN                              │
│       (Use Cases, Business Models, Repository Interfaces)   │
└──────────────▲──────────────────────────────────────────────┘
               │  Implementa interfaces de Dominio
               │
┌──────────────┴──────────────────────────────────────────────┐
│                          DATA                               │
│ (Data Sources, Repositories Impl, DTOs/JSON Serializers)   │
└─────────────────────────────────────────────────────────────┘
```

### Capa de Dominio (Domain) - *El Corazón*
* **Responsabilidad**: Contiene las entidades puras del negocio y las interfaces (contratos) de los repositorios. Es código Dart puro, libre de dependencias de Flutter, bases de datos o clientes HTTP.
* **Componentes**:
  - **Models/Entities**: Modelos de datos inmutables que representan las entidades del negocio (e.g. `User`, `AttendanceRecord`).
  - **Repositories (Interfaces)**: Clases abstractas que definen qué operaciones de datos están disponibles, sin detallar el origen (si vienen de API o almacenamiento local).

### Capa de Datos (Data) - *Los Detalles*
* **Responsabilidad**: Suministra los datos de negocio a la capa de dominio. Realiza las llamadas HTTP, deserialización JSON y lecturas/escrituras en base de datos local.
* **Componentes**:
  - **Data Sources**: Proveedores de datos crudos. Un `RemoteDataSource` maneja llamadas a la API de NestJS; un `LocalDataSource` maneja almacenamiento en Hive/Isar.
  - **Repositories (Implementations)**: Clases concretas que implementan los contratos definidos en el dominio (e.g. `AuthRepositoryImpl`). Orquestan la lógica de leer de la caché si la red falla (Offline First).
  - **DTOs (Data Transfer Objects)**: Modelos que representan exactamente las respuestas JSON del backend. Incluyen serializadores (`fromJson`/`toJson`).

### Capa de Presentación (Presentation) - *La Interfaz*
* **Responsabilidad**: Renderizar la interfaz de usuario en la pantalla y reaccionar a las interacciones del usuario.
* **Componentes**:
  - **Screens**: Páginas completas (e.g., `LoginScreen`) que se enlazan mediante GoRouter.
  - **Views**: Fragmentos visuales específicos del rol o de la pantalla (e.g., `StudentHomeView`).
  - **Providers / Notifiers**: Controladores de estado basados en Riverpod que extraen la lógica de negocio de los widgets y mantienen el estado de la UI de forma reactiva.

---

## 2. Estrategia de Estado: Riverpod

El control de estado se gestiona mediante **Riverpod** utilizando el generador automático de código (`riverpod_generator`).

### Principios del Manejo de Estado

1. **Unidireccionalidad (Unidirectional Data Flow)**:
   - El Widget lee el estado expuesto por un Provider.
   - El Widget envía eventos o acciones al Notifier (e.g., `notifier.login(...)`).
   - El Notifier muta el estado interno.
   - El Widget se reconstruye automáticamente al detectar el cambio de estado.
2. **Inmutabilidad estricta**:
   - El estado siempre se sobrescribe por completo usando copias (`copyWith`) o nuevos objetos inmutables. Nunca se mutan colecciones o variables miembro directamente.
3. **Evitar lógica en los Widgets**:
   - Ningún widget debe realizar llamadas HTTP directas ni manipular controladores de persistencia. Toda acción asíncrona se delega al Provider.
4. **Ciclo de vida del estado**:
   - Por defecto, usar providers auto-eliminables (`@riverpod` sin parámetros) para evitar fugas de memoria al salir de una pantalla.
   - Usar `@Riverpod(keepAlive: true)` únicamente para estados globales de larga duración como la sesión del usuario (`authProvider`) o la conectividad de red.

### Estructura de un Notifier Típico
```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'counter_provider.g.dart';

@riverpod
class Counter extends _$Counter {
  @override
  int build() => 0; // Estado inicial

  void increment() {
    state = state + 1; // Mutación del estado
  }
}
```

---

## 3. Estructura de Directorios

El código fuente de la app se organiza en una arquitectura basada en características (**Feature-first**), combinada con un núcleo transversal (**Core**):

```
lib/
├── core/                       # Componentes compartidos y transversales
│   ├── errors/                 # Excepciones personalizadas e inyectables
│   ├── network/                # Cliente HTTP (Dio, interceptores, SSE)
│   ├── routes/                 # Configuración de GoRouter y guardas de seguridad
│   ├── services/               # Servicios del sistema (Secure Storage, Notificaciones)
│   ├── theme/                  # Tokens de diseño y tema Swiss Style
│   ├── utils/                  # Extensiones y funciones auxiliares
│   └── widgets/                # Componentes visuales genéricos (SwissCard, etc.)
│
└── features/                   # Módulos funcionales
    ├── auth/                   # Autenticación y Registro
    │   ├── data/               # Repositorios y orígenes de datos
    │   ├── domain/             # Contratos de repositorios y modelos de dominio
    │   └── presentation/       # Pantallas, vistas y Riverpod Providers
    ├── dashboard/              # Panel principal dividido por roles
    ├── onboarding/             # Splash Screen, Welcome y Onboarding inicial
    └── profile/                # Gestión de perfil académico y familiar
```

### Regla de Oro sobre Importaciones
Las importaciones de archivos entre diferentes características deben limitarse estrictamente. Si un módulo A necesita datos del módulo B (por ejemplo, el dashboard necesita el perfil de usuario del módulo `auth`), debe consumirse a través de los providers globales expuestos en `core` o a través del `authProvider` importado de forma limpia, nunca acoplando clases internas de presentación.
