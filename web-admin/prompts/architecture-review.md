# Prompt Reutilizable: Auditoría Global de Arquitectura

*Copie y envíe este prompt a un agente de Inteligencia Artificial para que realice un análisis estructural y arquitectónico completo del repositorio.*

---

```markdown
Actúa como Arquitecto de Software Principal y Líder Técnico de la Plataforma.

Tu objetivo es llevar a cabo una auditoría integral a nivel global de la base de código del repositorio para evaluar su salud estructural, alineamiento con las directrices de arquitectura modular y detectar fugas de responsabilidades o cuellos de botella técnicos.

### Áreas Críticas a Evaluar

Inspecciona todo el repositorio y responde con precisión a los siguientes pilares de nuestra arquitectura:

#### 1. Modulos y Fronteras de Dominio (Feature Integrity)
* Analiza si todas las características en `src/features/` operan como bloques de negocio independientes y autosuficientes.
* Detecta acoplamientos circulares entre diferentes directorios de características.
* ¿Hay componentes globales que deberían estar en `src/shared/components/` pero que están retenidos dentro de características específicas?

#### 2. Enrutamiento y Carga Diferida (TanStack Router)
* Revisa el árbol de rutas en `src/app/router/`.
* ¿Se está aplicando la separación de archivos `<RUTA>.tsx` y su contraparte lazy `<RUTA>.lazy.tsx` para vistas pesadas y paneles principales?
* ¿Las guardas de autenticación y verificación de permisos reactivos en `router.tsx` están centralizadas y libres de efectos secundarios?

#### 3. Ecosistema de Datos y Caching (TanStack Query)
* Analiza el árbol de dependencias de `useQuery` y `useMutation` en todo el proyecto.
* Evalúa la nomenclatura y jerarquía de las claves de caché (`queryKey`). ¿Son consistentes y predecibles?
* ¿Se realizan invalidaciones correctas en cadena o existen llamadas repetitivas que sobrecargan la API?

#### 4. Estado de Cliente vs Servidor (Zustand & React State)
* Escanea el almacenamiento global de Zustand en `src/shared/store/`. ¿Se está utilizando únicamente para variables puramente del cliente (sesión, preferencias visuales)?
* Evalúa si hay fugas de lógica de negocio o caché de servidor almacenada de forma redundante en las tiendas de Zustand.

#### 5. Coherencia en la Maquetación y Sistema de Diseño (Tailwind CSS v4)
* Revisa la consistencia del tema CSS corporativo en `src/index.css`.
* ¿Los componentes utilizan clases y tokens de color armonizados y adaptados para soporte responsive?

---

### Entregable Requerido

Presenta un reporte técnico de arquitectura estructurado de la siguiente forma:
1. **Evaluación de la Salud Estructural:** Describiendo el estado general de la arquitectura del repositorio.
2. **Mapa de Inconsistencias de Diseño:** Un desglose detallado de todos los archivos y estructuras que rompen las directrices de la arquitectura.
3. **Plan de Acción de Mejora Continua:** Propuesta priorizada de refactorizaciones estructurales y correcciones arquitectónicas para asegurar la escalabilidad del sistema.
```
