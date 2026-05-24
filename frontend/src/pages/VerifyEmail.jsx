import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ThemeToggle from "../components/ui/ThemeToggle";
import { getApiErrorMessage } from "../utils/apiError";

export default function VerifyEmail() {
  const { uid, token } = useParams();
  const [state, setState] = useState({ status: "loading", message: "Confirming your email..." });

  useEffect(() => {
    import("../api/auth")
      .then((authApi) => authApi.verifyEmail(uid, token))
      .then((data) => setState({ status: "success", message: data.detail || "Email confirmed." }))
      .catch((error) => setState({ status: "error", message: getApiErrorMessage(error, "Verification failed.") }));
  }, [uid, token]);

  const isSuccess = state.status === "success";
  const isLoading = state.status === "loading";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-text-primary">
      <div className="fixed right-4 top-4">
        <ThemeToggle compact />
      </div>
      <div className="glass-card w-full max-w-[440px] p-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
          {isLoading ? <Loader2 className="animate-spin" size={24} /> : isSuccess ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
        </div>
        <h1 className="mt-5 font-heading text-2xl font-bold">
          {isLoading ? "Confirming email" : isSuccess ? "Email confirmed" : "Link not valid"}
        </h1>
        <p className="mt-3 leading-7 text-text-secondary">{state.message}</p>
        <Link to="/login" className="btn-primary mt-6 w-full">
          {isSuccess ? "Sign in" : "Back to login"}
        </Link>
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-text-secondary">
          <MailCheck size={16} />
          Check the newest email if you requested another confirmation link.
        </div>
      </div>
    </div>
  );
}
