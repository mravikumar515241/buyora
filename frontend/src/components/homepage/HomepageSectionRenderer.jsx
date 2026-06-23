import { Link } from 'react-router-dom';
import { HeroCarousel } from '../promotions/HeroCarousel';
import { FlashSaleSection } from '../promotions/FlashSaleSection';
import { DealsPromoGrid } from '../promotions/DealsPromoGrid';
import { CouponsOffersSection } from '../promotions/CouponsOffersSection';
import { VendorSpotlights } from '../promotions/VendorSpotlights';
import { SectionCarousel } from '../search/SectionCarousel';
import { ProductGridSkeleton } from '../ui/Skeleton';

function BannerGridSection({ section }) {
  const { content, title, subtitle } = section;
  return (
    <DealsPromoGrid
      banners={content?.banners}
      title={title}
      subtitle={subtitle}
    />
  );
}

function FlashSaleBlock({ section }) {
  const { content, title, subtitle } = section;
  const flashSale = content?.flashSale;
  const discount = flashSale?.discountPercent ? Number(flashSale.discountPercent) : 20;

  return (
    <FlashSaleSection
      products={content?.products ?? []}
      loading={false}
      endDate={flashSale?.endTime}
      title={flashSale?.title || title}
      subtitle={flashSale?.description || subtitle}
      discountPercent={discount}
    />
  );
}

function CategoryListSection({ section }) {
  const categories = section.content?.categories ?? [];
  if (!categories.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
          {section.subtitle && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{section.subtitle}</p>
          )}
        </div>
        {section.content?.viewAllLink && (
          <Link to={section.content.viewAllLink} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View all
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/search?categories=${cat.id}`}
            className="snap-start shrink-0 w-32 md:w-36 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50 flex items-center justify-center text-xl">
              🛍️
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">{cat.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductCarouselSection({ section }) {
  const products = section.content?.products ?? [];
  if (!products.length) return null;

  return (
    <SectionCarousel
      title={section.title}
      subtitle={section.subtitle}
      products={products}
      viewAllLink={section.content?.viewAllLink}
    />
  );
}

const RENDERERS = {
  HERO_CAROUSEL: ({ section }) => <HeroCarousel banners={section.content?.banners} />,
  BANNER_GRID: BannerGridSection,
  FLASH_SALE: FlashSaleBlock,
  PRODUCT_CAROUSEL: ProductCarouselSection,
  CATEGORY_LIST: CategoryListSection,
  COUPON_LIST: ({ section }) => (
    <CouponsOffersSection
      coupons={section.content?.coupons ?? []}
      title={section.title}
      subtitle={section.subtitle}
      limit={section.displayLimit}
    />
  ),
  VENDOR_SPOTLIGHT: ({ section }) => (
    <VendorSpotlights
      vendors={section.content?.vendors}
      title={section.title}
      subtitle={section.subtitle}
      limit={section.displayLimit}
    />
  ),
};

export function HomepageSectionRenderer({ section }) {
  const Renderer = RENDERERS[section.sectionType];
  if (!Renderer) return null;
  return <Renderer section={section} />;
}

export function HomepageSectionSkeleton() {
  return <ProductGridSkeleton count={4} />;
}
