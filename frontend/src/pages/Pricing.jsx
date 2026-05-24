import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createCheckout, getPortalUrl, getStatus } from "../api/billing";
import PlanBadge from "../components/ui/PlanBadge";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuthStore } from "../store/authStore";

const plans = [
  { id: "free", name: "Free", price: 0, words: 500, modes: "Standard only", features: ["500 words/month", "Standard mode", "Paste text"] },
  { id: "starter", name: "Starter", price: 7, words: 5000, modes: "Standard + Casual", features: ["5,000 words/month", "Casual mode", "Priority queue"] },
  { id: "pro", name: "Pro", price: 15, words: 15000, modes: "All 4 modes + file upload", features: ["15,000 words/month", "Academic + Aggressive", "TXT, DOCX, PDF upload"] },
  { id: "business", name: "Business", price: 39, words: 50000, modes: "All 4 modes + file upload + API", features: ["50,000 words/month", "Business usage", "API access"] },
];

export default function Pricing() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [status, setStatus] = useState(null);
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const currentPlan = status?.plan || user?.plan || "free";

  useEffect(() => {
    if (token) {
      getStatus().then(setStatus).catch(() => {});
    }
  }, [token]);

  const rows = useMemo(() => ["Words/month", "Writing modes", "File upload", "API access"], []);

  const startCheckout = async (plan) => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (plan === "free") return;
    setLoadingPlan(plan);
    try {
      const data = await createCheckout(plan);
      window.location.href = data.checkout_url;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Checkout is not available.");
      setLoadingPlan(null);
    }
  };

  const manageBilling = async () => {
    setLoadingPlan("portal");
    try {
      const data = await getPortalUrl();
      window.location.href = data.portal_url;
    } catch (error) {
      toast.error(error.response?.data?.detail || "Billing portal is not available.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-12 text-text-primary md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold">Pricing</h1>
            <p className="mt-3 text-text-secondary">Choose the monthly word pool that fits your workflow.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <div className="flex w-max rounded-lg border border-line/80 bg-bg-elevated p-1">
              <button className={`rounded-md px-4 py-2 text-sm ${!annual ? "bg-brand text-white" : "text-text-secondary"}`} onClick={() => setAnnual(false)}>Monthly</button>
              <button className={`rounded-md px-4 py-2 text-sm ${annual ? "bg-brand text-white" : "text-text-secondary"}`} onClick={() => setAnnual(true)}>Annual</button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {plans.map((plan) => {
            const price = annual ? Math.round(plan.price * 0.8) : plan.price;
            const isCurrent = currentPlan === plan.id;
            return (
              <article key={plan.id} className={`glass-card p-6 ${plan.id === "pro" ? "border-brand/40 shadow-glow" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-xl font-bold">{plan.name}</h2>
                  {isCurrent && <PlanBadge plan={plan.id} />}
                </div>
                <div className="mt-5">
                  {annual && plan.price > 0 && <p className="text-sm text-text-muted line-through">${plan.price}/mo</p>}
                  <p className="text-3xl font-bold">${price}<span className="text-sm font-normal text-text-secondary">/mo</span></p>
                </div>
                <p className="mt-4 text-sm text-text-secondary">{plan.words.toLocaleString()} words/month</p>
                <p className="mt-2 text-sm text-text-secondary">{plan.modes}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle2 size={16} className="text-brand" /> {feature}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button className="btn-secondary mt-6 w-full" disabled>Current Plan</button>
                ) : currentPlan !== "free" && plan.id !== "free" ? (
                  <button className="btn-secondary mt-6 w-full" onClick={manageBilling} disabled={loadingPlan === "portal"}>
                    {loadingPlan === "portal" && <Loader2 className="animate-spin" size={16} />} Manage
                  </button>
                ) : (
                  <button className="btn-primary mt-6 w-full" onClick={() => startCheckout(plan.id)} disabled={loadingPlan === plan.id}>
                    {loadingPlan === plan.id && <Loader2 className="animate-spin" size={16} />} {plan.id === "free" ? "Start Free" : "Upgrade"}
                  </button>
                )}
              </article>
            );
          })}
        </div>

        <div className="glass-card mt-8 overflow-hidden">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line/80 text-text-secondary">
              <tr>
                <th className="p-4">Feature</th>
                {plans.map((plan) => <th key={plan.id} className="p-4">{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row} className="border-b border-line/60 last:border-0">
                  <td className="p-4 text-text-secondary">{row}</td>
                  {plans.map((plan) => (
                    <td key={`${row}-${plan.id}`} className="p-4">
                      {row === "Words/month" && plan.words.toLocaleString()}
                      {row === "Writing modes" && plan.modes}
                      {row === "File upload" && (["pro", "business"].includes(plan.id) ? "Yes" : "No")}
                      {row === "API access" && (plan.id === "business" ? "Yes" : "No")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
