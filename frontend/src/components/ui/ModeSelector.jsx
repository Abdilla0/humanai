import toast from "react-hot-toast";
import { Lock } from "lucide-react";

import { canUseMode, modeRequiresPlan } from "../../utils/planGating";

const modes = [
  ["standard", "Standard"],
  ["casual", "Casual"],
  ["academic", "Academic"],
  ["aggressive", "Aggressive"],
];

export default function ModeSelector({ plan = "free", value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {modes.map(([mode, label]) => {
        const locked = !canUseMode(plan, mode);
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            title={locked ? `${modeRequiresPlan(mode)} plan required` : label}
            onClick={() => {
              if (locked) {
                toast.error(`Upgrade to ${modeRequiresPlan(mode)} to use ${label} mode`);
                return;
              }
              onChange(mode);
            }}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
              active ? "bg-brand text-white shadow-glow" : "border border-line/80 bg-subtle/80 text-text-secondary hover:text-text-primary"
            } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {locked && <Lock size={14} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

