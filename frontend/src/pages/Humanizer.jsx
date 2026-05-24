import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";

import { getJob, submitJob } from "../api/humanizer";
import FileUploadButton from "../components/ui/FileUploadButton";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ModeSelector from "../components/ui/ModeSelector";
import OutputPanel from "../components/ui/OutputPanel";
import UpgradeBanner from "../components/ui/UpgradeBanner";
import { usePolling } from "../hooks/usePolling";
import { useWordCount } from "../hooks/useWordCount";
import { useAuthStore } from "../store/authStore";

export default function Humanizer() {
  const user = useAuthStore((state) => state.user);
  const refreshWordsUsed = useAuthStore((state) => state.refreshWordsUsed);
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("standard");
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wordCount = useWordCount(inputText);
  const polling = usePolling(jobId, getJob, 2500);

  useEffect(() => {
    if (polling.data?.status === "done") {
      setResult(polling.data.humanized_text);
      setIsSubmitting(false);
      setJobId(null);
      refreshWordsUsed();
    }
    if (polling.data?.status === "failed") {
      toast.error(polling.data.error_message || "Humanizing failed.");
      setIsSubmitting(false);
      setJobId(null);
    }
  }, [polling.data, refreshWordsUsed]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputText.trim() && !file) {
      toast.error("Add text or upload a file first.");
      return;
    }
    setResult("");
    setIsSubmitting(true);
    try {
      const response = await submitJob(inputText, mode, file);
      setJobId(response.job_id);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response?.status === 402) toast.error("Not enough words. Upgrade plan.");
      else if (error.response?.status === 403) toast.error("Upgrade to use this mode.");
      else toast.error(error.response?.data?.detail || "Could not submit text.");
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-2">
      <section className="space-y-5">
        <header>
          <h1 className="font-heading text-3xl font-bold">Humanizer</h1>
          <p className="mt-2 text-text-secondary">Rewrite AI text into natural, cleaner human prose.</p>
        </header>
        <UpgradeBanner wordsRemaining={user?.words_remaining || 0} />
        <form onSubmit={handleSubmit} className="glass-card p-5">
          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Paste your AI-generated draft here..."
            className="input-deep-focus min-h-[320px] w-full resize-y leading-7"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/80 pt-4">
            <div className="text-sm text-text-secondary">
              {file ? file.name : `${wordCount.toLocaleString()} words`}
            </div>
            <div className="flex items-center gap-2">
              <FileUploadButton plan={user?.plan || "free"} onFile={setFile} />
              <button type="button" className="btn-secondary h-10 px-3 py-0" onClick={() => { setInputText(""); setFile(null); }}>
                <Trash2 size={16} /> Clear
              </button>
            </div>
          </div>
          <div className="mt-5">
            <ModeSelector plan={user?.plan || "free"} value={mode} onChange={setMode} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 w-full">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            Humanize
          </button>
        </form>
      </section>

      <section className="glass-card min-h-[520px] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Output</h2>
          <span className="chip">{mode}</span>
        </div>
        {isSubmitting && <LoadingSkeleton />}
        {!isSubmitting && result && <OutputPanel text={result} />}
        {!isSubmitting && !result && (
          <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-line/80 bg-bg-elevated text-center text-text-secondary">
            <p className="max-w-xs">Your humanized text will appear here when the job finishes.</p>
          </div>
        )}
      </section>
    </div>
  );
}

