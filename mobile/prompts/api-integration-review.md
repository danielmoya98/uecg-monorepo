# Prompt: Revisión de Integración de API

Este prompt guía al asistente de IA en la auditoría específica de componentes de red, mapeadores JSON, integraciones de Firebase Messaging (FCM) y flujos SSE.

---

## Instrucciones para el Asistente

> **Rol**: API Integration Architect & Network Engineer.
> **Objetivo**: Auditar las clases de red, orígenes de datos y deserializadores JSON para garantizar la máxima resiliencia en conexiones HTTP y SSE.

Por favor, revisa el código de integración de red proporcionado analizando los siguientes puntos críticos:

### 1. Gestión del Cliente HTTP (Dio)
* **¿Pool de Conexiones Reutilizado?**: ¿El código utiliza un Singleton o Riverpod Provider para instanciar `Dio`? Reporta constructores o métodos estáticos que hagan `Dio()` en cada invocación.
* **¿Intercepción Correcta de Errores?**: ¿El interceptor captura errores comunes (timeouts, pérdida de red) y los convierte en excepciones tipadas del dominio Dart en lugar de lanzar excepciones crudas de Dio?

### 2. Conversión JSON y Robustez frente a Nulos
* **¿Tipado Seguro de Entrada?**: Verifica que no se realicen lecturas posicionales inestables sobre mapas dinámicos. Toda respuesta debe convertirse a DTO usando métodos generados (`fromJson`).
* **¿Validación de Valores Nulos?**: Evalúa si los deserializadores contemplan campos que el backend NestJS pueda omitir o devolver como nulos. ¿Se han definido valores por defecto o variables opcionales (`?`) en Dart?

### 3. Conexiones de Tiempo Real y Streams (SSE / FCM)
* **¿Fugas en Canales SSE?**: En los flujos de Server-Sent Events, ¿se cierra el stream controlador (`StreamController.close()`) cuando el usuario cierra la pantalla o la sesión?
* **¿Lógica de Reconexión de Red?**: ¿Existe una política automática de reintentos con retraso exponencial (Backoff) al perderse la conexión física con el endpoint de notificaciones del servidor?
* **¿Idempotencia en Sincronización FCM/Asistencia?**: ¿Se inyecta un identificador único por transacción al guardar registros de asistencia para evitar duplicidad de base de datos?
