# Prompt Reutilizable: Refactorización y Saneamiento de Deuda Técnica

*Copie y envíe este prompt a un agente de Inteligencia Artificial para refactorizar deuda técnica y malas prácticas en un módulo específico.*

---

```markdown
Actúa como Ingeniero Senior de Refactorización y Calidad de Código Frontend.

Tu objetivo es refactorizar a fondo el módulo `<NOMBRE_DEL_MÓDULO>` (ubicado en `src/features/<FEATURE_DIR>`) para erradicar la deuda técnica identificada, eliminar los antipatrones de diseño y asegurar que el código se alinee al 100% con nuestras pautas de codificación y convenciones.

### Deuda Técnica Específica a Corregir
`<DESCRIPCIÓN_DE_LA_DEUDA_DETECTADA>` (ej: uso de `any` en la tabla, consultas inline useQuery en la UI, borrado simulado en caché local en lugar de mutación HTTP).

---

### Directivas Obligatorias de la Refactorización

Debes implementar la refactorización siguiendo estas directrices rigurosas sin alterar el comportamiento esperado del negocio:

#### 1. Saneamiento Completo de Tipos (TypeScript Estricto)
* Analiza las firmas de componentes, props e interfaces del módulo.
* Elimina cualquier declaración del tipo laxo `any`. Define tipos de TypeScript específicos para cada prop, callback y respuesta de datos.
* Si el archivo contiene `any` por prisa de desarrollo, determina su estructura real a partir de su uso en el renderizado y escribe la interfaz de manera exhaustiva.

#### 2. Desacoplamiento de Lógica de Servidor (Custom Hooks)
* Si encuentras llamadas de `useQuery` o `useMutation` inline en el cuerpo de un componente visual (ej. en el panel o tabla), extráelas de inmediato hacia un hook personalizado co-localizado en `src/features/<FEATURE_DIR>/hooks/use-<FEATURE_DIR>-data.ts`.
* El componente visual debe quedar purificado: solo debe recibir la información y callbacks a través de props, actuando como componente presentacional puro.

#### 3. Vinculación de Mutaciones Reales (Data Persistence)
* Si detectas alguna simulación visual de caché local en el enrutamiento o en eventos de click/borrado (ej. manipulación de caché mediante `queryClient.setQueryData` huérfana de llamada HTTP), reemplázala por una mutación real.
* Configura la mutación utilizando el servicio de la API, dispara la llamada HTTP real y, en el callback `onSuccess`, invalida el caché de forma limpia para forzar al sistema a sincronizarse con el backend de manera segura.

#### 4. Co-localización de Animaciones e Interactividad
* Asegura que los modales o drawers del módulo utilicen el patrón de Portal de React (`createPortal`) y se animen fluidamente con `framer-motion` (entradas rápidas con Springs).
* Todo interactivo debe ser semánticamente accesible, incluyendo estados de carga visuales y cursor pointer.

---

### Plan de Refactorización Paso a Paso
Antes de proceder a modificar cualquier línea de código, analiza los archivos afectados del módulo y presenta un plan secuencial detallando las modificaciones exactas y firmas de tipos propuestas para cada archivo. Una vez aprobado, ejecuta la refactorización de manera ordenada, compilando y verificando en cada paso.
```
