import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { HERO_BANNERS } from '../../config/marketingCampaigns';
import { CountdownTimer } from './CountdownTimer';
import { Button } from '../ui/Button';

function mapApiBanner(b) {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    cta: b.buttonText || 'Shop Now',
    link: b.buttonLink || '/offers',
    gradient: b.gradient || 'from-indigo-600 via-violet-600 to-purple-700',
    badge: b.badge,
    imageUrl: b.imageUrl,
    mobileImageUrl: b.mobileImageUrl,
    endsAt: b.endDate,
  };
}

export function HeroCarousel({ banners: apiBanners }) {
  const banners = useMemo(() => {
    if (apiBanners?.length) return apiBanners.map(mapApiBanner);
    return HERO_BANNERS.map((b) => ({
      ...b,
      cta: b.cta,
      link: b.link,
      endsAt: b.endsAt === 'end-of-day' ? new Date(new Date().setHours(23, 59, 59, 999)).toISOString() : null,
    }));
  }, [apiBanners]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!banners.length) return null;

  const banner = banners[index];
  const endDate = banner.endsAt ? new Date(banner.endsAt) : null;

  return (
    <section className="relative mb-8 rounded-3xl overflow-hidden" aria-label="Promotional banners">
      <div className={`relative min-h-[220px] md:min-h-[320px] ${banner.imageUrl ? '' : `bg-gradient-to-r ${banner.gradient}`}`}>
        {banner.imageUrl && (
          <>
            <img src={banner.imageUrl} alt="" className="hidden md:block absolute inset-0 w-full h-full object-cover" />
            <img src={banner.mobileImageUrl || banner.imageUrl} alt="" className="md:hidden absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        {!banner.imageUrl && (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,white,transparent_45%)]" />
        )}
        <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-white max-w-xl animate-fade-in">
            {banner.badge && (
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-wide mb-3">
                {banner.badge}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{banner.title}</h1>
            <p className="text-white/90 text-base md:text-lg mb-4">{banner.subtitle}</p>
            {endDate && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-white/80 mb-2">Ends in</p>
                <CountdownTimer endDate={endDate} />
              </div>
            )}
            <Link to={banner.link}>
              <Button className="bg-white text-slate-900 hover:bg-white/90 min-h-[48px] px-8 font-bold">
                {banner.cta}
              </Button>
            </Link>
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id || i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                  aria-label={`Go to banner ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 text-white items-center justify-center hover:bg-black/30"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % banners.length)}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 text-white items-center justify-center hover:bg-black/30"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
