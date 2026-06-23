import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
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
    businessName: z.string().min(3, 'Business name must be at least 3 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.string().min(10, 'Please provide a complete business address'),
    gstNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function VendorRegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Account, Step 2: Business

  useAutofillFix();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ 
    resolver: zodResolver(schema),
    mode: 'onBlur'
  });

  const password = watch('password');

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Call the combined vendor registration endpoint
      const authResponse = await authService.registerVendor({
        name: data.fullName,
        email: data.email,
        password: data.password,
        businessName: data.businessName,
        phone: data.phone,
        address: data.address,
        gstNumber: data.gstNumber || '',
      });

      return authResponse;
    },
    onSuccess: (data) => {
      if (data?.token) {
        const { token, userId, email, fullName, roles } = data;
        setAuth({ id: userId, email, fullName, roles }, token);
        navigate('/dashboard', { 
          replace: true,
          state: { message: 'Welcome! Complete your vendor setup by adding your first product.' }
        });
      }
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
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-block text-2xl font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            Buyora
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-800 dark:text-slate-100">
            Become a Vendor
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Sell your products and manage your business
          </p>
        </div>

        <Card className="shadow-lg">
          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">Account</span>
              </div>
              <div className="w-16 h-0.5 bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">Business</span>
              </div>
            </div>
          </div>

          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {currentStep === 1 && (
              <>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Personal Details
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Create your account credentials
                </p>
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
                <Button
                  type="button"
                  onClick={() => {
                    // Validate current step fields
                    const fullName = watch('fullName');
                    const email = watch('email');
                    const confirmPassword = watch('confirmPassword');
                    
                    if (fullName && email && password && confirmPassword && password === confirmPassword) {
                      setCurrentStep(2);
                    }
                  }}
                  className="w-full"
                >
                  Next: Business Information
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Business Details
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Tell us about your business
                </p>
                <Input
                  label="Business Name *"
                  placeholder="Your Business Name"
                  error={errors.businessName?.message}
                  {...register('businessName')}
                  autoComplete="organization"
                />
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 tracking-tight">
                    Business Description
                  </label>
                  <textarea
                    placeholder="Describe what your business sells..."
                    rows="3"
                    className="w-full rounded-xl border px-4 py-3 
                      bg-white dark:bg-slate-800
                      text-slate-900 dark:text-slate-100 
                      placeholder-slate-400 dark:placeholder-slate-500 
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 
                      focus:border-purple-500 dark:focus:border-purple-400
                      hover:bg-slate-50 dark:hover:bg-slate-700
                      shadow-sm hover:shadow-md
                      transition-all duration-300
                      resize-none
                      border-slate-200 dark:border-slate-600"
                  />
                </div>
                <Input
                  label="Phone Number *"
                  type="tel"
                  placeholder="+91 1234567890"
                  error={errors.phone?.message}
                  {...register('phone')}
                  autoComplete="tel"
                />
                <Input
                  label="Business Address *"
                  placeholder="Street, City, State, PIN"
                  error={errors.address?.message}
                  {...register('address')}
                  autoComplete="street-address"
                />
                <Input
                  label="GST Number (Optional)"
                  placeholder="22AAAAA0000A1Z5"
                  error={errors.gstNumber?.message}
                  {...register('gstNumber')}
                />

                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    📋 What happens next?
                  </h3>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Your vendor account will be created instantly</li>
                    <li>• You'll be redirected to your vendor dashboard</li>
                    <li>• You can start adding products immediately</li>
                    <li>• Products require admin approval before going live</li>
                    <li>• Track your sales and manage inventory</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1"
                  >
                    {mutation.isPending ? 'Creating Account...' : 'Create Vendor Account'}
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
              Login
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Want to register as a customer?{' '}
            <Link to="/register/customer" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
              Customer Registration
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
