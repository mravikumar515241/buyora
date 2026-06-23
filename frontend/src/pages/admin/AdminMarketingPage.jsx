import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Image,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  ScrollText,
  Store,
  Ticket,
  Zap,
} from 'lucide-react';
import { MarketingAnalyticsPanel } from '../../components/admin/marketing/MarketingAnalyticsPanel';
import { BannersManager } from '../../components/admin/marketing/BannersManager';
import { CampaignsManager } from '../../components/admin/marketing/CampaignsManager';
import { FlashSalesManager } from '../../components/admin/marketing/FlashSalesManager';
import { HomepageSectionsManager } from '../../components/admin/marketing/HomepageSectionsManager';
import { AnnouncementsManager } from '../../components/admin/marketing/AnnouncementsManager';
import { MediaLibraryManager } from '../../components/admin/marketing/MediaLibraryManager';
import { VendorPromotionsManager } from '../../components/admin/marketing/VendorPromotionsManager';
import { AuditLogPanel } from '../../components/admin/marketing/AuditLogPanel';
import { Button } from '../../components/ui/Button';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'flash', label: 'Flash Sales', icon: Zap },
  { id: 'sections', label: 'Homepage', icon: LayoutGrid },
  { id: 'announcements', label: 'Announcements', icon: MessageSquare },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'vendor', label: 'Vendor Promos', icon: Store },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
];

export function AdminMarketingPage() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Marketing & Content</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage homepage, banners, campaigns, and promotions without code changes
          </p>
        </div>
        <Link to="/admin/coupons">
          <Button variant="outline">
            <Ticket className="w-4 h-4 mr-2" /> Coupon Management
          </Button>
        </Link>
      </div>

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

      {tab === 'overview' && <MarketingAnalyticsPanel />}
      {tab === 'banners' && <BannersManager />}
      {tab === 'campaigns' && <CampaignsManager />}
      {tab === 'flash' && <FlashSalesManager />}
      {tab === 'sections' && <HomepageSectionsManager />}
      {tab === 'announcements' && <AnnouncementsManager />}
      {tab === 'media' && <MediaLibraryManager />}
      {tab === 'vendor' && <VendorPromotionsManager />}
      {tab === 'audit' && <AuditLogPanel />}
    </div>
  );
}
