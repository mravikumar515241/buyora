import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Image,
  LayoutGrid,
  MessageSquare,
  Ticket,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { MarketingAnalyticsPanel } from '../../components/admin/marketing/MarketingAnalyticsPanel';
import { HomepageSectionsManager } from '../../components/admin/marketing/HomepageSectionsManager';
import { BannersManager } from '../../components/admin/marketing/BannersManager';
import { FlashSalesManager } from '../../components/admin/marketing/FlashSalesManager';
import { AnnouncementsManager } from '../../components/admin/marketing/AnnouncementsManager';
import { CouponsManager } from '../../components/admin/marketing/CouponsManager';
import { Button } from '../../components/ui/Button';

const TABS = [
  { id: 'sections', label: 'Sections', icon: LayoutGrid },
  { id: 'banners', label: 'Hero Banners', icon: Image },
  { id: 'flash', label: 'Flash Sales', icon: Zap },
  { id: 'announcements', label: 'Announcements', icon: MessageSquare },
  { id: 'coupons', label: 'Coupons', icon: Ticket },
];

export function AdminHomepagePage() {
  const [tab, setTab] = useState('sections');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Homepage Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Control the entire storefront homepage — banners, sections, promotions, and announcements
          </p>
        </div>
        <Link to="/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" /> Preview Homepage
          </Button>
        </Link>
      </div>

      <MarketingAnalyticsPanel />

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 border-b border-slate-200 dark:border-slate-700">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'sections' && <HomepageSectionsManager />}
      {tab === 'banners' && <BannersManager />}
      {tab === 'flash' && <FlashSalesManager />}
      {tab === 'announcements' && <AnnouncementsManager />}
      {tab === 'coupons' && <CouponsManager />}
    </div>
  );
}
