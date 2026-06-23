export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="text-center py-12 px-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
