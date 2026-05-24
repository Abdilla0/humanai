import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function UpgradeBanner({ wordsRemaining = 0 }) {
  const [hidden, setHidden] = useState(false);
  if (hidden || wordsRemaining >= 200) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
      <Link to="/pricing" className="font-medium">
        You have {wordsRemaining.toLocaleString()} words left this month. Upgrade for more {"->"}
      </Link>
      <button type="button" onClick={() => setHidden(true)} className="rounded p-1 transition hover:bg-subtle" title="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}
