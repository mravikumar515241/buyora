export function toDatetimeLocal(value) {
  if (!value) return '';
  const str = String(value);
  return str.length >= 16 ? str.slice(0, 16) : str;
}

export function fromDatetimeLocal(value) {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
}

export const BANNER_LOCATIONS = [
  { value: 'HERO', label: 'Homepage Hero Carousel' },
  { value: 'DEALS_GRID', label: 'Deals For You Grid' },
  { value: 'CATEGORY', label: 'Category Banner' },
  { value: 'FLASH_SALE', label: 'Flash Sale Banner' },
  { value: 'FESTIVAL', label: 'Festival Banner' },
  { value: 'FOOTER', label: 'Footer Promotion' },
];

export const CAMPAIGN_TYPES = [
  { value: 'FLASH_SALE', label: 'Flash Sale' },
  { value: 'FESTIVAL_SALE', label: 'Festival Sale' },
  { value: 'SEASONAL_SALE', label: 'Seasonal Sale' },
  { value: 'VENDOR_PROMOTION', label: 'Vendor Promotion' },
  { value: 'CATEGORY_PROMOTION', label: 'Category Promotion' },
  { value: 'PLATFORM_PROMOTION', label: 'Platform Promotion' },
];

export const CAMPAIGN_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'ENDED', label: 'Ended' },
];

export const VENDOR_PROMO_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'REMOVED', label: 'Removed' },
];

export function bannerToRequest(banner, overrides = {}) {
  return {
    title: banner.title,
    subtitle: banner.subtitle,
    description: banner.description,
    imageUrl: banner.imageUrl,
    mobileImageUrl: banner.mobileImageUrl,
    gradient: banner.gradient,
    buttonText: banner.buttonText,
    buttonLink: banner.buttonLink,
    badge: banner.badge,
    startDate: banner.startDate,
    endDate: banner.endDate,
    priority: banner.priority ?? 0,
    active: overrides.active ?? banner.active,
    displayLocation: banner.displayLocation,
    ...overrides,
  };
}

export function flashSaleToRequest(sale, overrides = {}) {
  return {
    title: sale.title,
    description: sale.description,
    startTime: sale.startTime,
    endTime: sale.endTime,
    active: overrides.active ?? sale.active,
    discountPercent: sale.discountPercent,
    stockAllocationLimit: sale.stockAllocationLimit,
    items: (sale.items ?? []).map((i) => ({
      productId: i.productId,
      categoryId: i.categoryId,
      allocatedStock: i.allocatedStock,
      saleLimit: i.saleLimit,
    })),
    ...overrides,
  };
}

export function announcementToRequest(announcement, overrides = {}) {
  return {
    text: announcement.text,
    link: announcement.link,
    backgroundColor: announcement.backgroundColor,
    textColor: announcement.textColor,
    priority: announcement.priority ?? 0,
    active: overrides.active ?? announcement.active,
    startTime: announcement.startTime,
    endTime: announcement.endTime,
    ...overrides,
  };
}
