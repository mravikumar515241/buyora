import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PremiumProductCard } from './PremiumProductCard';

export function SectionCarousel({ title, subtitle, products = [], viewAllLink, viewAllLabel = 'View all' }) {
  if (!products.length) return null;

  return (
    <section className="mb-10 animate-fade-in">
      <div className="flex items-end justify-between gap-4 mb-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">
            {viewAllLabel}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory -mx-1 px-1">
        {products.map((p) => (
          <div key={p.id} className="w-[46%] sm:w-[32%] md:w-[24%] lg:w-[18%] shrink-0 snap-start">
            <PremiumProductCard product={p} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
