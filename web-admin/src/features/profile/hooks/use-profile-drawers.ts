import { useState } from "react";

export const useProfileDrawers = () => {
  const [isPasswordDrawerOpen, setIsPasswordDrawerOpen] = useState(false);

  return {
    isPasswordDrawerOpen,
    openPasswordDrawer: () => setIsPasswordDrawerOpen(true),
    closePasswordDrawer: () => setIsPasswordDrawerOpen(false),
  };
};
