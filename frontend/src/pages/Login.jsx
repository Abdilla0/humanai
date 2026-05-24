import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import PasswordInput from "../components/ui/PasswordInput";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuthStore } from "../store/authStore";
import { getApiErrorMessage, getFieldError } from "../utils/apiError";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setLoading(true);
    try {
      await login(email, password);
      navigate("/humanizer");
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Could not sign in."));
      setFieldErrors({
        email: getFieldError(error, "email"),
        password: getFieldError(error, "password"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-text-primary">
      <div className="fixed right-4 top-4">
        <ThemeToggle compact />
      </div>
      <form onSubmit={submit} className="glass-card w-full max-w-[400px] p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white"><Sparkles size={22} /></div>
          <h1 className="mt-4 font-heading text-2xl font-bold">Welcome back</h1>
        </div>
        <GoogleLogin
          onSuccess={async (response) => {
            try {
              await loginWithGoogle(response.credential);
              navigate("/humanizer");
            } catch (error) {
              setFormError(getApiErrorMessage(error, "Google sign in failed."));
            }
          }}
          onError={() => setFormError("Google sign in failed.")}
          width="350"
        />
        <div className="my-5 flex items-center gap-3 text-sm text-text-secondary">
          <span className="h-px flex-1 bg-subtle" /> or <span className="h-px flex-1 bg-subtle" />
        </div>
        {formError && (
          <div className="mb-4 rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
            {formError}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <input className={`input-deep-focus w-full ${fieldErrors.email ? "border-danger" : ""}`} type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-300">{fieldErrors.email}</p>}
          </div>
          <PasswordInput placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required error={fieldErrors.password} />
        </div>
        <button className="btn-primary mt-5 w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"} <ArrowRight size={17} />
        </button>
        <p className="mt-5 text-center text-sm text-text-secondary">
          New here? <Link to="/register" className="text-brand">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
