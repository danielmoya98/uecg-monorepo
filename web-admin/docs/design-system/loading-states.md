# Estados de Carga y Skeletons (loading-states.md)

Este documento define la estrategia global para la gestión de la experiencia de carga asíncrona. El objetivo es eliminar los saltos bruscos de maquetación (`Layout Shifts`), evitar los spinners a pantalla completa innecesarios y proporcionar respuestas instantáneas utilizando actualizaciones optimistas e hilos visuales coherentes.

---

## 1. Reglas Generales de Carga

1.  **❌ Prohibido los Spinners Globales (Full-Screen Spinners):** Interrumpen la experiencia del usuario y bloquean toda interacción. Solo se permiten en el flujo de arranque inicial de la aplicación (`auth`).
2.  **Skeletons Geométricos Coherentes:** Si una tabla tarda en cargar, se debe renderizar una cuadrícula del mismo tamaño con filas de Skeletons planos que calquen las celdas geométricas reales.
3.  **Indicadores de Acción Crítica:** En botones que disparan mutaciones de guardado o borrado, se reemplaza el icono o texto por un loader giratorio compacto (`Loader2` de Lucide animado con `animate-spin`).

---

## 2. Implementación de Skeletons Suizos

Para mantener el estilo rígido de la aplicación, los Skeletons no deben tener bordes redondeados y deben conservar una opacidad intermitente uniforme (`animate-pulse`).

### Ejemplo de Skeleton para Filas de Tabla:
```tsx
export const TableRowSkeleton = () => (
  <tr className="border-b border-uecg-line animate-pulse h-16 bg-white">
    <td className="px-6 py-3 border-r border-uecg-line">
      {/* Skeleton del título */}
      <div className="h-4 bg-gray-200 dark:bg-zinc-800 w-2/3"></div>
      {/* Skeleton del subtítulo */}
      <div className="h-3 bg-gray-100 dark:bg-zinc-900 w-1/3 mt-2"></div>
    </td>
    <td className="px-6 py-3 border-r border-uecg-line">
      <div className="h-4 bg-gray-200 dark:bg-zinc-800 w-1/2"></div>
    </td>
    <td className="px-6 py-3 border-r border-uecg-line">
      <div className="h-5 bg-gray-200 dark:bg-zinc-800 w-16"></div>
    </td>
    <td className="px-6 py-3 text-center">
      <div className="h-8 bg-gray-100 dark:bg-zinc-900 w-8 mx-auto"></div>
    </td>
  </tr>
);
```

---

## 3. Actualizaciones Optimistas (Optimistic UI)

En acciones binarias que no requieren un procesamiento complejo del servidor (por ejemplo, habilitar/deshabilitar un espacio físico o un año lectivo), la UI debe actualizarse **antes** de que el servidor devuelva el éxito del guardado.

### Patrón Autorizado con TanStack Query:
Al realizar la mutación con `useMutation`, aprovechamos el callback `onMutate` para pintar el nuevo estado de manera síncrona en el caché local, guardando el estado anterior para hacer un `rollback` en caso de error.

```tsx
const queryClient = useQueryClient();

const toggleMutation = useMutation({
  mutationFn: (id: string) => PhysicalSpacesService.toggleActive(id),
  
  // 1. Guardamos el estado anterior y pintamos optimistamente el nuevo valor en caché
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ["physicalSpaces"] });
    const previousSpaces = queryClient.getQueryData<any[]>(["physicalSpaces"]);
    
    if (previousSpaces) {
      queryClient.setQueryData(
        ["physicalSpaces"],
        previousSpaces.map((space) =>
          space.id === id ? { ...space, isActive: !space.isActive } : space
        )
      );
    }
    
    return { previousSpaces };
  },
  
  // 2. Si ocurre un error, hacemos rollback al estado anterior guardado
  onError: (err, id, context) => {
    if (context?.previousSpaces) {
      queryClient.setQueryData(["physicalSpaces"], context.previousSpaces);
    }
    toast.error("No se pudo actualizar el estado del espacio");
  },
  
  // 3. Al terminar (éxito o fallo), invalidamos para sincronizar con datos reales del servidor
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["physicalSpaces"] });
  }
});
```
