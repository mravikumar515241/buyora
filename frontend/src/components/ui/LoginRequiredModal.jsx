import { Link } from 'react-router-dom';
import { Heart, LogIn } from 'lucide-react';
import { Button } from './Button';

export function LoginRequiredModal({ open, onClose, title = 'Sign in to save items', message = 'Create an account or sign in to add products to your wishlist.' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/40 dark:to-red-900/40 flex items-center justify-center">
          <Heart className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/login" className="flex-1" onClick={onClose}>
            <Button className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link to="/register/customer" className="flex-1" onClick={onClose}>
            <Button variant="secondary" className="w-full">Create Account</Button>
          </Link>
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          Continue browsing
        </button>
      </div>
    </div>
  );
}
