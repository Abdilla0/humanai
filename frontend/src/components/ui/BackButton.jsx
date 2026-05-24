import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Back", className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`inline-flex h-10 items-center gap-2 rounded-lg border border-line/80 bg-bg-surface/90 px-3 text-sm font-medium text-text-secondary shadow-sm backdrop-blur-xl transition hover:bg-subtle hover:text-text-primary ${className}`}
      title="Back to previous page"
    >
      <ArrowLeft size={17} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

