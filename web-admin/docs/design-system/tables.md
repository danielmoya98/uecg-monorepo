# Tablas y Listados Geométricos (tables.md)

Este documento define el diseño visual y estructural de las tablas de datos de la aplicación. En el **Estilo Suizo**, las tablas son el lienzo de visualización técnica por excelencia. Se caracterizan por el colapso de bordes, la tipografía compacta y la ausencia total de bordes redondeados.

---

## 1. Estructura y Estilos HTML (Table Boilerplate)

Toda tabla de datos debe usar la clase `border-collapse`, forzando a que las celdas se toquen físicamente por líneas de `1px` de grosor, reforzando la sensación de plano técnico.

### Estructura de Clases Autorizada:
*   **Tabla Principal:** `<table className="w-full text-left border-collapse">`
*   **Cabecera de Fila (`<thead>`):** `<tr className="bg-gray-50 border-b border-uecg-line">`
*   **Cabecera de Celda (`<th>`):** `<th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">`
*   **Filas del Cuerpo (`<tr>`):** `<tr className="border-b border-uecg-line hover:bg-blue-50/20 transition-colors bg-white h-16">`
*   **Celda de Datos (`<td>`):** `<td className="px-6 py-3 border-r border-uecg-line">`

> [!IMPORTANT]
> Se debe mantener una consistencia absoluta en el espaciado: relleno horizontal de `px-6` y relleno vertical de `py-4` para headers y `py-3` para celdas de datos. Las celdas deben estar separadas lateralmente por un hilo de borde derecho (`border-r border-uecg-line`).

---

## 2. Animación de Fila Fluida (`motion.tbody`)

Para dar una sensación de fluidez y modernidad premium en actualizaciones asíncronas, las tablas aprovechan la capacidad de **Framer Motion Layout** para animar el reordenamiento de filas automáticamente cuando se añaden, eliminan o filtran registros.

### Código Autorizado:
```tsx
import { motion } from "framer-motion";

export const UnifiedTable = ({ items }: { items: any[] }) => (
  <div className="border border-uecg-line bg-white w-full overflow-hidden shadow-sm">
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-uecg-line">
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">Identificador</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">Detalles</th>
          </tr>
        </thead>
        <motion.tbody layout>
          {items.map((item) => (
            <motion.tr
              layout
              key={item.id}
              className="border-b border-uecg-line hover:bg-blue-50/20 transition-colors bg-white h-16"
            >
              <td className="px-6 py-3 border-r border-uecg-line font-mono text-xs font-bold">{item.id}</td>
              <td className="px-6 py-3 border-r border-uecg-line">{item.name}</td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  </div>
);
```

---

## 3. Desplegables de Acción en Portales

Un problema recurrente en las tablas de datos es el recorte visual (`clipping`) de los menús desplegables de acciones debido a la propiedad `overflow-x-auto` del contenedor de la tabla.

> [!CAUTION]
> Está prohibido renderizar menús contextuales o botones dropdown de acción de forma inline dentro de celdas `<td>`. Se debe usar siempre un **Portal de React** para inyectar el menú en el `document.body` de forma externa, calculando dinámicamente las coordenadas geográficas en caliente.

### Patrón Correcto de Menú de Acciones:
1.  Al pulsar en el botón de opciones, se calculan las coordenadas relativas al viewport usando `getBoundingClientRect()`.
2.  Se inyecta el menú en un portal:
    ```tsx
    import { createPortal } from "react-dom";

    createPortal(
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          position: "absolute",
          top: `${coords.top}px`,
          left: `${coords.left}px`,
        }}
        className="w-52 bg-white border border-uecg-line shadow-2xl z-[99999]"
      >
        {/* Enlaces de Acción */}
      </motion.div>,
      document.body
    )
    ```
