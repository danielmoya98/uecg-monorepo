import { useState } from "react";

export interface ActionDrawerData {
  id: string;
  name: string;
  type: "MARK_PHYSICAL" | "NOTIFY";
}

export const useStudentDrawers = () => {
  // 1. Estado del Kardex Drawer
  const [isKardexOpen, setIsKardexOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

  const openKardex = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setIsKardexOpen(true);
  };

  const closeKardex = () => {
    setIsKardexOpen(false);
    setSelectedEnrollmentId(null);
  };

  // 2. Estado del Withdraw (Baja) Drawer
  const [isWithdrawDrawerOpen, setIsWithdrawDrawerOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState<any | null>(null);

  const openWithdraw = (enrollment: any) => {
    setWithdrawData(enrollment);
    setIsWithdrawDrawerOpen(true);
  };

  const closeWithdraw = () => {
    setIsWithdrawDrawerOpen(false);
    setWithdrawData(null);
  };

  // 3. Estado de Acciones Drawer (Notificar / Físico)
  const [actionDrawerData, setActionDrawerData] = useState<ActionDrawerData | null>(null);

  const openActionDrawer = (id: string, name: string, type: "MARK_PHYSICAL" | "NOTIFY") => {
    setActionDrawerData({ id, name, type });
  };

  const closeActionDrawer = () => {
    setActionDrawerData(null);
  };

  // 4. Estado de Carnet Drawer (QR)
  const [carnetData, setCarnetData] = useState<any | null>(null);

  const openCarnet = (enrollment: any) => {
    setCarnetData(enrollment);
  };

  const closeCarnet = () => {
    setCarnetData(null);
  };

  return {
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
  };
};
