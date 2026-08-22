# Jerarquía Tipográfica y Estilo de Texto (typography.md)

Este documento detalla la guía tipográfica del proyecto. El estilo tipográfico es un componente crítico del **Estilo Suizo (Swiss Design)**: se basa en tipografías de palo seco altamente legibles, contrastes extremos de escala y la rigidez de las fuentes monoespaciadas para datos técnicos.

---

## 1. Fuentes del Sistema (Font Families)

La aplicación utiliza dos familias de fuentes principales para enmarcar la información:

1.  **Sans-Serif (Tipografía de Interfaz):** Se utiliza para la lectura de contenido, nombres, formularios y títulos generales de la aplicación. Por defecto se apoya en fuentes del sistema de alta calidad (Inter, Roboto, SF Pro, Outfit).
2.  **Monospace (Tipografía Técnica):** Se reserva estrictamente para fechas, marcas de tiempo (`timestamps`), códigos RUDE, identificadores únicos, números de teléfono y registros financieros.
    *   *Ejemplo:* En la tabla de Años Lectivos (`academic-years-ui.tsx`):
        ```tsx
        <td className="font-mono text-xs font-bold text-uecg-gray tracking-widest">
            {y.startDate.substring(0, 10)}
        </td>
        ```

---

## 2. El Token `.label-swiss` (Etiquetas de Bloque)

El elemento identitario más fuerte del sistema tipográfico es la clase `.label-swiss`, utilizada para enmarcar secciones, indicar el tipo de formulario o actuar como prefijo de metadatos.

### Definición Técnica CSS:
```css
.label-swiss {
    text-transform: uppercase;
    letter-spacing: 0.2em;      /* tracking-widest */
    font-weight: 700;           /* font-bold */
    font-size: 0.75rem;         /* text-xs */
    color: var(--color-uecg-blue);
    display: block;
    margin-bottom: 0.5rem;
}
```

> [!NOTE]
> Cualquier texto presentacional corto que actúe como subtítulo de apoyo o indicador jerárquico debe decorarse con la clase `label-swiss`.

---

## 3. Escala Jerárquica y Transformaciones

Para evitar la contaminación visual, la escala jerárquica está estrictamente limitada:

*   **Títulos de Página (H1):** `text-4xl font-black tracking-tighter uppercase text-uecg-text`
    *   *Ejemplo:* `AÑOS LECTIVOS`, `ESTADÍSTICAS`, `CENTRO DE CONTROL`.
*   **Títulos de Tarjeta o Drawer (H2):** `text-xl font-black uppercase tracking-tighter text-uecg-text`
    *   *Ejemplo:* `NUEVA GESTIÓN`, `AUDITAR EXPEDIENTE`.
*   **Texto de Interfaz / Cuerpo:** `text-sm font-bold` (con el color base `text-uecg-text` o el secundario `text-uecg-gray`).
*   **Botones y Filtros:** `text-[11px] font-black uppercase tracking-widest` (o `text-[10px]`). Esto otorga un aire de control y orden riguroso a toda acción interactiva.

---

## 4. Reglas de Uso de Mayúsculas (Uppercase)

*   **Entrada de Datos:** Los campos de texto libre como nombres de asignaturas, nombres de aulas, nombres de gestiones académicas y datos similares se transforman automáticamente a mayúsculas (`uppercase`) visualmente y al guardarlos, asegurando la consistencia de la base de datos y la estética suiza.
*   **Elementos de Control:** Todos los botones (`btn-swiss`), filtros de búsqueda (`input[type="text"]` de búsqueda), selectores (`SwissSelect`) y cabeceras de tabla (`<th>`) deben estar estrictamente en mayúsculas (`uppercase`).
