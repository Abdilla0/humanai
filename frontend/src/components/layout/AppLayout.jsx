import { NavLink, Outlet } from "react-router-dom";
import { History, PenLine, Settings } from "lucide-react";

import Sidebar from "./Sidebar";
import ThemeToggle from "../ui/ThemeToggle";
import BackButton from "../ui/BackButton";

const bottomNav = [
  { to: "/humanizer", label: "Humanizer", icon: PenLine },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="hidden md:block lg:hidden">
        <Sidebar compact />
      </div>
      <main className="min-h-screen px-4 pb-24 pt-8 md:ml-16 md:px-8 lg:ml-[220px] lg:px-16">
        <div className="mb-5 flex items-center justify-between gap-3">
          <BackButton />
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-line/80 bg-bg-surface/90 px-3 py-2 backdrop-blur-xl md:hidden">
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs ${isActive ? "text-brand" : "text-text-secondary"}`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
