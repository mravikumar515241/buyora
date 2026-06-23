import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCouponStore = create(
  persist(
    (set) => ({
      appliedCoupon: null,
      pendingCode: '',

      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      setPendingCode: (code) => set({ pendingCode: code }),
      clearCoupon: () => set({ appliedCoupon: null, pendingCode: '' }),
    }),
    { name: 'buyora-coupon' }
  )
);
