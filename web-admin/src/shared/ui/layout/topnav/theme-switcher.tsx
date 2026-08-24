import { useTheme } from "@/app/providers/theme-provider";
import { Moon, Sun } from "lucide-react";
import { MorphIcon } from "@/shared/ui";


export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = () => {
    const nextTheme = theme === "light" ? "dark" : "light";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={handleThemeChange}
      type="button"
      className="w-9 h-9 flex items-center justify-center border transition-all outline-none focus:outline-none shadow-sm bg-white dark:bg-zinc-900 border-uecg-line dark:border-zinc-700 text-uecg-gray dark:text-zinc-300 hover:border-uecg-blue hover:text-uecg-blue cursor-pointer"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <MorphIcon
        icon={isDark ? Sun : Moon}
        size={16}
        strokeWidth={2}
        className="transition-colors text-uecg-dark dark:text-amber-400"
      />
    </button>
  );
}
