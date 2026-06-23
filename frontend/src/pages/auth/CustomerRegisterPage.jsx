import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { useAutofillFix } from '../../hooks/useAutofillFix';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function CustomerRegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  useAutofillFix();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) =>
      authService.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
      }),
    onSuccess: () => {
      // Don't set auth, just redirect to login
      navigate('/login', { 
        replace: true,
        state: { message: 'Registration successful! Please login to continue.' }
      });
    },
    onError: (err) => {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    },
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
          <h1 className="mt-4 text-3xl font-bold text-slate-800 dark:text-slate-100">
            Create Your Account
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Buy products and track your orders
          </p>
        </div>

        <Card className="shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">
            Customer Registration
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 text-center">
            Join Buyora to discover great products
          </p>

          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="John Doe"
              error={errors.fullName?.message}
              {...register('fullName')}
              autoComplete="name"
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              autoComplete="email"
            />
            <Input
              label="Password *"
              type="password"
              placeholder="At least 6 characters"
              error={errors.password?.message}
              {...register('password')}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password *"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
              autoComplete="new-password"
            />

            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                🎉 Benefits of joining Buyora
              </h3>
              <ul className="text-xs text-green-800 dark:text-green-300 space-y-1">
                <li>• Browse thousands of products</li>
                <li>• Fast and secure checkout</li>
                <li>• Track your orders in real-time</li>
                <li>• Leave reviews and ratings</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
              Login
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Want to sell on Buyora?{' '}
            <Link to="/register/vendor" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
              Become a Vendor
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
