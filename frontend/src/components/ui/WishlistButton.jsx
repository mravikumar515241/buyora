import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../../services/wishlistService';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { LoginRequiredModal } from './LoginRequiredModal';
import { showToast } from './Toast';

export function WishlistButton({ productId, className = '', size = 'md', collectionId }) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const wishlistedIds = useWishlistStore((s) => s.wishlistedIds);
  const toggleLocal = useWishlistStore((s) => s.toggleLocal);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isWishlisted = wishlistedIds.has(Number(productId));

  const toggleMutation = useMutation({
    mutationFn: () => wishlistService.toggle(productId, collectionId),
    onMutate: () => {
      toggleLocal(productId, !isWishlisted);
    },
    onSuccess: (data) => {
      toggleLocal(productId, data.wishlisted, data.wishlistCount);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      showToast.success(data.wishlisted ? 'Added to Wishlist' : 'Removed from wishlist');
    },
    onError: () => {
      toggleLocal(productId, isWishlisted);
      showToast.error('Could not update wishlist');
    },
  });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      setLoginModalOpen(true);
      return;
    }
    toggleMutation.mutate();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={toggleMutation.isPending}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`flex items-center justify-center rounded-full
          bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm
          border border-slate-200/80 dark:border-slate-600/80
          shadow-md hover:shadow-lg hover:scale-110
          transition-all duration-200
          ${isWishlisted ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500 hover:text-red-400'}
          ${sizeClasses[size] || sizeClasses.md}
          ${className}`}
      >
        {isWishlisted ? '❤️' : '♡'}
      </button>
      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title="Sign in to save items"
        message="Save products you love and buy them later from your wishlist."
      />
    </>
  );
}
