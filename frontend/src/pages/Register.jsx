import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, MailCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import PasswordInput from "../components/ui/PasswordInput";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuthStore } from "../store/authStore";
import { getApiErrorMessage, getFieldError } from "../utils/apiError";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [verificationEmail, setVerificationEmail] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    if (!accepted) {
      setFormError("Please accept the terms first.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      const payload = await register(email, password, fullName);
      if (payload?.requires_verification) {
        setVerificationEmail(payload.email || email);
        return;
      }
      navigate("/humanizer");
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Could not create account."));
      setFieldErrors({
        email: getFieldError(error, "email"),
        password: getFieldError(error, "password"),
        full_name: getFieldError(error, "full_name"),
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
      {verificationEmail ? (
        <div className="glass-card w-full max-w-[430px] p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <MailCheck size={24} />
          </div>
          <h1 className="mt-5 font-heading text-2xl font-bold">Check your email</h1>
          <p className="mt-3 leading-7 text-text-secondary">
            We sent a confirmation link to <span className="font-medium text-text-primary">{verificationEmail}</span>. Confirm your email before signing in.
          </p>
          <Link to="/login" className="btn-primary mt-6 w-full">Go to login</Link>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-brand"
            onClick={() => {
              setVerificationEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            Use another email
          </button>
        </div>
      ) : (
      <form onSubmit={submit} className="glass-card w-full max-w-[400px] p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white"><Sparkles size={22} /></div>
          <h1 className="mt-4 font-heading text-2xl font-bold">Create your account</h1>
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
            <input className={`input-deep-focus w-full ${fieldErrors.full_name ? "border-danger" : ""}`} placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            {fieldErrors.full_name && <p className="mt-1 text-xs text-red-500 dark:text-red-300">{fieldErrors.full_name}</p>}
          </div>
          <div>
            <input className={`input-deep-focus w-full ${fieldErrors.email ? "border-danger" : ""}`} type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-300">{fieldErrors.email}</p>}
          </div>
          <PasswordInput placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required error={fieldErrors.password} />
          <PasswordInput placeholder="Confirm password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required error={fieldErrors.confirmPassword} />
        </div>
        <label className="mt-4 flex items-start gap-3 text-sm text-text-secondary">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 accent-brand" />
          I agree to the terms and privacy policy.
        </label>
        <button className="btn-primary mt-5 w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"} <ArrowRight size={17} />
        </button>
        <p className="mt-5 text-center text-sm text-text-secondary">
          Already have an account? <Link to="/login" className="text-brand">Sign in</Link>
        </p>
      </form>
      )}
    </div>
  );
}
