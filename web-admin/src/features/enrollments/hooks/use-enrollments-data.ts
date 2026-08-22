import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { EnrollmentsService } from "../api/enrollments.service";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface RawEnrollment {
  id: string;
  student?: {
    names: string;
    lastNamePaterno: string;
    lastNameMaterno?: string;
    ci?: string;
    rudeCode?: string;
  };
  enrollmentType?: string;
  date?: string;
  createdAt: string;
  status: string;
  classroom?: {
    grade: string;
    section: string;
  };
}

export const useEnrollmentsData = (canReadEnrollments: boolean) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [filterType, setFilterType] = useState("Todos");

  const {
    data: result,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["enrollments_pending", page, debouncedSearch, filterType],
    queryFn: () => EnrollmentsService.getPending(page, debouncedSearch, filterType),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    enabled: canReadEnrollments,
  });

  const rawEnrollments = (Array.isArray(result) ? result : result?.data || []) as RawEnrollment[];

  const enrollments =
    rawEnrollments.map((e: RawEnrollment) => ({
      id: e.id,
      studentName: `${e.student?.lastNamePaterno || ""} ${e.student?.lastNameMaterno || ""} ${e.student?.names || ""}`.trim(),
      ci: e.student?.ci || "Sin CI",
      type: e.enrollmentType || "NUEVO",
      date: new Date(e.date || e.createdAt).toLocaleDateString(),
      status: e.status,
      rudeCode: e.student?.rudeCode,
      classroom: e.classroom ? `${e.classroom.grade} "${e.classroom.section}"` : "Sin asignar",
    })) || [];

  // NestJS metadata is sometimes flat or in result.meta. We handle it safely
  const meta = result?.meta || { total: enrollments.length, totalPages: 1 };

  const handleSearchTermChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleFilterTypeChange = (val: string) => {
    setFilterType(val);
    setPage(1);
  };

  return {
    page,
    setPage,
    searchTerm,
    setSearchTerm: handleSearchTermChange,
    filterType,
    setFilterType: handleFilterTypeChange,
    enrollments,
    meta,
    isPending,
    isFetching,
    refetch,
  };
};
