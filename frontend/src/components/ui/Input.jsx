import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 tracking-tight">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border px-4 py-3 
          bg-white dark:bg-slate-800
          text-slate-900 dark:text-slate-100 
          placeholder-slate-400 dark:placeholder-slate-500 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 
          focus:border-indigo-500 dark:focus:border-indigo-400
          hover:bg-slate-50 dark:hover:bg-slate-700
          shadow-sm hover:shadow-md
          transition-all duration-300
          autofill:bg-white autofill:dark:bg-slate-800
          autofill:text-slate-900 autofill:dark:text-slate-100
          autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)] dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(30,41,59)]
          [-webkit-text-fill-color:rgb(15,23,42)] dark:[-webkit-text-fill-color:rgb(241,245,249)]
          ${error 
            ? 'border-red-400 dark:border-red-500 focus:ring-red-500/50 dark:focus:ring-red-400/50' 
            : 'border-slate-200 dark:border-slate-600'
          }`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});
