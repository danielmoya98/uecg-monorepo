# Sincronización y Caché Offline

Este documento define la arquitectura y las estrategias recomendadas para habilitar soporte offline y sincronización de datos en el cliente móvil **UECG**.

---

## 1. Estrategia General: Cache-First & Read-Through

La aplicación móvil operará bajo un modelo híbrido según la naturaleza de la información:

```
                  ┌────────────────────────┐
                  │      Petición UI       │
                  └───────────┬────────────┘
                              │
              Lecturas        ▼        Escrituras
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌───────────────────────┐            ┌───────────────────────┐
│     Local Cache       │            │  Cola Offline (Queue) │
│     (Isar/Hive)       │            └──────────┬────────────┘
└───────────┬───────────┘                       │
            │ (Si expira/falta)                 │ (Al recuperar red)
            ▼                                   ▼
┌───────────────────────┐            ┌───────────────────────┐
│      API NestJS       │            │      API NestJS       │
└───────────────────────┘            └───────────────────────┘
```

1. **Lectura de Datos Académicos (Horarios, Calificaciones, Perfil)**:
   - Se aplicará **Cache-First**. La interfaz siempre intentará renderizar los datos guardados localmente para asegurar tiempos de respuesta instantáneos.
   - En segundo plano, la aplicación realizará una llamada a la API (`Read-Through`) para actualizar la base de datos local si hay conexión de red disponible.
2. **Escritura de Datos Críticos (Registro de Asistencia Escaneada por QR)**:
   - Si no hay red, la asistencia se almacena de inmediato en una cola de peticiones offline persistente.
   - El widget recibe una confirmación visual de "Guardado en Cola Offline".
   - Al detectar que la conectividad a internet ha retornado, la cola se vacía secuencialmente en segundo plano enviando las peticiones pendientes al backend NestJS.

---

## 2. Selección de Base de Datos Local

Se prefiere el uso de **Isar Database** (o en su defecto **Hive**) sobre SQLite por las siguientes razones:

* **Rendimiento**: Isar es una base de datos NoSQL ultra-rápida y ligera escrita en Rust con soporte nativo de índices y consultas asíncronas multitarea en Dart.
* **Tipado Seguro**: Permite guardar objetos Dart directamente sin necesidad de escribir adaptadores SQL complejos o esquemas de migración manuales tediosos.
* **Soporte de Streams**: Expone consultas como Streams de Dart, permitiendo que la interfaz de usuario se actualice en tiempo real apenas cambia la base de datos local.

---

## 3. Cola de Operaciones Offline (Sync Queue)

Para el registro de asistencias por parte de los docentes en zonas de baja conectividad dentro del centro educativo, se diseñará un sistema de almacenamiento y reintento:

### Modelo de Objeto en Cola
```dart
class OfflineRequest {
  final String id;              // UUID autogenerado
  final String path;            // Ruta del endpoint (e.g. '/attendance/register')
  final Map<String, dynamic> body; // Payload de la petición
  final DateTime timestamp;     // Momento de captura
  final int retryCount;         // Contador de reintentos
}
```

### Protocolo de Sincronización
1. **Detección de Red**: Utilizar el paquete `connectivity_plus` para monitorear los cambios de conectividad.
2. **Despacho Secuencial**:
   - Al recuperar internet, procesar los elementos de la cola respetando estrictamente el orden cronológico de registro (FIFO).
   - El backend NestJS debe implementar **Idempotencia** (por ejemplo, verificando si el par `studentId` + `classId` + `date` ya fue registrado en la base de datos) para evitar duplicados en caso de retransmisión por pérdidas de paquetes.
3. **Manejo de Conflictos**:
   - Si la petición falla por problemas de red, se incrementa `retryCount` y se vuelve a encolar con un retraso exponencial (Exponential Backoff).
   - Si falla por validación de datos (código 400), se retira de la cola y se genera una entrada en el historial de "Errores de Sincronización" para revisión del docente.
