import { createContext, useContext, useEffect, useState } from 'react';

const BackendContext = createContext(true);

const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
  .replace(/\/api$/, '');

export function BackendProvider({ children }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const check = () =>
      fetch(`${BASE}/health`, { signal: AbortSignal.timeout(3000) })
        .then(() => setOnline(true))
        .catch(() => setOnline(false));

    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <BackendContext.Provider value={online}>
      {children}
    </BackendContext.Provider>
  );
}

export function useBackend() {
  return useContext(BackendContext);
}
