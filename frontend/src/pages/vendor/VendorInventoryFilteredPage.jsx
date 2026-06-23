import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { Card } from '../../components/ui/Card';
import { StockBadge } from '../../components/ui/StockBadge';

const PAGE_CONFIG = {
  LOW_STOCK: {
    title: 'Low Stock Products',
    description: 'Products below your configured low stock threshold',
    empty: 'No low stock products. Great job keeping inventory healthy!',
    linkBack: '/dashboard/inventory',
  },
  OUT_OF_STOCK: {
    title: 'Out of Stock Products',
    description: 'Products with zero available inventory',
    empty: 'All products are in stock.',
    linkBack: '/dashboard/inventory',
  },
};

function ProductCard({ product }) {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{product.productName}</p>
          {product.sku && (
            <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {product.sku}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Stock: {product.stockQuantity}</span>
            <span>Reserved: {product.reservedQuantity}</span>
            <span>Sold: {product.soldQuantity ?? 0}</span>
          </div>
          <div className="mt-2">
            <StockBadge
              available={product.availableQuantity}
              stockStatus={product.stockStatus}
              lowStockThreshold={product.lowStockThreshold}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function VendorInventoryFilteredPage({ status }) {
  const config = PAGE_CONFIG[status];
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['vendor-inventory-products', status],
    queryFn: () => inventoryService.getVendorProducts(status),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to={config.linkBack}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block"
          >
            ← Back to Inventory
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{config.title}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{config.description}</p>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-40 bg-slate-100 dark:bg-slate-700 rounded-xl" />
      ) : products.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 dark:text-slate-400">{config.empty}</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.productId} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function VendorLowStockPage() {
  return <VendorInventoryFilteredPage status="LOW_STOCK" />;
}

export function VendorOutOfStockPage() {
  return <VendorInventoryFilteredPage status="OUT_OF_STOCK" />;
}
