# 🌐 UECG Landing — Portal Web Institucional

Portal público e informativo de la **Unidad Educativa Colegio Che Guevara (UECG)**.

---

## 🏗️ Tecnologías

- **Framework:** Astro v5
- **Estilos:** Tailwind CSS / CSS puro
- **Renderizado:** Static Site Generation (SSG) de alto rendimiento
- **Despliegue:** Netlify

---

## 📄 Páginas y Secciones

- `index.astro`: Página principal, bienvenida y visión general.
- `nosotros.astro`: Historia, misión, visión y valores educativos.
- `academico.astro`: Niveles (Inicial, Primaria, Secundaria) y oferta pedagógica.
- `admisiones.astro`: Requisitos, cronograma y proceso de admisión.
- `noticias.astro`: Comunicados y eventos institucionales.
- `proyectos.astro`: Ferias científicas, proyectos socioproductivos y actividades.
- `contacto.astro`: Canales de comunicación, ubicación y formulario.

---

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Compilar para producción (carpeta dist/)
npm run build

# Previsualizar compilación local
npm run preview
```

---

## 🚢 Despliegue en Netlify

El sitio se compila y despliega en **Netlify** de forma automática ante cambios en la rama `main` del monorepo mediante GitHub Actions (`.github/workflows/deploy-netlify-landing.yml`).
