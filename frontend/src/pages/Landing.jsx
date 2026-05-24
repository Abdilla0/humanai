import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Gift, Languages, Lock, PenLine, Sparkles, Target, Zap } from "lucide-react";

import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuthStore } from "../store/authStore";

const plans = [
  ["Free", "$0", "500 words", "Standard only"],
  ["Starter", "$7/mo", "5,000 words", "Standard + Casual"],
  ["Pro", "$15/mo", "15,000 words", "All modes + file upload"],
  ["Business", "$39/mo", "50,000 words", "All modes + API"],
];

export default function Landing() {
  const token = useAuthStore((state) => state.token);

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <nav className="sticky top-0 z-50 border-b border-line/80 bg-bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:h-16 md:px-8">
          <Link to="/" className="flex items-center gap-3 text-text-primary">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Sparkles size={24} />
            </span>
            <span className="font-heading text-lg font-extrabold tracking-normal sm:text-xl">HumanAI</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-text-secondary lg:flex">
            <Link to="/humanizer" className="flex items-center gap-2 transition hover:text-text-primary">
              <PenLine size={16} /> AI Writer
            </Link>
            <Link to="/pricing" className="flex items-center gap-2 transition hover:text-text-primary">
              <Gift size={16} className="text-warning" /> Pricing
            </Link>
            <Link to={token ? "/settings" : "/login"} className="transition hover:text-text-primary">Account</Link>
            <a href="#api" className="transition hover:text-text-primary">API</a>
            <button type="button" className="flex items-center gap-2 transition hover:text-text-primary">
              <Languages size={16} /> English
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Link to="/register" className="btn-primary px-4 py-2 text-sm sm:px-6">Start For Free</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center md:px-8 md:pb-20 md:pt-28">
          <span className="chip">Bypass Turnitin, GPTZero & more</span>
          <h1 className="mx-auto mt-6 max-w-4xl font-heading text-5xl font-extrabold leading-tight tracking-normal md:text-7xl">
            Make AI Writing Sound Human
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
            Paste your ChatGPT text. Get back natural, undetectable writing.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link to="/humanizer" className="btn-primary px-8 py-4 text-base">Try Free - No Signup <ArrowRight size={18} /></Link>
            <p className="text-sm text-text-secondary">500 words free every month. No credit card.</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2 md:px-8">
          <article className="glass-card p-6 text-left">
            <span className="rounded-full border border-danger/25 bg-danger/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-danger">AI-generated</span>
            <p className="mt-5 leading-7 text-text-secondary">
              Artificial intelligence has fundamentally transformed the way individuals approach written communication by providing efficient content generation capabilities across numerous domains.
            </p>
          </article>
          <article className="glass-card p-6 text-left">
            <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-success">After HumanAI</span>
            <p className="mt-5 leading-7 text-text-secondary">
              AI has changed how we write, mostly because it helps people get ideas down faster. The real value is in shaping that draft until it feels <span className="text-brand">clear, natural, and genuinely personal</span>.
            </p>
          </article>
        </section>

        <section className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3 px-4 py-12">
          <span className="btn-secondary py-2"><Zap size={16} /> Instant</span>
          <span className="btn-secondary py-2"><Target size={16} /> Accurate</span>
          <span className="btn-secondary py-2"><Lock size={16} /> Private</span>
        </section>

        <section id="api" className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {["Paste your AI draft", "Choose a writing mode", "Copy the human version"].map((step, index) => (
              <div key={step} className="glass-card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">{index + 1}</span>
                <h2 className="mt-5 font-heading text-xl font-bold">{step}</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">A focused workflow for quickly turning stiff drafts into cleaner, more natural writing.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <h2 className="font-heading text-3xl font-bold">Plans that scale with your writing</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {plans.map(([name, price, words, modes]) => (
              <div key={name} className="glass-card p-5">
                <h3 className="font-heading text-lg font-bold">{name}</h3>
                <p className="mt-3 text-2xl font-bold">{price}</p>
                <p className="mt-4 text-sm text-text-secondary">{words}</p>
                <p className="mt-2 text-sm text-text-secondary">{modes}</p>
                <CheckCircle2 className="mt-5 text-brand" size={18} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line/80 px-4 py-8 text-center text-sm text-text-secondary">
        HumanAI - focused writing tools for modern teams.
      </footer>
    </div>
  );
}
