import { COUPON_META, FREE_SHIPPING_THRESHOLD } from '../config/marketingCampaigns';

export function enrichCoupon(coupon) {
  const meta = COUPON_META[coupon.code] || {};
  return {
    ...coupon,
    title: meta.title || `${formatDiscountLabel(coupon)} Offer`,
    description: meta.description || `Save with code ${coupon.code}`,
    terms: meta.terms || 'Standard terms and conditions apply.',
    offerType: meta.offerType || 'PLATFORM',
    category: meta.category || 'All Categories',
    tags: meta.tags || [],
    badge: meta.badge || 'Offer',
  };
}

export function formatDiscountLabel(coupon) {
  if (!coupon) return '';
  if (coupon.discountType === 'PERCENTAGE') {
    return `${coupon.discountValue}% OFF`;
  }
  return `₹${Number(coupon.discountValue).toLocaleString('en-IN')} OFF`;
}

export function formatExpiry(validTo) {
  if (!validTo) return 'Limited time';
  const date = new Date(validTo);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isCouponActive(coupon) {
  if (!coupon?.active) return false;
  const now = new Date();
  const from = new Date(coupon.validFrom);
  const to = new Date(coupon.validTo);
  return now >= from && now <= to;
}

export function calculateDiscountClient(coupon, orderAmount) {
  const amount = Number(orderAmount) || 0;
  if (!coupon || amount <= 0) return 0;

  if (coupon.minOrderAmount != null && amount < Number(coupon.minOrderAmount)) {
    return 0;
  }

  let discount;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (amount * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscountAmount != null) {
      discount = Math.min(discount, Number(coupon.maxDiscountAmount));
    }
  } else {
    discount = Math.min(Number(coupon.discountValue), amount);
  }
  return Math.round(discount * 100) / 100;
}

export function findBestCoupon(coupons, orderAmount) {
  let best = null;
  let bestDiscount = 0;

  for (const coupon of coupons) {
    if (!isCouponActive(coupon)) continue;
    const discount = calculateDiscountClient(coupon, orderAmount);
    if (discount > bestDiscount) {
      bestDiscount = discount;
      best = coupon;
    }
  }

  return best ? { coupon: enrichCoupon(best), discountAmount: bestDiscount } : null;
}

export function getFreeShippingProgress(subtotal) {
  const total = Number(subtotal) || 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const eligible = total >= FREE_SHIPPING_THRESHOLD;
  return { remaining, progress, eligible, threshold: FREE_SHIPPING_THRESHOLD };
}

export function getPromoBadges(product) {
  const badges = [];
  const stock = product?.availableQuantity ?? product?.stock ?? 0;
  const reviews = product?.reviewCount ?? 0;
  const rating = product?.averageRating ?? 0;

  if (stock > 0 && stock <= 3) badges.push({ label: `Only ${stock} Left`, type: 'urgency' });
  else if (stock > 0 && stock <= 10) badges.push({ label: 'Selling Fast', type: 'urgency' });
  if (reviews >= 50 && rating >= 4.5) badges.push({ label: 'Best Seller', type: 'trust' });
  if (reviews >= 20 && rating >= 4) badges.push({ label: 'Trending', type: 'trend' });
  if (stock > 0 && stock <= 15) badges.push({ label: 'Limited Time Deal', type: 'deal' });

  return badges.slice(0, 2);
}

export function getFlashSalePricing(product, discountPercent = 15) {
  const price = Number(product?.price) || 0;
  const salePrice = Math.round(price * (1 - discountPercent / 100));
  return {
    originalPrice: price,
    salePrice,
    discountPercent,
    savings: price - salePrice,
  };
}

export function filterOffers(offers, filters = {}) {
  return offers.filter((offer) => {
    if (filters.type && offer.offerType !== filters.type) return false;
    if (filters.category && offer.category !== filters.category && filters.category !== 'All') {
      if (!offer.category?.toLowerCase().includes(filters.category.toLowerCase())) return false;
    }
    if (filters.minDiscount) {
      const pct = offer.discountType === 'PERCENTAGE' ? Number(offer.discountValue) : 0;
      if (pct < Number(filters.minDiscount)) return false;
    }
    if (filters.expiringSoon) {
      const daysLeft = (new Date(offer.validTo) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysLeft > 7) return false;
    }
    return true;
  });
}
