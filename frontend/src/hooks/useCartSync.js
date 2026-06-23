import { useQuery } from '@tanstack/react-query';
import { cartService } from '../services/cartService';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useEffect } from 'react';

export function useCartSync() {
  const token = useAuthStore((s) => s.token);
  const setItemCount = useCartStore((s) => s.setItemCount);
  const syncFromResponse = useCartStore((s) => s.syncFromResponse);

  const { data } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.get(),
    enabled: !!token,
  });

  useEffect(() => {
    if (data) {
      syncFromResponse(data);
    } else if (!token) {
      setItemCount(0);
    }
  }, [data, token, syncFromResponse, setItemCount]);

  return data;
}
