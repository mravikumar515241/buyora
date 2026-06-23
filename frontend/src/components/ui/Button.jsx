export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, type = 'button', ...props }) {
  const base = `
    relative inline-flex items-center justify-center 
    rounded-xl font-semibold 
    transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    dark:focus:ring-offset-slate-900 
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden
    transform hover:scale-[1.02] active:scale-[0.98]
    backdrop-blur-2xl backdrop-saturate-150
  `;
  
  const variants = {
    primary: `
      bg-indigo-600/90 dark:bg-indigo-500/80
      hover:bg-indigo-700/95 dark:hover:bg-indigo-600/90
      text-white
      focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50
      shadow-lg shadow-indigo-500/30 dark:shadow-indigo-400/20
      hover:shadow-xl hover:shadow-indigo-500/40 dark:hover:shadow-indigo-400/30
      border border-indigo-400/30 dark:border-indigo-300/20
    `,
    secondary: `
      bg-slate-100/70 dark:bg-slate-700/50
      hover:bg-slate-200/80 dark:hover:bg-slate-600/60
      text-slate-800 dark:text-slate-100
      focus:ring-slate-400/50 dark:focus:ring-slate-500/50
      shadow-md shadow-slate-500/20 dark:shadow-slate-900/40
      hover:shadow-lg hover:shadow-slate-500/30 dark:hover:shadow-slate-900/50
      border border-slate-300/40 dark:border-slate-600/30
    `,
    danger: `
      bg-red-600/90 dark:bg-red-500/80
      hover:bg-red-700/95 dark:hover:bg-red-600/90
      text-white
      focus:ring-red-500/50 dark:focus:ring-red-400/50
      shadow-lg shadow-red-500/30 dark:shadow-red-400/20
      hover:shadow-xl hover:shadow-red-500/40 dark:hover:shadow-red-400/30
      border border-red-400/30 dark:border-red-300/20
    `,
    ghost: `
      bg-white/40 dark:bg-slate-800/40
      hover:bg-white/60 dark:hover:bg-slate-700/60
      text-slate-800 dark:text-slate-100
      focus:ring-slate-300/50 dark:focus:ring-slate-600/50
      shadow-md shadow-slate-500/10 dark:shadow-slate-900/30
      hover:shadow-lg hover:shadow-slate-500/20 dark:hover:shadow-slate-900/40
      border border-slate-300/30 dark:border-slate-600/30
    `,
    outline: `
      bg-transparent
      hover:bg-indigo-50 dark:hover:bg-indigo-950/40
      text-indigo-700 dark:text-indigo-300
      focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50
      border-2 border-indigo-200 dark:border-indigo-700
      hover:border-indigo-400 dark:hover:border-indigo-500
    `,
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };
  
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        ${base} 
        ${sizes[size] || sizes.md} 
        ${variants[variant] || variants.primary} 
        ${className}
        group
      `}
      style={{
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
      }}
      {...props}
    >
      {/* Water drop flowing shimmer effect */}
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 dark:via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </span>
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
