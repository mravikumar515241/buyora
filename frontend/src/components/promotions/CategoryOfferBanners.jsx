import { Link } from 'react-router-dom';
import { CATEGORY_OFFERS } from '../../config/marketingCampaigns';

export function CategoryOfferBanners({ banners: apiBanners, title = 'Category Offers', subtitle }) {
  const items = apiBanners?.length
    ? apiBanners.map((b) => ({
        id: b.id,
        name: b.title,
        emoji: '🛍️',
        gradient: b.gradient || 'from-indigo-600 to-violet-700',
        link: b.buttonLink || '/offers',
      }))
    : CATEGORY_OFFERS.map((c) => ({ ...c, name: c.name, link: c.link }));

  if (!items.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <Link to="/offers" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">All offers</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((cat) => (
          <Link
            key={cat.id}
            to={cat.link}
            className={`group relative overflow-hidden rounded-2xl min-h-[120px] md:min-h-[140px] bg-gradient-to-br ${cat.gradient} p-4 md:p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all`}
          >
            <span className="text-3xl mb-2 block">{cat.emoji}</span>
            <h3 className="font-bold text-base md:text-lg">{cat.name}</h3>
            <p className="text-xs text-white/80 mt-1">Shop now →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
