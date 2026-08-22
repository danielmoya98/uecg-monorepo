import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataUpdatesService } from "../api/data-updates.service";
import type { DataUpdateRequest } from "../types/data-updates.types";

export const useDataUpdatesData = (canReadRude: boolean) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debouncing de búsqueda (300ms) para máxima fluidez y performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: rawResponse,
    isLoading,
    refetch,
  } = useQuery<DataUpdateRequest[]>({
    queryKey: ["data_updates_pending"],
    queryFn: DataUpdatesService.getPending,
    enabled: canReadRude,
    staleTime: 15000, // 15 segundos stale para coincidir con la sincronización automática
  });

  const pendingRequests = useMemo(() => {
    return Array.isArray(rawResponse) ? rawResponse : [];
  }, [rawResponse]);

  const filteredRequests = useMemo(() => {
    if (!debouncedSearch.trim()) return pendingRequests;

    const lowerSearch = debouncedSearch.toLowerCase().trim();
    return pendingRequests.filter((req) => {
      const student = req?.enrollment?.student;
      if (!student) return false;

      const fullName = `${student.names || ""} ${student.lastNamePaterno || ""} ${student.lastNameMaterno || ""}`.toLowerCase();
      const ci = (student.ci || "").toLowerCase();

      return fullName.includes(lowerSearch) || ci.includes(lowerSearch);
    });
  }, [pendingRequests, debouncedSearch]);

  return {
    searchTerm,
    setSearchTerm,
    pendingRequests,
    filteredRequests,
    isLoading,
    refetch,
  };
};
