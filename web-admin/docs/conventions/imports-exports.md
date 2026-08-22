# Reglas de Imports y Exports - UECG React Vite

Este documento contiene las normas obligatorias para la importación y exportación de módulos, con el fin de evitar acoplamientos innecesarios, importaciones circulares y dependencias cruzadas complejas.

## 1. Uso de Alias de Ruta (`@/*`)

Se debe utilizar el alias global `@/*` para hacer referencia al directorio raíz `src/`. Esto hace que los archivos sean fáciles de mover y leer, y evita rutas relativas excesivamente profundas.

* **Ejemplo Correcto:** `import { api } from '@/shared/api/client'`
* **Ejemplo Incorrecto:** `import { api } from '../../../../shared/api/client'`

### Excepción
Se permiten rutas relativas cortas (`./` o `../`) **únicamente** cuando se importan elementos co-localizados dentro de la misma subcarpeta o capa de la misma característica (ej. importar un servicio desde un hook co-localizado en el mismo feature).

---

## 2. Límites y Fronteras de Features (Decoupling)

La regla de oro de la arquitectura feature-based es el **desacoplamiento**.

* **Importaciones de Otras Features:** Queda terminantemente **prohibido** realizar importaciones internas cruzadas directamente entre diferentes características. 
  * **❌ INCORRECTO:** `import { SomeComponent } from '@/features/auth/components/SomeComponent'` desde `features/academic-years`.
* **Uso Compartido (Shared):** Si un componente, hook o utilidad es requerido por múltiples características, este debe promoverse a la carpeta global `src/shared/`.
* **Comunicación Lícita:** La interacción entre features debe ocurrir exclusivamente mediante la navegación de rutas (con parámetros en la URL) o consumiendo estados globales centralizados en `src/shared/store` o a través de la invalidación de claves de consulta (`queryKey`) comunes.

---

## 3. Puntos de Entrada Públicos (`index.ts`)

Cada directorio de característica en `src/features/[feature]/` debe contar con un archivo `index.ts` que actúe como su API pública.

* **Responsabilidad:** Este archivo exporta selectivamente solo aquellos componentes, hooks o tipos de la característica que necesitan ser consumidos desde el exterior (generalmente por las páginas de rutas en `src/app/router/`).
* **Ejemplo de `src/features/academic-years/index.ts`:**
  ```typescript
  export { default as AcademicYearDrawer } from './components/academic-year-drawer';
  export * from './components/academic-years-ui';
  export { useAcademicYearsData } from './hooks/use-academic-years-data';
  export * from './types/academic-years.types';
  ```

---

## 4. Orden e Higiene de Importaciones

Las importaciones en la cabecera de cada archivo deben agruparse y ordenarse de la siguiente manera, dejando una línea en blanco entre cada grupo:

1. **Importaciones Externas de Terceros:** React, librerías de enrutamiento, librerías de iconos, animaciones, etc. (ej. `react`, `@tanstack/react-query`, `lucide-react`, `framer-motion`).
2. **Importaciones de Dominio (Alias `@/*`):** Componentes, hooks y utilidades de las capas globales.
3. **Importaciones Locales de Feature:** Servicios, subcomponentes o tipos del propio módulo.
4. **Hojas de Estilos y Activos:** Archivos CSS, imágenes o vectores.
