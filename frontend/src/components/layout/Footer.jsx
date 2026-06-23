import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/" className="font-bold text-indigo-600 dark:text-indigo-400">Buyora</Link>
          <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/products" className="hover:text-indigo-600 dark:hover:text-indigo-400">Products</Link>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Buyora. Multi-Vendor E-Commerce Platform.</p>
      </div>
    </footer>
  );
}
