import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ className = "", error = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={`input-deep-focus w-full pr-12 ${error ? "border-danger" : ""} ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition hover:bg-subtle hover:text-text-primary"
          title={visible ? "Hide password" : "Show password"}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-300">{error}</p>}
    </div>
  );
}
