import { useEffect, useState } from "react";

export function usePolling(jobId, fetchFn, intervalMs = 2500) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(jobId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    let timer;

    const tick = async () => {
      try {
        setIsLoading(true);
        const response = await fetchFn(jobId);
        if (!active) return;
        setData(response);
        setError(null);
        if (response.status === "done" || response.status === "failed") {
          setIsLoading(false);
          return;
        }
        timer = window.setTimeout(tick, intervalMs);
      } catch (err) {
        if (!active) return;
        setError(err);
        setIsLoading(false);
      }
    };

    tick();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [jobId, fetchFn, intervalMs]);

  return { data, isLoading, error };
}

