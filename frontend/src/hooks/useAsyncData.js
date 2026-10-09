import { useCallback, useEffect, useState } from 'react';

/** Runs an async loader on mount and exposes { data, status: 'loading'|'success'|'error', error, reload }. */
export function useAsyncData(loader) {
  const [state, setState] = useState({ data: null, status: 'loading', error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, status: 'loading', error: null }));
    loader()
      .then((data) => !cancelled && setState({ data, status: 'success', error: null }))
      .catch((error) => !cancelled && setState({ data: null, status: 'error', error }));
    return () => {
      cancelled = true;
    };
  }, [loader, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
