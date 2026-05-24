import { create } from "zustand";

const savedTheme = localStorage.getItem("humanai-theme") || "dark";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("humanai-theme", theme);
}

export const useThemeStore = create((set, get) => ({
  theme: savedTheme,
  init() {
    applyTheme(get().theme);
  },
  setTheme(theme) {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme() {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    set({ theme: nextTheme });
  },
}));

