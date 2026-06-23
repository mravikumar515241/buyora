export const FREE_SHIPPING_THRESHOLD = 499;

export const COUPON_META = {
  WELCOME10: {
    title: 'Welcome Offer',
    description: 'Get 10% off on your first order. Start your Buyora journey with extra savings.',
    terms: 'Valid for new customers only. Max discount ₹200. Cannot combine with other platform coupons.',
    offerType: 'PLATFORM',
    category: 'All Categories',
    tags: ['welcome', 'first-order'],
    badge: 'New User',
  },
  BUYORA100: {
    title: 'Flat ₹100 Off',
    description: 'Instant ₹100 discount on orders above ₹799.',
    terms: 'Minimum order ₹799. One use per customer.',
    offerType: 'PLATFORM',
    category: 'All Categories',
    tags: ['flat-discount'],
    badge: 'Popular',
  },
  BUYORA500: {
    title: 'Mega Savings',
    description: 'Save up to ₹500 on big basket orders.',
    terms: 'Minimum order ₹2,499. Max discount ₹500.',
    offerType: 'PLATFORM',
    category: 'All Categories',
    tags: ['mega-deal'],
    badge: 'Best Value',
  },
  SUMMER2026: {
    title: 'Summer Sale 2026',
    description: 'Seasonal savings on fashion, home, and lifestyle picks.',
    terms: 'Valid on eligible categories until campaign ends.',
    offerType: 'SEASONAL',
    category: 'Fashion & Home',
    tags: ['seasonal', 'summer'],
    badge: 'Seasonal',
  },
  FESTIVAL50: {
    title: 'Festival Special',
    description: 'Celebrate with 50% off up to ₹1,000 on festive collections.',
    terms: 'Max discount ₹1,000. Limited redemptions.',
    offerType: 'FESTIVAL',
    category: 'Festival Collection',
    tags: ['festival', 'limited'],
    badge: 'Limited Time',
  },
  FLASH20: {
    title: 'Flash Sale 20% Off',
    description: 'Lightning deal — 20% off for the next few hours only.',
    terms: 'Flash sale items only. While stocks last.',
    offerType: 'FLASH',
    category: 'Flash Sale',
    tags: ['flash', 'lightning'],
    badge: 'Flash Sale',
  },
};

export const HERO_BANNERS = [
  {
    id: 'mega-sale',
    title: 'Mega Sale Week',
    subtitle: 'Up to 70% off on top brands',
    cta: 'Shop Deals',
    link: '/offers',
    gradient: 'from-rose-600 via-orange-500 to-amber-500',
    badge: 'Live Now',
    endsAt: null,
  },
  {
    id: 'flash-friday',
    title: 'Flash Friday',
    subtitle: 'Lightning deals ending soon',
    cta: 'Grab Flash Deals',
    link: '/offers?type=flash',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    badge: 'Ends Tonight',
    endsAt: 'end-of-day',
  },
  {
    id: 'free-ship',
    title: 'Free Delivery',
    subtitle: 'On orders above ₹499',
    cta: 'Start Shopping',
    link: '/products',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    badge: 'Free Shipping',
    endsAt: null,
  },
];

export const CATEGORY_OFFERS = [
  { id: 'electronics', name: 'Electronics Sale', emoji: '📱', gradient: 'from-blue-600 to-indigo-700', link: '/search?q=electronics' },
  { id: 'fashion', name: 'Fashion Sale', emoji: '👗', gradient: 'from-pink-500 to-rose-600', link: '/search?q=fashion' },
  { id: 'books', name: 'Books Sale', emoji: '📚', gradient: 'from-amber-500 to-orange-600', link: '/search?q=books' },
  { id: 'home', name: 'Home Essentials', emoji: '🏠', gradient: 'from-emerald-500 to-teal-600', link: '/search?q=home' },
];

export const STATIC_OFFERS = {
  bank: [
    { id: 'hdfc', title: '10% off with HDFC Cards', subtitle: 'Max ₹300. T&C apply.', badge: 'Bank Offer' },
    { id: 'sbi', title: '5% cashback on SBI Cards', subtitle: 'On orders above ₹1,999.', badge: 'Cashback' },
  ],
  cashback: [
    { id: 'wallet', title: '5% Buyora Wallet Cashback', subtitle: 'Credit within 7 days of delivery.', badge: 'Cashback' },
  ],
  bundle: [
    { id: 'b2g1', title: 'Buy 2 Get 1 Free', subtitle: 'On select combo packs.', badge: 'Combo' },
    { id: 'b3s20', title: 'Buy 3 Save 20%', subtitle: 'Auto-applied at checkout on eligible items.', badge: 'Bundle' },
  ],
};

export function getEndOfDay() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getFlashSaleEnd() {
  const d = new Date();
  d.setHours(d.getHours() + 4, 59, 59, 999);
  return d;
}
