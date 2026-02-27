import { createContext, useContext, useRef, useState } from "react";
import Toast from "../components/ui/Toast.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = (id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
  };

  const showToast = (message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((p) => [...p, { id, message, type }]);
    const timeout = setTimeout(() => removeToast(id), 3000);
    timers.current.set(id, timeout);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[999] space-y-3">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

