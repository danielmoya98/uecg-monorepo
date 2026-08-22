# Integración de API Móvil UECG

Este documento detalla la estructura de comunicación HTTP, manejo de endpoints, interceptores y la integración futura de Server-Sent Events (SSE) con el backend NestJS.

---

## 1. Configuración de API Client (`Dio`)

La aplicación utiliza el paquete `dio` para realizar peticiones HTTP de forma asíncrona.

* **Dirección Base (Base URL)**: `https://ue-cheguevara-backend-1.onrender.com/api/v1`
* **Tiempos de Espera (Timeouts)**:
  - `connectTimeout`: 10 segundos
  - `receiveTimeout`: 10 segundos
* **Tipo de Respuesta**: JSON deserializable.

### Interceptor de Autenticación
El cliente HTTP incorpora un interceptor dinámico que realiza dos tareas esenciales:

1. **Inyección de JWT**: En cada petición saliente (`onRequest`), busca un token guardado en `SecureStorageService`. Si existe, añade la cabecera `Authorization: Bearer <token>`.
2. **Control de Errores 401**: En caso de recibir un error `401 Unauthorized` (`onError`), interpreta que el token ha expirado o es inválido, limpia el token del dispositivo local llamando a `SecureStorageService.deleteToken()`, e interrumpe la llamada.

> [!WARNING]
> **Deuda Técnica de Instanciación**:
> Actualmente, `ApiClient.dio` es una propiedad estática que crea y configura un nuevo objeto `Dio` en cada llamada. Esto destruye el caché de conexiones TCP del dispositivo y puede sobrecargar la memoria.
> **Solución Recomenda**: Migrar a una instancia inyectada a través de un Riverpod Provider con `keepAlive`:
> ```dart
> @riverpod
> Dio dioClient(DioClientRef ref) {
>   final dio = Dio(...);
>   dio.interceptors.add(...);
>   return dio;
> }
> ```

---

## 2. Endpoints Implementados

| Método | Endpoint | Cabeceras | Cuerpo de Petición (JSON) | Respuesta Esperada |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/login` | Ninguna | `{"email": "...", "password": "..."}` | `{"data": {"access_token": "...", "user": {...}}}` |
| **POST** | `/auth/register-guardian` | Ninguna | `{"ci": "...", "recoveryEmail": "...", "password": "..."}` | `{"data": {"access_token": "...", "user": {...}}}` |
| **POST** | `/auth/register-student` | Ninguna | `{"ci": "...", "birthDate": "...", "recoveryEmail": "...", "password": "..."}` | `{"data": {"access_token": "...", "user": {...}}}` |
| **PATCH** | `/auth/fcm-token` | `Authorization` | `{"fcmToken": "..."}` | `{"status": "success"}` |
| **POST** | `/auth/forgot-password`| Ninguna | `{"identifier": "..."}` | Mensaje confirmando envío de código |
| **POST** | `/auth/reset-password` | Ninguna | `{"identifier": "...", "code": "...", "newPassword": "..."}` | `{"status": "success"}` |
| **GET** | `/guardians/me` | `Authorization` | Ninguno | `{"data": {"id": "...", "name": "...", "students": [...]}}` |

---

## 3. Plan de Integración: Server-Sent Events (SSE)

El backend NestJS utiliza SSE para notificar en tiempo real cambios de asistencia y comunicados. En la app móvil, el consumo de SSE se implementará en la **Fase 3** del Roadmap.

### Estrategia de Consumo
En lugar de depender de paquetes externos con alto riesgo de obsolescencia, se recomienda utilizar el soporte de streams de `Dio` o el cliente HTTP estándar de Dart (`dart:io` `HttpClient`).

#### Ejemplo de Implementación del Servicio SSE
```dart
import 'dart:async';
import 'dart:convert';
import 'dart:io';

class SseClientService {
  final _client = HttpClient();
  StreamController<Map<String, dynamic>>? _controller;
  
  Stream<Map<String, dynamic>> connect(String token) async* {
    _controller = StreamController<Map<String, dynamic>>();
    
    try {
      final request = await _client.getUrl(Uri.parse('https://ue-cheguevara-backend-1.onrender.com/api/v1/notifications/sse'));
      request.headers.set('Accept', 'text/event-stream');
      request.headers.set('Authorization', 'Bearer $token');
      request.headers.set('Cache-Control', 'no-cache');
      
      final response = await request.close();
      
      response.transform(utf8.decoder).transform(const LineSplitter()).listen((line) {
        if (line.startsWith('data:')) {
          final dataString = line.substring(5).trim();
          final data = json.decode(dataString);
          _controller?.add(data);
        }
      });
      
      yield* _controller!.stream;
    } catch (e) {
      _controller?.addError(e);
      // Implementar lógica de reconexión con Backoff Exponencial
    }
  }
  
  void disconnect() {
    _controller?.close();
    _client.close(force: true);
  }
}
```
Este stream de eventos será conectado a un provider de Riverpod (`SseProvider`) de modo que la interfaz de usuario se actualice reactivamente sin requerir peticiones de tipo *polling*.
