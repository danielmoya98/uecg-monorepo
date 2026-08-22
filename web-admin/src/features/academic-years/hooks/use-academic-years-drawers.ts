import { useState } from "react";
import type { AcademicYearData } from "../types/academic-years.types";
import type { DrawerMode } from "../components/academic-year-drawer";

export const useAcademicYearsDrawers = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [selectedYear, setSelectedYear] = useState<AcademicYearData | null>(null);
  const [isTrimestersDrawerOpen, setIsTrimestersDrawerOpen] = useState(false);

  return {
    isDrawerOpen,
    drawerMode,
    selectedYear,
    openForm: (mode: DrawerMode, year?: AcademicYearData) => {
      setDrawerMode(mode);
      setSelectedYear(year || null);
      setIsDrawerOpen(true);
    },
    closeForm: () => setIsDrawerOpen(false),

    isTrimestersDrawerOpen,
    openTrimesters: (year: AcademicYearData) => {
      setSelectedYear(year);
      setIsTrimestersDrawerOpen(true);
    },
    closeTrimesters: () => setIsTrimestersDrawerOpen(false),
  };
};
