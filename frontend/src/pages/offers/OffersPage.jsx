import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Ticket, SearchX } from 'lucide-react';
import { useActiveCoupons } from '../../hooks/usePromotions';
import { filterOffers } from '../../utils/promotionUtils';
import { CouponCard } from '../../components/promotions/CouponCard';
import { DealsPromoGrid } from '../../components/promotions/DealsPromoGrid';
import { CategoryOfferBanners } from '../../components/promotions/CategoryOfferBanners';
import { FlashSaleSection } from '../../components/promotions/FlashSaleSection';
import { useFlashSaleProducts } from '../../hooks/usePromotions';
import { Chip } from '../../components/ui/Chip';
import { useCouponStore } from '../../store/couponStore';
import { showToast } from '../../components/ui/Toast';

const FILTER_CHIPS = [
  { id: 'all', label: 'All Offers' },
  { id: 'PLATFORM', label: 'Platform' },
  { id: 'FLASH', label: 'Flash Sale' },
  { id: 'SEASONAL', label: 'Seasonal' },
  { id: 'FESTIVAL', label: 'Festival' },
];

const DISCOUNT_FILTERS = [
  { id: null, label: 'Any Discount' },
  { id: 10, label: '10%+' },
  { id: 20, label: '20%+' },
  { id: 50, label: '50%+' },
];

export function OffersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const expiringParam = searchParams.get('expiring');

  const [typeFilter, setTypeFilter] = useState(typeParam === 'flash' ? 'FLASH' : 'all');
  const [discountFilter, setDiscountFilter] = useState(null);
  const [expiringSoon, setExpiringSoon] = useState(expiringParam === '1');
  const setPendingCode = useCouponStore((s) => s.setPendingCode);

  const { data: coupons = [], isLoading } = useActiveCoupons(50);
  const { data: flashProducts = [], isLoading: flashLoading } = useFlashSaleProducts(8);

  const filtered = useMemo(
    () =>
      filterOffers(coupons, {
        type: typeFilter === 'all' ? null : typeFilter,
        minDiscount: discountFilter,
        expiringSoon,
      }),
    [coupons, typeFilter, discountFilter, expiringSoon]
  );

  const handleApply = async (coupon) => {
    setPendingCode(coupon.code);
    showToast.success(`${coupon.code} saved — apply at checkout`);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Ticket className="w-8 h-8 text-indigo-500" />
          Offers & Coupons
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Exclusive deals, flash sales, and savings — no hunting required.
        </p>
      </div>

      <DealsPromoGrid />

      {(typeFilter === 'FLASH' || typeParam === 'flash') && (
        <FlashSaleSection products={flashProducts} loading={flashLoading} />
      )}

      <CategoryOfferBanners />

      <section className="mb-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTER_CHIPS.map((f) => (
            <Chip key={f.id} active={typeFilter === f.id} onClick={() => setTypeFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {DISCOUNT_FILTERS.map((f) => (
            <Chip key={f.label} active={discountFilter === f.id} onClick={() => setDiscountFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
          <Chip active={expiringSoon} onClick={() => setExpiringSoon(!expiringSoon)}>
            Expiring Soon
          </Chip>
        </div>
      </section>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} onApply={handleApply} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
          <SearchX className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Offers</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Check back soon for new deals and coupons.</p>
          <Link to="/products" className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
