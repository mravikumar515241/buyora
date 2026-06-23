export function Loader({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Loader />
    </div>
  );
}
