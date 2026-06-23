import { useEffect, useState } from 'react';

const TOAST_DURATION = 4000;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { type = 'info', message } = e.detail || {};
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DURATION);
    };
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  const getToastStyles = (type) => {
    const baseStyles = "rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-xl border transition-all duration-500 animate-slideIn flex items-start gap-4 min-w-[340px] max-w-md pointer-events-auto";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-br from-emerald-50/95 via-green-50/95 to-teal-50/95 dark:from-emerald-900/40 dark:via-green-900/40 dark:to-teal-900/40 border border-emerald-200/50 dark:border-emerald-700/50 shadow-emerald-500/20 dark:shadow-emerald-500/10`;
      case 'error':
        return `${baseStyles} bg-gradient-to-br from-red-50/95 via-rose-50/95 to-pink-50/95 dark:from-red-900/40 dark:via-rose-900/40 dark:to-pink-900/40 border border-red-200/50 dark:border-red-700/50 shadow-red-500/20 dark:shadow-red-500/10`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-br from-amber-50/95 via-yellow-50/95 to-orange-50/95 dark:from-amber-900/40 dark:via-yellow-900/40 dark:to-orange-900/40 border border-amber-200/50 dark:border-amber-700/50 shadow-amber-500/20 dark:shadow-amber-500/10`;
      default:
        return `${baseStyles} bg-gradient-to-br from-slate-50/95 via-gray-50/95 to-zinc-50/95 dark:from-slate-800/95 dark:via-gray-800/95 dark:to-zinc-800/95 border border-slate-200/50 dark:border-slate-600/50 shadow-slate-500/20 dark:shadow-slate-500/10`;
    }
  };

  const getIcon = (type) => {
    const iconBase = "flex-shrink-0 rounded-full p-2 shadow-lg backdrop-blur-sm";
    
    switch (type) {
      case 'success':
        return (
          <div className={`${iconBase} bg-gradient-to-br from-emerald-400 to-green-500 dark:from-emerald-500 dark:to-green-600`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className={`${iconBase} bg-gradient-to-br from-red-400 to-rose-500 dark:from-red-500 dark:to-rose-600`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className={`${iconBase} bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${iconBase} bg-gradient-to-br from-indigo-400 to-blue-500 dark:from-indigo-500 dark:to-blue-600`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-emerald-900 dark:text-emerald-50';
      case 'error':
        return 'text-red-900 dark:text-red-50';
      case 'warning':
        return 'text-amber-900 dark:text-amber-50';
      default:
        return 'text-slate-900 dark:text-slate-50';
    }
  };

  const getCloseButtonColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50';
      case 'error':
        return 'text-red-700 dark:text-red-300 hover:bg-red-200/50 dark:hover:bg-red-800/50';
      case 'warning':
        return 'text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/50';
      default:
        return 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={getToastStyles(t.type)}
          style={{
            animation: 'toastSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1), toastFadeOut 0.4s ease-in 3.6s forwards',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          {getIcon(t.type)}
          <div className="flex-1 pt-0.5">
            <p className={`text-[15px] font-semibold leading-snug tracking-tight ${getTextColor(t.type)}`}>
              {t.message}
            </p>
          </div>
          
          {/* Dismiss Button */}
          <button
            onClick={() => dismissToast(t.id)}
            className={`flex-shrink-0 rounded-lg p-1.5 transition-all duration-200 hover:scale-110 active:scale-95 ${getCloseButtonColor(t.type)}`}
            aria-label="Dismiss notification"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function showToast(message, type = 'info') {
  window.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }));
}

showToast.success = (message) => showToast(message, 'success');
showToast.error = (message) => showToast(message, 'error');
showToast.warning = (message) => showToast(message, 'warning');
showToast.info = (message) => showToast(message, 'info');

