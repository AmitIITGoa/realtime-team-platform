import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const ToastContext = createContext({ notify: () => {} });

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((i) => i.id !== id));
  }, []);

  const notify = useCallback((message, { type = 'error', duration = 3500 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-3 right-3 z-[1000] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-md border px-3 py-2 shadow-md bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 ${t.type === 'error' ? 'border-red-200 dark:border-red-700' : 'border-neutral-200 dark:border-neutral-600'}`}
          >
            <span className={`mt-0.5 text-sm ${t.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-200'}`}>•</span>
            <div className="text-sm">
              {t.message}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="ml-2 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
