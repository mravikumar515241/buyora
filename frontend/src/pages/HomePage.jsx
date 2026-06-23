import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { discoveryService } from '../services/discoveryService';
import { useMarketingHomepage } from '../hooks/useMarketingHomepage';
import { GlobalSearchBar } from '../components/search/GlobalSearchBar';
import { HomepageSectionRenderer } from '../components/homepage/HomepageSectionRenderer';

export function HomePage() {
  const { data: marketing } = useMarketingHomepage();
  const sections = marketing?.sections ?? [];

  const { data: trendingKeywords = [] } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: () => discoveryService.trending(),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 pb-24 md:pb-10">
      {sections.map((section) => (
        <div key={section.id ?? section.sectionKey}>
          <HomepageSectionRenderer section={section} />
          {section.sectionType === 'HERO_CAROUSEL' && (
            <div className="md:hidden mb-6">
              <GlobalSearchBar mobile className="w-full" />
            </div>
          )}
        </div>
      ))}

      {trendingKeywords.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
            Trending searches
          </h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {trendingKeywords.slice(0, 10).map((term) => (
              <Link
                key={term}
                to={`/search?q=${encodeURIComponent(term)}`}
                className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-full text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 whitespace-nowrap shrink-0"
              >
                {term}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
