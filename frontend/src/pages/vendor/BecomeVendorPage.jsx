import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { vendorService } from '../../services/vendorService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function BecomeVendorPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const mutation = useMutation({
    mutationFn: vendorService.register,
    onSuccess: async () => {
      const meRes = await authService.me();
      if (meRes) setAuth(meRes, token);
      navigate('/dashboard');
    },
  });

  const { register, handleSubmit } = useForm();

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Become a vendor</h1>
        {mutation.error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{mutation.error.response?.data?.message || 'Registration failed'}</p>}
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input label="Business name" required {...register('businessName')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Address" {...register('address')} />
          <Input label="GST number" {...register('gstNumber')} />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? 'Submitting...' : 'Register as vendor'}</Button>
        </form>
      </Card>
    </div>
  );
}
