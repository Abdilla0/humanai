import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, Copy, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { getHistory } from "../api/humanizer";

export default function History() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async (pageToLoad = 1) => {
    const data = await getHistory(pageToLoad);
    setJobs((current) => pageToLoad === 1 ? data.results : [...current, ...data.results]);
    setNext(data.next);
    setPage(pageToLoad);
  };

  useEffect(() => {
    load().catch(() => toast.error("Could not load history."));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return jobs.filter((job) => `${job.mode} ${job.humanized_text}`.toLowerCase().includes(needle));
  }, [jobs, query]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold">History</h1>
        <p className="mt-2 text-text-secondary">Review and reuse your recent humanized drafts.</p>
      </header>
      <label className="input-deep-focus flex items-center gap-3">
        <Search size={18} className="text-text-secondary" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Search history" />
      </label>

      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center text-text-secondary">
          <p>No humanized drafts yet.</p>
          <Link to="/humanizer" className="mt-4 inline-flex text-brand">Create your first one</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <article key={job.id} className="glass-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="chip">{job.mode}</span>
                    <span className="text-sm text-text-secondary">{job.word_count.toLocaleString()} words</span>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary">{new Date(job.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary h-10 w-10 p-0" title="Copy" onClick={async () => { await navigator.clipboard.writeText(job.humanized_text); toast.success("Copied."); }}>
                    <Copy size={16} />
                  </button>
                  <button className="btn-secondary h-10 px-3 py-0" onClick={() => setExpanded(expanded === job.id ? null : job.id)}>
                    {expanded === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expanded === job.id ? "Collapse" : "Expand"}
                  </button>
                </div>
              </div>
              <p className="mt-4 leading-7 text-text-primary">{expanded === job.id ? job.humanized_text : job.preview}</p>
            </article>
          ))}
          {next && (
            <button className="btn-secondary w-full" onClick={() => load(page + 1)}>
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

