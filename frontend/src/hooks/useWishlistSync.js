import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';

export function useWishlistSync() {
  const token = useAuthStore((s) => s.token);
  const syncFromResponse = useWishlistStore((s) => s.syncFromResponse);
  const reset = useWishlistStore((s) => s.reset);

  const { data } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.get(),
    enabled: !!token,
  });

  useEffect(() => {
    if (data) {
      syncFromResponse(data);
    } else if (!token) {
      reset();
    }
  }, [data, token, syncFromResponse, reset]);

  return data;
}
