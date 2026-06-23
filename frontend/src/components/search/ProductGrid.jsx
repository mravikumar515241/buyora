import { PremiumProductCard } from './PremiumProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';

export function ProductGrid({ products = [], loading = false, skeletonCount = 8 }) {
  if (loading) return <ProductGridSkeleton count={skeletonCount} />;
  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
      {products.map((p) => (
        <PremiumProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
