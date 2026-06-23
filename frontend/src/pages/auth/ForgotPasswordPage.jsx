import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { passwordResetService } from '../../services/passwordResetService';
import { showToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

/**
 * Forgot Password Page Component
 * 
 * PRODUCTION CONSIDERATIONS:
 * 
 * TODO: SECURITY - Add CAPTCHA
 * Integrate Google reCAPTCHA v3 or hCaptcha to prevent automated abuse:
 * 1. Add CAPTCHA component (e.g., react-google-recaptcha)
 * 2. Get token on form submit
 * 3. Send token to backend for verification
 * 
 * TODO: UX - Email Validation
 * Add client-side email format validation before submission
 * 
 * TODO: UX - Loading States
 * Add loading spinner or skeleton during email send
 * 
 * TODO: ANALYTICS - Track Events
 * Add analytics tracking for:
 * - Page views
 * - Form submissions
 * - Success/error rates
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: passwordResetService.forgotPassword,
    onSuccess: () => {
      setEmailSent(true);
      showToast('Password reset email sent! Check your inbox.', 'success');
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to send reset email', 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TODO: PRODUCTION - Add CAPTCHA validation here
    // const captchaToken = await captchaRef.current.executeAsync();
    // if (!captchaToken) {
    //   showToast('CAPTCHA verification failed', 'error');
    //   return;
    // }
    
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    // TODO: PRODUCTION - Send captchaToken with request
    // forgotPasswordMutation.mutate({ email, captchaToken });
    forgotPasswordMutation.mutate(email);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
              Check Your Email
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If your email is registered, you'll receive a password reset link shortly.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Important:</strong> The reset link will expire in 15 minutes and can only be used once.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn't receive the email?
              </p>
              <ul className="text-xs text-left text-gray-600 dark:text-gray-400 space-y-1 bg-gray-50 dark:bg-gray-700/30 p-3 rounded">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
            Forgot Password?
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
