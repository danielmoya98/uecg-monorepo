import { useState } from "react";
import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";

// Hooks SRP co-localizados
import { useStudentsData } from "../hooks/use-students-data";
import { useStudentMutations } from "../hooks/use-student-mutations";
import { useStudentDrawers } from "../hooks/use-student-drawers";

// Componentes presentacionales
import { StudentsHeader } from "./StudentsHeader";
import StudentsFilters from "./StudentsFilters";
import StudentsTable from "./StudentsTable";
import StudentsGrid from "./StudentsGrid";
import StudentsPagination from "./StudentsPagination";

// Cajones (Drawers) consolidantes
import StudentKardexDrawer from "./StudentKardexDrawer";
import WithdrawStudentDrawer from "./WithdrawStudentDrawer";
import StudentActionDrawer from "./StudentActionDrawer";
import StudentCarnetDrawer from "./StudentCarnetDrawer";
import { MassiveBulletinsDrawer, useReportsExport } from "@/features/reports";

export default function StudentsPage() {
  // 1. Permisos ABAC síncronos desde TanStack Router Context
  const { can } = useRouteContext({ from: "/_authenticated" });
  const canCreateStudent = can("create:any", "Student") || can("manage:all", "all");
  const canDownloadReports = can("read:any", "Grade") || can("manage:all", "all");

  // 2. Inyección de Estado y Consultas (TanStack Query)
  const {
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    levelFilter,
    setLevelFilter,
    classroomFilter,
    setClassroomFilter,
    currentYear,
    allowedLevels,
    availableClassrooms,
    enrollments,
    meta,
    isPending,
    isFetching,
    refetch,
  } = useStudentsData();

  // Estados visuales locales
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isMassiveExportOpen, setIsMassiveExportOpen] = useState(false);
  const { isExporting, setIsExporting } = useReportsExport();

  // 3. Orquestador de drawers
  const {
    isKardexOpen,
    selectedEnrollmentId,
    openKardex,
    closeKardex,
    isWithdrawDrawerOpen,
    withdrawData,
    openWithdraw,
    closeWithdraw,
    actionDrawerData,
    openActionDrawer,
    closeActionDrawer,
    carnetData,
    openCarnet,
    closeCarnet,
  } = useStudentDrawers();

  // 4. Inyección de Mutaciones (Server State Actions)
  const { notifyMutation, markPhysicalMutation } = useStudentMutations({
    onSuccessAction: closeActionDrawer,
    refetchTable: refetch,
  });

  // 5. LÓGICA DE DESCARGA DE BOLETÍN INDIVIDUAL (Optimizada con Carga Diferida)
  const handleDownloadBulletin = async (enrollmentId: string, studentName: string) => {
    const toastId = toast.loading(`Obteniendo calificaciones de ${studentName}...`);

    try {
      // Llamamos al servicio de reportes
      const { ReportsService } = await import("@/features/reports/api/reports.service");
      const bulletinData = await ReportsService.getIndividualBulletinData(enrollmentId);
      
      toast.loading(`Compilando libreta Ley 070 para ${studentName}...`, { id: toastId });

      // Importamos de manera asíncrona la librería de PDF y la plantilla
      const { pdf } = await import("@react-pdf/renderer");
      const { BolivianLibreta } = await import("@/features/reports/components/BolivianLibreta");

      const blob = await pdf(<BolivianLibreta data={bulletinData} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `Libreta_070_${safeName}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("¡Libreta generada y descargada!", { id: toastId });
    } catch (error) {
      console.error("Error descargando libreta:", error);
      toast.error("Ocurrió un error al compilar el PDF de calificaciones.", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto relative animate-in fade-in duration-300 w-full min-h-[calc(100vh-140px)]">
      <StudentsHeader
        currentYearName={currentYear?.year?.toString()}
        canCreateStudent={canCreateStudent}
        canDownloadReports={canDownloadReports}
        isLoaded={true}
        isFetching={isFetching}
        isPending={isPending || isExporting}
        onOpenMassiveExport={() => setIsMassiveExportOpen(true)}
      />

      <StudentsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        levelFilter={levelFilter}
        onLevelChange={(val) => {
          setLevelFilter(val);
          setClassroomFilter("");
        }}
        classroomFilter={classroomFilter}
        onClassroomChange={setClassroomFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        allowedLevels={allowedLevels}
        availableClassrooms={availableClassrooms}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* RENDERIZADO CONDICIONAL DE VISTAS */}
      {viewMode === "table" ? (
        <StudentsTable
          enrollments={enrollments}
          isPending={isPending}
          isFetching={isFetching}
          onOpenKardex={openKardex}
          onOpenWithdraw={openWithdraw}
          onActionRequest={openActionDrawer}
          onOpenCarnet={openCarnet}
          onDownloadBulletin={handleDownloadBulletin}
        />
      ) : (
        <StudentsGrid
          enrollments={enrollments}
          isPending={isPending}
          isFetching={isFetching}
          onOpenKardex={openKardex}
          onOpenWithdraw={openWithdraw}
          onActionRequest={openActionDrawer}
          onOpenCarnet={openCarnet}
          onDownloadBulletin={handleDownloadBulletin}
        />
      )}

      <StudentsPagination
        page={page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        onPageChange={setPage}
      />

      {/* PORTALES DE DIÁLOGOS Y CAJONES (DRAWERS) */}
      <StudentKardexDrawer
        isOpen={isKardexOpen}
        onClose={closeKardex}
        enrollmentId={selectedEnrollmentId}
      />

      <WithdrawStudentDrawer
        isOpen={isWithdrawDrawerOpen}
        onClose={closeWithdraw}
        enrollment={withdrawData}
      />

      <StudentActionDrawer
        isOpen={actionDrawerData !== null}
        onClose={closeActionDrawer}
        studentName={actionDrawerData?.name || ""}
        actionType={actionDrawerData?.type || null}
        isPending={notifyMutation.isPending || markPhysicalMutation.isPending}
        onConfirm={() => {
          if (actionDrawerData?.type === "MARK_PHYSICAL") {
            markPhysicalMutation.mutate(actionDrawerData.id);
          } else if (actionDrawerData?.id) {
            notifyMutation.mutate(actionDrawerData.id);
          }
        }}
      />

      <StudentCarnetDrawer
        isOpen={!!carnetData}
        onClose={closeCarnet}
        enrollment={carnetData}
      />

      <MassiveBulletinsDrawer
        isOpen={isMassiveExportOpen}
        onClose={() => setIsMassiveExportOpen(false)}
        academicYearId={currentYear?.id || ""}
        allowedLevels={allowedLevels}
        availableClassrooms={availableClassrooms}
        onStartExport={() => setIsExporting(true)}
      />
    </div>
  );
}
