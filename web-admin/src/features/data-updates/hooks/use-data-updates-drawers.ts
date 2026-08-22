import { useState, useCallback } from "react";
import type { DataUpdateRequest } from "../types/data-updates.types";

export const useDataUpdatesDrawers = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DataUpdateRequest | null>(null);

  const openDiffDrawer = useCallback((request: DataUpdateRequest) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  }, []);

  const closeDiffDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedRequest(null);
  }, []);

  return {
    isDrawerOpen,
    selectedRequest,
    openDiffDrawer,
    closeDiffDrawer,
  };
};
