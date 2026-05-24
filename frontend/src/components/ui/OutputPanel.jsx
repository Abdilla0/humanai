import { useMemo, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { motion } from "framer-motion";

import { useWordCount } from "../../hooks/useWordCount";

export default function OutputPanel({ text }) {
  const [copied, setCopied] = useState(false);
  const words = useWordCount(text);
  const filename = useMemo(() => `humanai-output-${Date.now()}.txt`, []);

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative h-full min-h-[420px]">
      <textarea
        readOnly
        value={text}
        className="input-deep-focus h-full min-h-[420px] w-full resize-none pr-28 leading-7"
      />
      <div className="absolute right-4 top-4 flex gap-2">
        <button type="button" onClick={copyText} className="btn-secondary h-10 w-10 p-0" title="Copy">
          {copied ? <Check size={17} className="text-success" /> : <Copy size={17} />}
        </button>
        <button type="button" onClick={downloadText} className="btn-secondary h-10 w-10 p-0" title="Download text">
          <Download size={17} />
        </button>
      </div>
      <span className="absolute bottom-4 right-4 rounded-full border border-line/80 bg-bg/80 px-3 py-1 text-xs text-text-secondary backdrop-blur-xl">
        {words.toLocaleString()} words
      </span>
    </motion.div>
  );
}

