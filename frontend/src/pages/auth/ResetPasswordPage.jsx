import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { passwordResetService } from '../../services/passwordResetService';
import { showToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

/**
 * Reset Password Page Component
 * 
 * PRODUCTION CONSIDERATIONS:
 * 
 * TODO: SECURITY - Password Strength Validation
 * Add comprehensive password validation:
 * - Minimum 8-12 characters
 * - Require uppercase, lowercase, number, special character
 * - Check against common password lists (e.g., haveibeenpwned API)
 * - Visual strength meter
 * 
 * TODO: SECURITY - Token Security
 * Remove /validate-token endpoint (security risk)
 * Validate token only during actual reset
 * 
 * TODO: UX - Better Password Requirements
 * Add visual indicators for each requirement:
 * - Green checkmark when requirement met
 * - Red X when requirement not met
 * - Real-time validation as user types
 * 
 * TODO: UX - Show Password Strength
 * Add password strength meter (weak/medium/strong)
 * Use libraries like: zxcvbn
 * 
 * TODO: ANALYTICS - Track Events
 * Track:
 * - Page views with valid/invalid tokens
 * - Successful password resets
 * - Failed attempts and reasons
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [validationLoading, setValidationLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setValidationLoading(false);
      return;
    }

    // Validate token on mount
    passwordResetService.validateToken(token)
      .then(response => {
        setTokenValid(response.data);
      })
      .catch(() => {
        setTokenValid(false);
      })
      .finally(() => {
        setValidationLoading(false);
      });
  }, [token]);

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }) => passwordResetService.resetPassword(token, newPassword),
    onSuccess: () => {
      showToast('Password reset successfully! Redirecting to login...', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to reset password', 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // TODO: PRODUCTION - Enforce stronger password requirements
    // - Minimum 8 characters (currently 6)
    // - Require uppercase, lowercase, number, special character
    // - Check against common password lists
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    // TODO: PRODUCTION - Add comprehensive password validation
    // const validationResult = validatePasswordStrength(newPassword);
    // if (!validationResult.isValid) {
    //   showToast(validationResult.message, 'error');
    //   return;
    // }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword });
  };

  // Loading state
  if (validationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Validating reset link...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
              Invalid or Expired Link
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This password reset link is invalid or has expired. Reset links expire after 15 minutes and can only be used once.
            </p>

            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
              
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

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
            Reset Password
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {newPassword && newPassword.length < 6 && (
              <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">
              Password Requirements:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className={newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                  {newPassword.length >= 6 ? '✓' : '•'}
                </span>
                At least 6 characters
              </li>
              <li className="flex items-center gap-2">
                <span className={/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                  {/[A-Z]/.test(newPassword) ? '✓' : '•'}
                </span>
                One uppercase letter (recommended)
              </li>
              <li className="flex items-center gap-2">
                <span className={/[0-9]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                  {/[0-9]/.test(newPassword) ? '✓' : '•'}
                </span>
                One number (recommended)
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={resetPasswordMutation.isPending || newPassword !== confirmPassword || newPassword.length < 6}
          >
            {resetPasswordMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resetting...
              </div>
            ) : (
              'Reset Password'
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

export default ResetPasswordPage;
