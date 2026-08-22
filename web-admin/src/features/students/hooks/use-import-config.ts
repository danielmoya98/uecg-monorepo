import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AcademicYearsService } from "@/features/academic-years/api/academic-years.service";
import { ClassroomsService } from "@/features/classrooms/api/classrooms.service";

export const useImportConfig = () => {
  const [globalStatus, setGlobalStatus] = useState<string>("REVISION_SIE");
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [courseSearch, setCourseSearch] = useState<string>("");

  // 1. Obtener la gestión académica activa
  const { data: currentYear } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: AcademicYearsService.getCurrent,
    staleTime: 5 * 60 * 1000,
  });

  const academicYearId = currentYear?.id;

  // 2. Obtener cursos del año académico activo para la selección
  const { data: classroomsResponse } = useQuery({
    queryKey: ["classrooms_for_import", academicYearId],
    queryFn: () => ClassroomsService.getAll(1, 200, "", academicYearId),
    enabled: !!academicYearId,
    staleTime: 5 * 60 * 1000,
  });

  const classrooms = classroomsResponse?.data || [];

  // 3. Filtrar los cursos basados en la búsqueda del usuario
  const filteredClassrooms = useMemo(() => {
    if (!courseSearch.trim()) return classrooms;
    const query = courseSearch.toLowerCase();
    return classrooms.filter((c) =>
      `${c.level} ${c.grade} ${c.section} ${c.shift}`.toLowerCase().includes(query)
    );
  }, [classrooms, courseSearch]);

  // 4. Obtener los datos del curso seleccionado
  const selectedClassroomData = useMemo(() => {
    if (!selectedClassroomId) return null;
    return classrooms.find((c) => c.id === selectedClassroomId) || null;
  }, [classrooms, selectedClassroomId]);

  return {
    currentYear,
    globalStatus,
    setGlobalStatus,
    selectedClassroomId,
    setSelectedClassroomId,
    courseSearch,
    setCourseSearch,
    selectedClassroomData,
    filteredClassrooms,
  };
};
