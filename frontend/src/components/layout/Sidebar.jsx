import { NavLink, Link } from "react-router-dom";
import { History, PenLine, Settings, Sparkles } from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import PlanBadge from "../ui/PlanBadge";
import WordsMeter from "../ui/WordsMeter";

const nav = [
  { to: "/humanizer", label: "Humanizer", icon: PenLine },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ compact = false }) {
  const user = useAuthStore((state) => state.user);
  const plan = user?.plan || "free";

  return (
    <aside className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-line/80 bg-bg-surface/90 py-10 backdrop-blur-xl md:flex ${compact ? "w-16" : "w-[220px]"}`}>
      <div className={`mb-10 flex items-center gap-2 px-4 ${compact ? "justify-center" : ""}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
          <Sparkles size={18} />
        </div>
        {!compact && <span className="font-heading text-xl font-bold">HumanAI</span>}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-r-lg py-3 text-sm font-medium transition ${
                compact ? "justify-center px-0" : "px-4"
              } ${
                isActive
                  ? "border-l-2 border-brand bg-brand/10 text-text-primary"
                  : "border-l-2 border-transparent text-text-secondary hover:bg-subtle/80 hover:text-text-primary"
              }`
            }
          >
            <item.icon size={19} />
            {!compact && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!compact && (
        <div className="space-y-4 px-5">
          <PlanBadge plan={plan} />
          <WordsMeter used={user?.words_used_this_month || 0} limit={user?.words_limit || 500} />
          {plan === "free" && (
            <Link to="/pricing" className="btn-primary w-full py-2">
              Upgrade {"->"}
            </Link>
          )}
        </div>
      )}
    </aside>
  );
}
