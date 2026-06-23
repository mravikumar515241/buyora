import { create } from 'zustand';

export const useCartStore = create((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
  incrementCart: () => set((s) => ({ itemCount: Math.max(0, s.itemCount + 1) })),
  decrementCart: () => set((s) => ({ itemCount: Math.max(0, s.itemCount - 1) })),
  syncFromResponse: (cartResponse) => {
    const count = cartResponse?.items?.reduce((acc, i) => acc + (i.quantity || 0), 0) ?? 0;
    set({ itemCount: count });
  },
}));
