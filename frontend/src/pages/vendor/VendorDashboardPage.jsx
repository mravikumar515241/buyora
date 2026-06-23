import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { wishlistService } from '../../services/wishlistService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

function StatCard({ title, value, icon, color = 'indigo' }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function VendorDashboardPage() {
  const location = useLocation();
  const successMessage = location.state?.message;

  const { data: productsData } = useQuery({
    queryKey: ['vendor-products-stats'],
    queryFn: () => productService.myProducts({ page: 0, size: 100 }),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['vendor-orders-stats'],
    queryFn: () => orderService.myOrders({ page: 0, size: 100 }),
  });

  const { data: recentProductsData } = useQuery({
    queryKey: ['vendor-recent-products'],
    queryFn: () => productService.myProducts({ page: 0, size: 5 }),
  });

  const { data: wishlistStats = [] } = useQuery({
    queryKey: ['vendor-wishlist-stats'],
    queryFn: () => wishlistService.getVendorStats(),
  });

  const products = productsData?.content ?? [];
  const totalProducts = productsData?.totalElements ?? 0;
  const totalOrders = ordersData?.totalElements ?? 0;
  const recentProducts = recentProductsData?.content ?? [];

  const approvedProducts = products.filter(p => p.status === 'APPROVED').length;
  const pendingProducts = products.filter(p => p.status === 'PENDING_APPROVAL').length;
  const modificationRequestedProducts = products.filter(p => p.status === 'MODIFICATION_REQUESTED');

  return (
    <div className="space-y-6">
      {/* Welcome Message for New Vendors */}
      {successMessage && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Vendor Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your products and track your business</p>
        </div>
        <Link to="/dashboard/products/new">
          <Button size="lg" className="shadow-lg">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Modification Requested Alert */}
      {modificationRequestedProducts.length > 0 && (
        <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <div className="text-orange-600 dark:text-orange-400 text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                {modificationRequestedProducts.length} Product{modificationRequestedProducts.length > 1 ? 's' : ''} Need{modificationRequestedProducts.length === 1 ? 's' : ''} Your Attention
              </h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                Admin has requested modifications on the following products. Please update them to resubmit for approval.
              </p>
              <div className="space-y-2">
                {modificationRequestedProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded border border-orange-200 dark:border-orange-800">
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{product.name}</span>
                      {product.adminComments && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{product.adminComments}</p>
                      )}
                    </div>
                    <Link to={`/dashboard/products/edit/${product.id}`}>
                      <Button size="sm" variant="secondary">Edit Now</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          color="indigo"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />

        <StatCard
          title="Approved Products"
          value={approvedProducts}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Pending Approval"
          value={pendingProducts}
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Orders"
          value={totalOrders}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/dashboard/products/new" className="block">
              <Button className="w-full flex items-center justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Product
              </Button>
            </Link>
            <Link to="/dashboard/products" className="block">
              <Button variant="secondary" className="w-full flex items-center justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                View All Products
              </Button>
            </Link>
            <Link to="/dashboard/inventory" className="block">
              <Button variant="secondary" className="w-full flex items-center justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Manage Inventory
              </Button>
            </Link>
            <Link to="/orders" className="block">
              <Button variant="secondary" className="w-full flex items-center justify-start">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Orders
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Recent Products</h2>
            <Link to="/dashboard/products" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
              View All →
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400 mb-4">No products yet</p>
              <Link to="/dashboard/products/new">
                <Button size="sm">Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/dashboard/products/edit/${p.id}`}
                  className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">₹{Number(p.price).toLocaleString('en-IN')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.status === 'APPROVED' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : p.status === 'REJECTED'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                    }`}>
                      {p.status === 'PENDING_APPROVAL' ? 'PENDING' : p.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Wishlist Insights */}
      {wishlistStats.filter((s) => s.wishlistCount > 0).length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Wishlist Insights</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Products customers have saved for later</p>
          <div className="space-y-2">
            {wishlistStats.filter((s) => s.wishlistCount > 0).slice(0, 5).map((stat) => (
              <div key={stat.productId} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="font-medium text-slate-800 dark:text-slate-200">{stat.productName}</span>
                <span className="text-sm text-pink-600 dark:text-pink-400 font-semibold">❤️ {stat.wishlistCount}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 border-indigo-100 dark:border-indigo-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Product Approval</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                All new products require admin approval before appearing in the marketplace. 
                Pending products will be reviewed within 24 hours.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-100 dark:border-green-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-600 dark:bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Start Selling</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Add quality products with clear images and descriptions to attract customers. 
                Keep your inventory updated for best results.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
