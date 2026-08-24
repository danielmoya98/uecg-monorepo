// Hooks
import { useRudeProtection } from "../hooks/use-rude-protection";
import { useDataUpdatesData } from "../hooks/use-data-updates-data";
import { useDataUpdatesDrawers } from "../hooks/use-data-updates-drawers";

// Componentes
import { DataUpdatesHeader } from "./data-updates-header";
import { BroadcastCommandCenter } from "./broadcast-command-center";
import { DiffUpdateDrawer } from "./diff-update-drawer";
import { DataUpdatesKPIs } from "./data-updates-kpis";
import { DataUpdatesToolbar } from "./data-updates-toolbar";
import { DataUpdatesTable } from "./data-updates-table";

export const DataUpdatesPage = () => {
  // 1. Escudo ABAC y Seguridad
  const { canReadRude, canManageRude } = useRudeProtection();

  // 2. Datos y Filtros
  const { searchTerm, setSearchTerm, pendingRequests, filteredRequests, isLoading, refetch } =
    useDataUpdatesData(canReadRude);

  // 3. Modales
  const { isDrawerOpen, selectedRequest, openDiffDrawer, closeDiffDrawer } = useDataUpdatesDrawers();

  // 4. Renderizado Orquestado con Skeletons Suizos
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto relative animate-in fade-in duration-300">
      <DataUpdatesHeader />

      {/* Solo los que pueden escribir ven el Centro de Mando Omnicanal (Push/WhatsApp) */}
      {canManageRude && <BroadcastCommandCenter />}

      <DataUpdatesKPIs pendingCount={pendingRequests.length} isLoading={isLoading} />

      <DataUpdatesToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} onRefresh={refetch} />

      <DataUpdatesTable
        requests={filteredRequests}
        isLoading={isLoading}
        onAudit={openDiffDrawer}
        canManage={canManageRude}
      />

      <DiffUpdateDrawer
        isOpen={isDrawerOpen}
        onClose={closeDiffDrawer}
        request={selectedRequest}
        onSuccess={refetch}
        canManage={canManageRude}
      />
    </div>
  );
};
export default DataUpdatesPage;
