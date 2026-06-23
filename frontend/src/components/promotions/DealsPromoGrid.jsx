import { Link } from 'react-router-dom';
import { Flame, Clock, TrendingUp, Sun } from 'lucide-react';
import { useMemo } from 'react';
import { getEndOfDay, getFlashSaleEnd } from '../../config/marketingCampaigns';
import { CountdownTimer } from './CountdownTimer';

const ICONS = [Flame, Clock, Sun, TrendingUp];

const FALLBACK_DEALS = [
  {
    id: 'today',
    title: "Today's Deals",
    gradient: 'from-orange-500 to-red-600',
    link: '/offers',
    endDate: getEndOfDay(),
  },
  {
    id: 'flash',
    title: 'Flash Sale',
    gradient: 'from-violet-600 to-purple-700',
    link: '/offers?type=flash',
    endDate: getFlashSaleEnd(),
  },
  {
    id: 'limited',
    title: 'Limited Time Offers',
    gradient: 'from-amber-500 to-orange-600',
    link: '/offers?expiring=1',
    endDate: getEndOfDay(),
  },
  {
    id: 'trending',
    title: 'Trending Offers',
    gradient: 'from-emerald-500 to-teal-600',
    link: '/offers',
    endDate: null,
  },
];

function mapApiBanner(b, index) {
  return {
    id: b.id ?? index,
    title: b.title,
    gradient: b.gradient || 'from-indigo-600 to-violet-700',
    link: b.buttonLink || '/offers',
    endDate: b.endDate ? new Date(b.endDate) : null,
  };
}

export function DealsPromoGrid({ banners: apiBanners, title = 'Deals For You', subtitle }) {
  const deals = useMemo(() => {
    if (apiBanners?.length) return apiBanners.map(mapApiBanner);
    return FALLBACK_DEALS;
  }, [apiBanners]);

  if (!deals.length) return null;

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {deals.map((deal, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <Link
              key={deal.id}
              to={deal.link}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${deal.gradient} p-5 text-white min-h-[160px] flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all`}
            >
              <div>
                <Icon className="w-8 h-8 mb-3 opacity-90" aria-hidden="true" />
                <h3 className="font-bold text-lg">{deal.title}</h3>
              </div>
              {deal.endDate ? (
                <div>
                  <p className="text-xs text-white/80 mb-1">Ends in</p>
                  <CountdownTimer endDate={deal.endDate} compact />
                </div>
              ) : (
                <p className="text-xs text-white/80">Explore now →</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
