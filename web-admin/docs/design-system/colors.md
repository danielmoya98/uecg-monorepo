# Paleta de Colores y Gestión de Temas (colors.md)

Este documento define la especificación oficial de la paleta de colores del proyecto, detallando la inyección de variables CSS nativas en Tailwind CSS v4 para el soporte dinámico del tema claro y del tema oscuro **Obsidian Slate**.

---

## 1. Variables de Tema (CSS Tokens)

La aplicación implementa un sistema de temas dinámicos controlados por el atributo `data-theme` en la etiqueta `html`. Todos los colores se configuran mediante propiedades personalizadas CSS.

### Tema Claro
*   **Fondo General (`--uecg-bg`):** `#f3f4f6` (Gris claro neutro, proporciona contraste suave).
*   **Tarjetas y Superficies Principales (`--uecg-card`):** `#ffffff` (Blanco puro para aislar elementos).
*   **Filtros y Contenedores Secundarios (`--uecg-surface`):** `#f9fafb` (Gris 50 para subdividir contenidos).
*   **Branding Principal (`--uecg-blue`):** `#000089` (Azul corporativo profundo de alta fidelidad).
*   **Navy Branding (`--uecg-dark`):** `#000060` (Navy oscuro para elementos de estructura rígida).
*   **Texto Principal (`--uecg-text`):** `#111827` (Gris 900 de alto contraste).
*   **Texto Secundario (`--uecg-gray`):** `#6b7280` (Gris 500 para metadatos e información secundaria).
*   **Bordes e Hilos (`--uecg-line`):** `#e5e7eb` (Gris 200 para el tramado geométrico).

### Tema Oscuro (Obsidian Slate Edition)
*   **Fondo General (`--uecg-bg`):** `#09090b` (Zinc 950 - El abismo puro).
*   **Tarjetas y Superficies Principales (`--uecg-card`):** `#121214` (Gris grafito profundo que sobresale del abismo).
*   **Filtros y Contenedores Secundarios (`--uecg-surface`):** `#1f1f22` (Gris pizarra para hovers e inputs).
*   **Branding Principal (`--uecg-blue`):** `#3b82f6` (Azul Neón Suave, alta legibilidad sobre fondos oscuros).
*   **Sidebar / Fondo Rígido (`--uecg-dark`):** `#000000` (Negro absoluto para enmarcar la aplicación lateralmente).
*   **Texto Principal (`--uecg-text`):** `#fafafa` (Zinc 50 - Blanco perla suave de baja fatiga visual).
*   **Texto Secundario (`--uecg-gray`):** `#a1a1aa` (Zinc 400 - Gris texto secundario).
*   **Bordes e Hilos (`--uecg-line`):** `#27272a` (Zinc 800 - Definición geométrica elegante).

---

## 2. Inyección a Tailwind CSS v4

La integración en Tailwind se realiza mediante la directiva `@theme inline` en `src/index.css`:

```css
@theme inline {
    --color-uecg-blue: var(--uecg-blue);
    --color-uecg-dark: var(--uecg-dark);
    --color-uecg-text: var(--uecg-text);
    --color-uecg-gray: var(--uecg-gray);
    --color-uecg-line: var(--uecg-line);

    --color-background: var(--uecg-bg);
    --color-foreground: var(--uecg-text);
}
```

> [!IMPORTANT]
> Los componentes deben consumir los colores utilizando las clases autorizadas de Tailwind (`bg-background`, `text-foreground`, `border-uecg-line`, `text-uecg-gray`, `bg-uecg-blue`). Está prohibido hardcodear colores hexadecimales en la maquetación.

---

## 3. Accesibilidad de Contraste (WCAG 2.1 AA)

Para asegurar la accesibilidad a todo tipo de usuarios, se deben cumplir los siguientes ratios de contraste mínimo:

*   **Texto Normal (inferior a 18pt / 24px):** Debe mantener un contraste de al menos **4.5:1** contra el fondo.
    *   *Ejemplo Claro:* Texto `--uecg-text` (`#111827`) sobre fondo `--uecg-card` (`#ffffff`) ratio **16.5:1** (Cumple ampliamente).
    *   *Ejemplo Oscuro:* Texto `--uecg-text` (`#fafafa`) sobre fondo `--uecg-card` (`#121214`) ratio **16.1:1** (Cumple ampliamente).
*   **Texto Grande (igual o superior a 18pt o negrita superior a 14pt):** Debe mantener al menos **3.0:1**.
*   **Metadatos con `--uecg-gray`:** No deben usarse como texto de párrafo principal. Solo están autorizados para textos de apoyo o etiquetas secundarias.

> [!WARNING]
> En modo oscuro, los textos en color corporativo puro `--uecg-blue` no deben usarse sobre fondos Zinc 950 directamente sin una capa de sombra o aclarado adecuado. Utiliza las clases utilitarias seguras provistas por el interceptor base para evitar la pérdida de contraste.
