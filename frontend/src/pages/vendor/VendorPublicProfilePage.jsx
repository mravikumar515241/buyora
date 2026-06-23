import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, Package, Star, ShoppingBag } from 'lucide-react';
import { vendorService } from '../../services/vendorService';
import { discoveryService } from '../../services/discoveryService';
import { StarRating } from '../../components/ui/StarRating';
import { VendorTrustBadges } from '../../components/reviews/VendorTrustBadges';
import { ProductGrid } from '../../components/search/ProductGrid';
import { VendorReputationCard } from '../../components/reviews/VendorReputationCard';
import { Card } from '../../components/ui/Card';

function formatMemberSince(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
}

export function VendorPublicProfilePage() {
  const { id } = useParams();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['vendor-profile', id],
    queryFn: () => vendorService.getProfile(id),
    enabled: !!id,
  });

  const { data: vendorProductsPage, isLoading: productsLoading } = useQuery({
    queryKey: ['vendor-products', id],
    queryFn: () => discoveryService.search({ vendorId: id, size: 12, page: 0, sort: 'best_selling' }),
    enabled: !!id,
  });

  const products = vendorProductsPage?.content ?? [];
  const vendorRating = profile?.vendorRating != null ? Number(profile.vendorRating).toFixed(1) : '0';
  const initial = profile?.businessName?.charAt(0)?.toUpperCase() || 'V';

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-3xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <Store className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">Vendor not found.</p>
          <Link to="/search" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Browse products</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8">
      <div className="relative h-44 md:h-56 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 h-full flex items-end pb-6">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-3xl font-bold text-indigo-600">
              {initial}
            </div>
            <div className="text-white pb-1">
              <h1 className="text-2xl md:text-4xl font-bold">{profile.businessName}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StarRating rating={vendorRating} readonly />
                <span className="text-sm text-indigo-100">{vendorRating} · {profile.reviewCount ?? 0} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <nav className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700 dark:text-slate-300">{profile.businessName}</span>
        </nav>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8 mb-10">
          <div className="space-y-4">
            {profile.badges?.length > 0 && (
              <Card className="p-4">
                <VendorTrustBadges badges={profile.badges} />
              </Card>
            )}
            <VendorReputationCard
              vendorProfile={profile}
              vendorId={id}
              businessName={profile.businessName}
            />
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Package className="w-4 h-4 text-indigo-500" />
                <span className="text-slate-600 dark:text-slate-400">Member since</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto">{formatMemberSince(profile.memberSince)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShoppingBag className="w-4 h-4 text-indigo-500" />
                <span className="text-slate-600 dark:text-slate-400">Total sales</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto">{profile.totalSales ?? 0}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="w-4 h-4 text-indigo-500" />
                <span className="text-slate-600 dark:text-slate-400">Satisfaction</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto">
                  {profile.customerSatisfactionScore != null ? Number(profile.customerSatisfactionScore).toFixed(1) : '—'} / 5
                </span>
              </div>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                Products from {profile.businessName}
              </h2>
              {products.length > 0 && (
                <Link
                  to={`/search?vendorId=${id}`}
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
            <ProductGrid products={products} loading={productsLoading} skeletonCount={8} />
            {!productsLoading && products.length === 0 && (
              <Card className="p-10 text-center">
                <Package className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">This vendor has no active products yet.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
