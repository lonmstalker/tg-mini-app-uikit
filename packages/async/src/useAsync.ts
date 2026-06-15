import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
}

/**
 * Runs an async producer, re-running when `deps` change, with a stale-response
 * guard (a request id) so a fast input change or remount never lands an
 * outdated result.
 */
export function useAsync<T>(producer: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reqId = useRef(0);
  const producerRef = useRef(producer);
  producerRef.current = producer;

  const run = useCallback(() => {
    const id = ++reqId.current;
    setLoading(true);
    setError(false);
    producerRef.current()
      .then((value) => {
        if (id === reqId.current) {
          setData(value);
          setLoading(false);
        }
      })
      .catch(() => {
        if (id === reqId.current) {
          setError(true);
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { data, loading, error, reload: run };
}
