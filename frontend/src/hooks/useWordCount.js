import { useMemo } from "react";

export function useWordCount(text) {
  return useMemo(() => {
    const matches = (text || "").trim().match(/\b[\w'-]+\b/g);
    return matches ? matches.length : 0;
  }, [text]);
}

