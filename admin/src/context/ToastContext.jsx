import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border border-white/10 text-sm font-medium animate-fade-in
                ${toast.type === 'success' ? 'bg-green-900/90 text-green-100' : ''}
                ${toast.type === 'error' ? 'bg-red-900/90 text-red-100' : ''}
                ${toast.type === 'info' ? 'bg-blue-900/90 text-blue-100' : ''}
                backdrop-blur-md min-w-[300px]
            `}
          >
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            
            <span className="flex-1">{toast.message}</span>
            
            <button 
                onClick={() => removeToast(toast.id)} 
                className="opacity-70 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
