import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useAutofillFix } from '../../hooks/useAutofillFix';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function getLoginErrorMessage(err) {
  if (!err.response) {
    return 'Unable to connect. Please try again.';
  }
  if (err.response.status === 401 || err.response.status === 403) {
    return 'Invalid email or password.';
  }
  const msg = err.response?.data?.message;
  if (msg && msg.toLowerCase().includes('unexpected error')) {
    return 'Invalid email or password.';
  }
  return msg || 'Invalid email or password.';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setItemCount = useCartStore((s) => s.setItemCount);
  const [apiError, setApiError] = useState('');
  const successMessage = location.state?.message;

  useAutofillFix();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data?.token) {
        const { token, userId, email, fullName, roles } = data;
        setAuth({ id: userId, email, fullName, roles }, token);
        setItemCount(0);
        navigate('/', { replace: true });
      }
    },
    onError: (err) => setApiError(getLoginErrorMessage(err)),
  });

  const onSubmit = (data) => {
    setApiError('');
    mutation.mutate(data);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-block text-2xl font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            Buyora
          </Link>
        </div>

        <Card className="shadow-lg">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">
            Login to Buyora
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 text-center">
            Enter your credentials to continue
          </p>

          {successMessage && (
            <p className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm" role="status">
              {successMessage}
            </p>
          )}
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
                autoComplete="current-password"
              />
              <div className="text-right mt-1">
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
              Register
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
