import { create } from 'zustand';

export const useWishlistStore = create((set) => ({
  itemCount: 0,
  wishlistedIds: new Set(),
  setItemCount: (count) => set({ itemCount: count }),
  setWishlistedIds: (ids) => set({ wishlistedIds: new Set(ids) }),
  syncFromResponse: (wishlistResponse) => {
    const items = wishlistResponse?.items ?? [];
    set({
      itemCount: wishlistResponse?.totalCount ?? items.length,
      wishlistedIds: new Set(items.map((i) => Number(i.productId))),
    });
  },
  toggleLocal: (productId, wishlisted, count) =>
    set((s) => {
      const id = Number(productId);
      const ids = new Set(s.wishlistedIds);
      if (wishlisted) ids.add(id);
      else ids.delete(id);
      return { wishlistedIds: ids, itemCount: count ?? s.itemCount };
    }),
  reset: () => set({ itemCount: 0, wishlistedIds: new Set() }),
}));
