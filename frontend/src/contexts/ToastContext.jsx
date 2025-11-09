import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts((prev) => [...prev, toast]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onClose }) {
  const styles = {
    success: {
      bg: 'bg-green-600/90 backdrop-blur-sm',
      border: 'border border-green-500/30',
      text: 'text-white',
    },
    error: {
      bg: 'bg-red-600/90 backdrop-blur-sm',
      border: 'border border-red-500/30',
      text: 'text-white',
    },
    warning: {
      bg: 'bg-yellow-600/90 backdrop-blur-sm',
      border: 'border border-yellow-500/30',
      text: 'text-white',
    },
    info: {
      bg: 'bg-blue-600/90 backdrop-blur-sm',
      border: 'border border-blue-500/30',
      text: 'text-white',
    },
  };

  const style = styles[toast.type] || styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`${style.bg} ${style.border} ${style.text} px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}
    >
      <span className="flex-1 font-light">{toast.message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

