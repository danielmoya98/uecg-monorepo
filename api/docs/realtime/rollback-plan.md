# Plan de Rollback / Reversión

En caso de detectarse problemas de rendimiento, incompatibilidades críticas en producción o regresiones insalvables post-migración, este documento detalla cómo regresar a la arquitectura basada en WebSockets (Socket.io).

## 1. Reversión de Cambios de Código (Git)

Dado que toda la migración se realiza en ramas controladas y confirmada paso a paso, la forma más rápida y segura de revertir es utilizando Git:

```bash
# Cancelar cambios no confirmados (si estamos en pleno despliegue fallido)
git reset --hard HEAD

# Si el cambio ya fue mergeado a la rama principal (main/develop)
git revert <commit_hash_de_la_migracion>
```

---

## 2. Restauración de Dependencias

Si se prefiere una restauración manual de las dependencias:

```bash
# Reinstalar los paquetes de WebSockets desinstalados en la Phase 8
npm install @nestjs/websockets@11.1.17 @nestjs/platform-socket.io@11.1.17 socket.io@4.8.3
```

---

## 3. Restauración Manual de Componentes

Si se necesita recuperar un archivo específico borrado o modificado (ej. los gateways):

```bash
# Restaurar los gateways eliminados
git checkout HEAD~1 -- src/identity/identity.gateway.ts
git checkout HEAD~1 -- src/reports/gateways/reports/reports.gateway.ts
git checkout HEAD~1 -- src/timetables/timetables.gateway.ts

# Restaurar la firma original de los controladores y servicios
git checkout HEAD~1 -- src/identity/identity.controller.ts
git checkout HEAD~1 -- src/identity/identity.service.ts
git checkout HEAD~1 -- src/identity/identity.processor.ts
git checkout HEAD~1 -- src/reports/reports.controller.ts
git checkout HEAD~1 -- src/reports/reports.processor.ts
git checkout HEAD~1 -- src/timetables/timetables.controller.ts
git checkout HEAD~1 -- src/timetables/timetables.service.ts
git checkout HEAD~1 -- src/timetables/timetables.processor.ts

# Eliminar el módulo de SSE creado
rm -rf src/realtime/
```

---

## 4. Verificación Post-Rollback

Tras realizar el rollback, se debe ejecutar la suite completa de pruebas para certificar la estabilidad de WebSockets:

1. `npm run build` (Compilación)
2. `npm run test` (Pruebas unitarias)
3. `npm run test:e2e` (Pruebas E2E)
