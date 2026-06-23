import { useQuery } from '@tanstack/react-query';
import { BarChart3, Image, Megaphone, Ticket, Zap, Store } from 'lucide-react';
import { marketingService } from '../../../services/marketingService';
import { Card } from '../../ui/Card';

export function MarketingAnalyticsPanel() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-marketing-analytics'],
    queryFn: () => marketingService.getAnalytics(),
  });

  const stats = [
    { label: 'Active Banners', value: analytics?.activeBanners, total: analytics?.totalBanners, icon: Image },
    { label: 'Active Campaigns', value: analytics?.activeCampaigns, total: analytics?.totalCampaigns, icon: Megaphone },
    { label: 'Coupon Redemptions', value: analytics?.couponRedemptions, total: analytics?.totalCoupons, icon: Ticket },
    { label: 'Flash Sales', value: analytics?.totalFlashSales, icon: Zap },
    { label: 'Pending Vendor Promos', value: analytics?.pendingVendorPromotions, icon: Store },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">{stat.label}</span>
              <Icon className="w-5 h-5 text-indigo-500" />
            </div>
            {isLoading ? (
              <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value ?? 0}</p>
                {stat.total != null && (
                  <p className="text-xs text-slate-500 mt-1">of {stat.total} total</p>
                )}
              </>
            )}
          </Card>
        );
      })}
      <Card className="p-5 sm:col-span-2 lg:col-span-3 xl:col-span-5">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5" /> Performance metrics
        </h3>
        <p className="text-sm text-slate-500">
          Banner CTR, campaign revenue, and conversion tracking will populate as shoppers interact with live promotions.
        </p>
      </Card>
    </div>
  );
}
