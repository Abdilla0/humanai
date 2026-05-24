import { Upload, Lock } from "lucide-react";
import toast from "react-hot-toast";

import { canUploadFile } from "../../utils/planGating";

export default function FileUploadButton({ plan = "free", onFile }) {
  const enabled = canUploadFile(plan);

  return (
    <label
      title={enabled ? "Upload .txt, .docx, or .pdf" : "Pro+ only"}
      className={`btn-secondary h-10 w-10 cursor-pointer p-0 ${enabled ? "" : "opacity-50"}`}
      onClick={(event) => {
        if (!enabled) {
          event.preventDefault();
          toast.error("File upload is Pro+ only");
        }
      }}
    >
      {enabled ? <Upload size={17} /> : <Lock size={17} />}
      <input
        className="hidden"
        type="file"
        accept=".txt,.docx,.pdf"
        disabled={!enabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
    </label>
  );
}

