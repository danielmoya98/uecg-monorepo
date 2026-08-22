import { useState, useEffect, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { EnrollmentsService } from "@/features/enrollments/api/enrollments.service";
import { AcademicYearsService } from "@/features/academic-years/api/academic-years.service";
import { ClassroomsService } from "@/features/classrooms/api/classrooms.service";
import { useDebounce } from "@/shared/hooks/use-debounce";

export const useStudentsData = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [levelFilter, setLevelFilter] = useState("");
  const [classroomFilter, setClassroomFilter] = useState("");

  // 1. Obtener la gestión académica activa
  const { data: currentYear } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: AcademicYearsService.getCurrent,
    staleTime: 5 * 60 * 1000,
  });

  const academicYearId = currentYear?.id;

  // 2. Obtener cursos del año académico activo para filtros
  const { data: classroomsResponse } = useQuery({
    queryKey: ["classrooms_for_filters", academicYearId],
    queryFn: () => ClassroomsService.getAll(1, 200, "", academicYearId),
    enabled: !!academicYearId,
    staleTime: 5 * 60 * 1000,
  });

  const classrooms = classroomsResponse?.data || [];

  // Niveles únicos (ej: SECUNDARIA, PRIMARIA, INICIAL)
  const allowedLevels = useMemo(() => {
    const levels = classrooms.map((c) => c.level);
    return Array.from(new Set(levels)).filter(Boolean);
  }, [classrooms]);

  // Aulas filtradas según el nivel seleccionado
  const availableClassrooms = useMemo(() => {
    if (!levelFilter) return classrooms;
    return classrooms.filter((c) => c.level === levelFilter);
  }, [classrooms, levelFilter]);

  // Reset del filtro de aula si cambia el nivel y el aula actual ya no pertenece a ese nivel
  useEffect(() => {
    if (levelFilter && classroomFilter) {
      const exists = classrooms.some((c) => c.id === classroomFilter && c.level === levelFilter);
      if (!exists) {
        setClassroomFilter("");
      }
    }
  }, [levelFilter, classrooms, classroomFilter]);

  // Reset de página ante cambios de filtros
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, levelFilter, classroomFilter]);

  // 3. Obtener lista de estudiantes inscritos (Población Escolar)
  const {
    data: enrollmentsResult,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "students_population",
      page,
      debouncedSearch,
      statusFilter,
      levelFilter,
      classroomFilter,
      academicYearId,
    ],
    queryFn: () =>
      EnrollmentsService.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
        academicYearId,
        status: statusFilter,
        level: levelFilter,
        classroomId: classroomFilter,
      }),
    placeholderData: keepPreviousData,
    enabled: !!academicYearId,
    staleTime: 30 * 1000,
  });

  const rawEnrollments = enrollmentsResult?.data || enrollmentsResult || [];

  const enrollments = useMemo(() => {
    if (!Array.isArray(rawEnrollments)) return [];
    return rawEnrollments.map((e: any) => ({
      id: e.id,
      studentName: `${e.student?.lastNamePaterno || ""} ${e.student?.lastNameMaterno || ""} ${e.student?.names || ""}`.trim(),
      names: e.student?.names || "",
      ci: e.student?.ci || "Sin CI",
      rudeCode: e.student?.rudeCode || "Sin RUDE",
      gender: e.student?.gender || "MASCULINO",
      classroom: e.classroom
        ? `${e.classroom.level} - ${e.classroom.grade} "${e.classroom.section}"`
        : "Sin Asignar",
      status: e.status || "REVISION_SIE",
      hasPhysicalFolder: e.receivedDocuments?.physicalFolder || false,
    }));
  }, [rawEnrollments]);

  const meta = enrollmentsResult?.meta || { total: enrollments.length, totalPages: 1 };

  return {
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
  };
};
