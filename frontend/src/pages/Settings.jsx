import { useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, Loader2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { getPortalUrl } from "../api/billing";
import PlanBadge from "../components/ui/PlanBadge";
import WordsMeter from "../components/ui/WordsMeter";
import { useAuthStore } from "../store/authStore";

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const logout = useAuthStore((state) => state.logout);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState("");
  const initials = (user?.full_name || user?.email || "H").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const saveProfile = async (event) => {
    event.preventDefault();
    setLoading("profile");
    try {
      const authApi = await import("../api/auth");
      await authApi.updateProfile(fullName);
      await fetchMe();
      toast.success("Profile updated.");
    } catch (error) {
      toast.error("Could not update profile.");
    } finally {
      setLoading("");
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setLoading("password");
    try {
      const authApi = await import("../api/auth");
      await authApi.changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      toast.success("Password changed.");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not change password.");
    } finally {
      setLoading("");
    }
  };

  const manageBilling = async () => {
    setLoading("billing");
    try {
      const data = await getPortalUrl();
      window.location.href = data.portal_url;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Billing portal is not available.");
      setLoading("");
    }
  };

  const signOut = async () => {
    setLoading("logout");
    await logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-[800px] space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-bold">Account Settings</h1>
        <p className="mt-2 text-text-secondary">Manage your profile details, workspace preferences, and billing.</p>
      </header>

      <section className="glass-card p-6">
        <div className="flex items-center gap-5 border-b border-line/80 pb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-line/80 bg-brand/15 font-heading text-2xl font-bold text-brand">
            {initials}
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold">Profile Information</h2>
            <p className="mt-1 text-sm text-text-secondary">Update your personal details here.</p>
          </div>
        </div>
        <form onSubmit={saveProfile} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-text-secondary">
            Full Name
            <input className="input-deep-focus w-full" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label className="space-y-2 text-sm text-text-secondary">
            Email Address
            <input className="input-deep-focus w-full opacity-60" value={user?.email || ""} readOnly />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary" disabled={loading === "profile"}>
              {loading === "profile" && <Loader2 className="animate-spin" size={16} />} Save
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card p-6">
        <h2 className="font-heading text-2xl font-semibold">Password</h2>
        <form onSubmit={savePassword} className="mt-5 grid gap-4 md:grid-cols-2">
          <input className="input-deep-focus w-full" type="password" placeholder="Old password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} required />
          <input className="input-deep-focus w-full" type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary" disabled={loading === "password"}>
              {loading === "password" && <Loader2 className="animate-spin" size={16} />} Change
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="flex items-center gap-3 font-heading text-2xl font-semibold">Subscription <PlanBadge plan={user?.plan || "free"} /></h2>
            <p className="mt-2 text-sm text-text-secondary">Your monthly word usage resets with your billing cycle.</p>
          </div>
          {user?.plan === "free" ? (
            <Link to="/pricing" className="btn-primary">Upgrade</Link>
          ) : (
            <button className="btn-secondary" onClick={manageBilling} disabled={loading === "billing"}>
              {loading === "billing" ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />} Manage Billing
            </button>
          )}
        </div>
        <div className="mt-5 rounded-lg border border-line/60 bg-bg-surface p-4">
          <WordsMeter used={user?.words_used_this_month || 0} limit={user?.words_limit || 500} />
        </div>
        {user?.plan === "free" && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Starter", "Pro", "Business"].map((plan) => (
              <Link key={plan} to="/pricing" className="rounded-lg border border-line/80 bg-subtle/80 p-4 transition hover:border-brand/40">
                <span className="font-heading font-semibold">{plan}</span>
                <p className="mt-2 text-sm text-text-secondary">Unlock more words and modes.</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card p-6">
        <h2 className="font-heading text-2xl font-semibold">Account Access</h2>
        <p className="mt-2 text-sm text-text-secondary">Sign out of this browser when you are done working.</p>
        <button className="btn-secondary mt-5" onClick={signOut} disabled={loading === "logout"}>
          {loading === "logout" ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
          Logout
        </button>
      </section>
    </div>
  );
}
