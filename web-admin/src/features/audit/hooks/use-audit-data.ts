import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuditService } from "../api/audit.service";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type { AuditLog, AuditMeta } from "../types/audit.types";

export const useAuditData = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: queryResponse, isLoading, isFetching } = useQuery({
    queryKey: ["system-audit-logs", page, debouncedSearch],
    queryFn: () => AuditService.getLogs(page, 10, debouncedSearch),
    refetchInterval: 15000, // Refresca en vivo cada 15 seg
    placeholderData: (previousData) => previousData, // Mantiene los datos anteriores al cambiar de página/búsqueda
  });

  // Normalización extractora defensiva ante respuestas de NestJS
  const logs: AuditLog[] = Array.isArray(queryResponse?.data)
    ? queryResponse.data
    : (Array.isArray(queryResponse) ? queryResponse : []);

  const meta: AuditMeta = queryResponse?.meta || {
    total: logs.length,
    totalPages: 1,
  };

  // Resetea a la primera página cuando cambie la búsqueda
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return {
    logs,
    meta,
    isLoading,
    isFetching,
    page,
    setPage,
    searchTerm,
    setSearchTerm,
  };
};
