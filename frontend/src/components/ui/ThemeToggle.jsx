import { Moon, Sun } from "lucide-react";

import { useThemeStore } from "../../store/themeStore";

export default function ThemeToggle({ compact = false }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-secondary h-10 px-3 py-0"
      title={isDark ? "Switch to day mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to day mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
      {!compact && <span className="hidden sm:inline">{isDark ? "Day" : "Dark"}</span>}
    </button>
  );
}

