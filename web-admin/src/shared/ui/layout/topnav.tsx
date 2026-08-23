import GlobalSearch from "./topnav/global-search";
import YearSelector from "./topnav/year-selector";
import NotificationBell from "./topnav/notification-bell";
import UserProfileDropdown from "./topnav/user-profile-dropdown";
import ThemeSwitcher from "./topnav/theme-switcher";
import DirectorTourButton from "./topnav/director-tour-button";
import { useRouteContext } from "@tanstack/react-router";

export function TopNav() {
  // 🟢 Consumo de seguridad síncrono inyectado desde el Layout
  const { user } = useRouteContext({ from: '/_authenticated' });
  const isAdmin = user?.role === "ADMINISTRADOR" || user?.role === "SUPER_ADMIN";

  return (
    <header className="flex h-[72px] w-full items-center justify-between border-b border-uecg-line bg-white px-6 relative z-30 transition-colors duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex-1 max-w-md flex items-center gap-4">
        {!isAdmin && <GlobalSearch />}
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <DirectorTourButton />

        <YearSelector />
        <div className="h-6 w-px bg-uecg-line hidden md:block" />

        <div className="flex items-center gap-2">
          <NotificationBell />
          {!isAdmin && <ThemeSwitcher />}
        </div>

        <div className="h-6 w-px bg-uecg-line" />
        <UserProfileDropdown />
      </div>
    </header>
  );
}
