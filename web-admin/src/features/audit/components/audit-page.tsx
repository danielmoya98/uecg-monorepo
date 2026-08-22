import { useAuditData } from "../hooks/use-audit-data";
import { AuditHeader } from "./audit-header";
import { AuditToolbar } from "./audit-toolbar";
import { AuditTable } from "./audit-table";
import AuditPagination from "./audit-pagination";

export const AuditPage = () => {
  const {
    logs,
    meta,
    isLoading,
    isFetching,
    page,
    setPage,
    searchTerm,
    setSearchTerm,
  } = useAuditData();

  return (
    <div className="flex flex-col gap-6 w-full min-h-[calc(100vh-140px)] justify-between relative animate-in fade-in duration-300">
      <div className="flex flex-col gap-6 w-full">
        {/* Cabecera corporativa con indicador de sincronización activa */}
        <AuditHeader isFetching={isFetching} />

        {/* Barra de herramientas con buscador debounced */}
        <AuditToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onResetPage={() => setPage(1)}
        />

        {/* Tabla presentacional pura con skeletons suizos y a11y */}
        <AuditTable logs={logs} isLoading={isLoading} />
      </div>

      {/* Navegación y paginación semántica WCAG 2.1 */}
      <AuditPagination
        page={page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        onPageChange={setPage}
      />
    </div>
  );
};
