# Tarjetas y Contenedores Planos (cards.md)

Este documento define la maquetación y la interactividad de las tarjetas (`cards`) y contenedores informativos del sistema. En el **Estilo Suizo**, una tarjeta es una división geométrica explícita, no una nube difuminada. Por ende, la sombra debe ser sutil y estar acompañada siempre de bordes nítidos de `1px`.

---

## 1. Reglas Visuales y de Estilo

*   **Sin Bordes Redondeados (`border-radius: 0`):** Toda tarjeta debe poseer esquinas rectangulares perfectas. Está terminantemente prohibido usar la clase `rounded` o derivados de Tailwind.
*   **Definición de Borde y Sombra:** Las tarjetas deben utilizar un borde fino de `1px` de grosor y una sombra plana discreta:
    `className="border border-uecg-line bg-white shadow-sm"`
*   **Modo Oscuro Integrado:** El fondo de la tarjeta debe consumir la variable `--uecg-card` (a través de la clase utilitaria base de Tailwind `bg-white`, la cual es interceptada en modo oscuro para renderizarse en `#121214`).

---

## 2. Tratamiento Suizo de Imágenes y Portadas (`mix-blend-mode`)

Las imágenes contenidas en tarjetas o avatares de perfil deben seguir un proceso de desaturación técnica y fusión cromática con el color de la marca, asegurando una visualización unificada de alta gama.

### Código de Composición CSS (`src/index.css`):
```css
.img-swiss {
    filter: grayscale(100%);
    transition: all 0.3s ease-out;
}

.img-swiss:hover {
    filter: grayscale(0%);
    transform: scale(1.05);
}

.img-wrapper-swiss {
    position: relative;
    overflow: hidden;
    background-color: var(--color-uecg-blue);
}

.img-wrapper-swiss img {
    mix-blend-mode: multiply;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.img-wrapper-swiss:hover img {
    opacity: 1;
}

/* Modo oscuro */
[data-theme="dark"] .img-wrapper-swiss img {
    mix-blend-mode: screen;
    opacity: 0.6;
}
```

> [!TIP]
> Emplea la envoltura `.img-wrapper-swiss` y la clase `.img-swiss` para portadas de tarjetas informativas o de perfiles de docentes/estudiantes. En el tema claro se fusiona usando multiplicación cromática (`multiply`), y en el tema oscuro mediante pantalla (`screen`), creando un efecto estético premium e inteligente.

---

## 3. Estructura de Contenido Interno

La información dentro de una tarjeta debe segmentarse mediante hilos visuales en lugar de separaciones por margen difuso.

### Ejemplo de Tarjeta de Perfil de Asignatura:
```tsx
export const SubjectCard = ({ name, code, hours }: { name: string; code: string; hours: number }) => (
  <div className="border border-uecg-line bg-white shadow-sm flex flex-col justify-between">
    <div className="p-6">
      <span className="label-swiss">Asignatura</span>
      <h3 className="text-xl font-black uppercase tracking-tight text-uecg-text mt-1">{name}</h3>
    </div>
    
    {/* Separador de Datos Técnico */}
    <div className="border-t border-uecg-line grid grid-cols-2 bg-gray-50">
      <div className="p-4 border-r border-uecg-line">
        <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">Código</span>
        <p className="font-mono text-xs font-bold text-uecg-text mt-1">{code}</p>
      </div>
      <div className="p-4">
        <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">Carga</span>
        <p className="font-mono text-xs font-bold text-uecg-text mt-1">{hours} HORAS</p>
      </div>
    </div>
  </div>
);
```
