import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { inventoryService } from '../../services/inventoryService';
import { wishlistService } from '../../services/wishlistService';
import { Card } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

function AnalyticsList({ title, items = [], showRating = true }) {
  if (!items.length) return null;
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100 truncate">{item.name}</span>
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 shrink-0 ml-2">
              {showRating && item.averageRating != null ? `${item.averageRating}★ · ` : ''}
              {item.reviewCount != null ? `${item.reviewCount}${showRating ? ' reviews' : ''}` : ''}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AdminDashboardPage() {
  const { data } = useQuery({ queryKey: ['admin-analytics'], queryFn: () => adminService.analytics() });
  const { data: inventoryData } = useQuery({
    queryKey: ['admin-inventory-dashboard'],
    queryFn: () => inventoryService.getAdminDashboard(),
  });
  const { data: discoveryAnalytics } = useQuery({
    queryKey: ['admin-discovery-analytics'],
    queryFn: () => adminService.discoveryAnalytics(),
  });
  const { data: reviewAnalytics } = useQuery({
    queryKey: ['admin-review-analytics'],
    queryFn: () => adminService.reviewAnalytics(),
  });
  const { data: topWishlisted = [] } = useQuery({
    queryKey: ['admin-wishlist-top'],
    queryFn: () => wishlistService.getAdminTop(10),
  });
  const { data: wishlistAnalytics } = useQuery({
    queryKey: ['admin-wishlist-analytics'],
    queryFn: () => wishlistService.getAdminAnalytics(),
  });
  const stats = data || {};
  const inventory = inventoryData || {};
  
  const chartData = [
    { name: 'Orders', value: stats.totalOrders ?? 0, color: '#6366f1' },
    { name: 'Products', value: stats.totalProducts ?? 0, color: '#8b5cf6' },
  ];

  const StatCard = ({ title, value, icon, gradient, iconBg }) => (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </h3>
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
        <div className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
          {value.toLocaleString()}
        </div>
        <div className="flex items-center text-sm">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Active
          </span>
        </div>
      </div>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor your platform's performance and activity
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/10 dark:to-purple-400/10 border border-indigo-200/50 dark:border-indigo-400/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders ?? 0}
          gradient="from-indigo-600 to-indigo-700 dark:from-indigo-400 dark:to-indigo-500"
          iconBg="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts ?? 0}
          gradient="from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500"
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="Low Stock Alerts"
          value={inventory.lowStockProducts ?? 0}
          gradient="from-orange-600 to-amber-700 dark:from-orange-400 dark:to-amber-500"
          iconBg="bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-400 dark:to-amber-500"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          title="Out of Stock"
          value={inventory.outOfStockProducts ?? 0}
          gradient="from-red-600 to-rose-700 dark:from-red-400 dark:to-rose-500"
          iconBg="bg-gradient-to-br from-red-500 to-rose-600 dark:from-red-400 dark:to-rose-500"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
      </div>

      {discoveryAnalytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsList
            title="Most Searched Keywords"
            items={(discoveryAnalytics.mostSearchedKeywords ?? []).map((k) => ({
              id: k.keyword,
              name: k.keyword,
              reviewCount: k.count,
            }))}
            showRating={false}
          />
          <AnalyticsList
            title="Searches With No Results"
            items={(discoveryAnalytics.searchesWithNoResults ?? []).map((k) => ({
              id: k.keyword,
              name: k.keyword,
              reviewCount: k.count,
            }))}
            showRating={false}
          />
          <AnalyticsList
            title="Top Converting Searches"
            items={(discoveryAnalytics.topConvertingSearches ?? []).map((k) => ({
              id: k.keyword,
              name: k.keyword,
              reviewCount: k.count,
            }))}
            showRating={false}
          />
          <AnalyticsList
            title="Most Viewed Products"
            items={(discoveryAnalytics.mostViewedProducts ?? []).map((p) => ({
              id: p.productId,
              name: p.productName,
              reviewCount: p.viewCount,
            }))}
            showRating={false}
          />
        </div>
      )}

      {reviewAnalytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsList title="Top Rated Products" items={reviewAnalytics.topRatedProducts ?? []} />
          <AnalyticsList title="Worst Rated Products" items={reviewAnalytics.worstRatedProducts ?? []} />
          <AnalyticsList title="Top Rated Vendors" items={reviewAnalytics.topRatedVendors ?? []} />
          <AnalyticsList title="Most Reviewed Products" items={reviewAnalytics.mostReviewedProducts ?? []} showRating={false} />
        </div>
      )}

      {wishlistAnalytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Saves</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{wishlistAnalytics.totalWishlistItems?.toLocaleString()}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Wishlists Created</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{wishlistAnalytics.totalCollections?.toLocaleString()}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Saves (30 days)</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{wishlistAnalytics.itemsAddedLast30Days?.toLocaleString()}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Growth</p>
            <p className={`text-3xl font-bold mt-1 ${wishlistAnalytics.growthPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {wishlistAnalytics.growthPercent > 0 ? '+' : ''}{wishlistAnalytics.growthPercent}%
            </p>
          </Card>
        </div>
      )}

      {wishlistAnalytics?.topCategories?.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Top Saved Categories</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {wishlistAnalytics.topCategories.map((c) => (
              <div key={c.categoryId} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="font-medium text-slate-800 dark:text-slate-100">{c.categoryName}</p>
                <p className="text-sm text-slate-500">{c.wishlistCount} saves</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {topWishlisted.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Most Wishlisted Products</h2>
          <div className="space-y-3">
            {topWishlisted.map((p, index) => (
              <div key={p.productId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{p.productName}</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">❤️ {p.wishlistCount} saves</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {inventory.topSellingProducts?.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {inventory.topSellingProducts.map((p) => (
              <div key={p.productId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-medium text-slate-800 dark:text-slate-100">{p.productName}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{p.totalQuantitySold} sold</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Chart */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-400/5 dark:to-purple-400/5 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Platform Overview</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Visual representation of key metrics</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Products</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="currentColor" 
                  className="opacity-20 dark:opacity-10"
                  vertical={false}
                />
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  className="text-slate-600 dark:text-slate-400"
                  tick={{ fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={{ stroke: 'currentColor', strokeOpacity: 0.1 }}
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-slate-600 dark:text-slate-400"
                  tick={{ fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={{ stroke: 'currentColor', strokeOpacity: 0.1 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar 
                  dataKey="value" 
                  radius={[12, 12, 0, 0]}
                  maxBarSize={80}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#${index === 0 ? 'order' : 'product'}Gradient)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Manage Orders', icon: '📦', link: '/admin/orders', color: 'from-blue-500 to-cyan-500' },
          { label: 'View Products', icon: '🏷️', link: '/admin/products', color: 'from-purple-500 to-pink-500' },
          { label: 'Check Reviews', icon: '⭐', link: '/admin/reviews', color: 'from-amber-500 to-orange-500' },
          { label: 'Categories', icon: '📂', link: '/admin/categories', color: 'from-emerald-500 to-teal-500' },
        ].map((action, idx) => (
          <a
            key={idx}
            href={action.link}
            className="group relative overflow-hidden rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 p-4 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-2xl">{action.icon}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {action.label}
              </span>
              <svg className="w-4 h-4 ml-auto text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
