import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../../services/vendorService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function VendorProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['vendor-me'], queryFn: () => vendorService.getMe() });
  const vendor = data;

  const mutation = useMutation({
    mutationFn: vendorService.updateMe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-me'] }),
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (vendor) reset({ businessName: vendor.businessName, phone: vendor.phone || '', address: vendor.address || '', gstNumber: vendor.gstNumber || '' });
  }, [vendor, reset]);

  if (isLoading) return <div className="text-slate-600 dark:text-slate-400">Loading...</div>;
  if (isError || !vendor) return <div className="text-slate-500 dark:text-slate-400">Vendor profile not found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Vendor profile</h1>
      <Card>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 max-w-md">
          <Input label="Business name" {...register('businessName')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Address" {...register('address')} />
          <Input label="GST number" {...register('gstNumber')} />
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
        </form>
      </Card>
    </div>
  );
}
