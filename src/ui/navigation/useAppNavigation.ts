import { useState, useEffect, useCallback } from 'react';
export function useAppNavigation() {
  const [path, setPath] = useState(window.location.pathname);
  const [notice, setNotice] = useState(false);
  useEffect(() => {
    const pop = () => {
      setPath(window.location.pathname);
      setNotice(false);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const navigate = useCallback((next: string, registered = false) => {
    window.history.pushState(null, '', next);
    setPath(next);
    setNotice(registered);
    window.scrollTo?.(0, 0);
  }, []);
  return { path, notice, navigate, clearNotice: () => setNotice(false) };
}
