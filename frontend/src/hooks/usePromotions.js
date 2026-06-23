import { useQuery } from '@tanstack/react-query';
import { couponService } from '../services/couponService';
import { discoveryService } from '../services/discoveryService';
import { enrichCoupon, isCouponActive } from '../utils/promotionUtils';

export function useActiveCoupons(size = 50) {
  return useQuery({
    queryKey: ['active-coupons', size],
    queryFn: async () => {
      const data = await couponService.getActiveCoupons({ page: 0, size });
      const list = data?.content ?? (Array.isArray(data) ? data : []);
      return list.filter(isCouponActive).map(enrichCoupon);
    },
    staleTime: 60_000,
  });
}

export function useFlashSaleProducts(limit = 8) {
  return useQuery({
    queryKey: ['flash-sale-products', limit],
    queryFn: async () => {
      const page = await discoveryService.search({ sort: 'best_selling', size: 24, page: 0 });
      const products = page?.content ?? [];
      return products
        .filter((p) => {
          const stock = p.availableQuantity ?? p.stock ?? 0;
          return stock > 0 && stock <= 20;
        })
        .slice(0, limit);
    },
    staleTime: 60_000,
  });
}
