import { useTheme } from "@/app/providers/theme-provider"; // 🔥 Conectado a tu proveedor nativo de Vite
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = () => {
    const nextTheme = theme === "light" ? "dark" : "light";

    // 🌟 Soporte nativo para la View Transitions API que configuraste en tu index.css (@keyframes theme-wipe)
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
      className="w-9 h-9 flex items-center justify-center border transition-all outline-none focus:outline-none shadow-sm bg-white border-uecg-line text-uecg-gray hover:border-uecg-blue hover:text-uecg-blue cursor-pointer"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? (
        <Sun className="w-4 h-4" strokeWidth={2} />
      ) : (
        <Moon className="w-4 h-4" strokeWidth={2} />
      )}
    </button>
  );
}
