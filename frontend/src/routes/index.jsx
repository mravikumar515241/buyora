import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { GuestGuard } from './GuestGuard';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { CustomerRegisterPage } from '../pages/auth/CustomerRegisterPage';
import { VendorRegisterPage } from '../pages/auth/VendorRegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import { SearchResultsPage } from '../pages/search/SearchResultsPage';
import { ProductDetailPage } from '../pages/products/ProductDetailPage';
import { CartPage } from '../pages/cart/CartPage';
import { CheckoutPage } from '../pages/orders/CheckoutPage';
import { OrderHistoryPage } from '../pages/orders/OrderHistoryPage';
import { OrderDetailPage } from '../pages/orders/OrderDetailPage';
import { VendorDashboardPage } from '../pages/vendor/VendorDashboardPage';
import { VendorProfilePage } from '../pages/vendor/VendorProfilePage';
import { VendorProductListPage } from '../pages/vendor/VendorProductListPage';
import { VendorProductFormPage } from '../pages/vendor/VendorProductFormPage';
import { VendorInventoryPage } from '../pages/vendor/VendorInventoryPage';
import { VendorLowStockPage, VendorOutOfStockPage } from '../pages/vendor/VendorInventoryFilteredPage';
import { BecomeVendorPage } from '../pages/vendor/BecomeVendorPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminProductReviewPage } from '../pages/admin/AdminProductReviewPage';
import { AdminReviewsPage } from '../pages/admin/AdminReviewsPage';
import { AdminCouponsPage } from '../pages/admin/AdminCouponsPage';
import { AdminHomepagePage } from '../pages/admin/AdminHomepagePage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminVendorsPage } from '../pages/admin/AdminVendorsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import { AdminInventoryPage } from '../pages/admin/AdminInventoryPage';
import { VendorPublicProfilePage } from '../pages/vendor/VendorPublicProfilePage';
import ProfilePage from '../pages/profile/ProfilePage';
import { WishlistPage } from '../pages/wishlist/WishlistPage';
import { RecentlyViewedPage } from '../pages/discovery/RecentlyViewedPage';
import { OffersPage } from '../pages/offers/OffersPage';
import { OfferDetailPage } from '../pages/offers/OfferDetailPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { NotificationSettingsPage } from '../pages/settings/NotificationSettingsPage';
import { AdminAnnouncementsPage } from '../pages/admin/AdminAnnouncementsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'login',
        element: (
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: 'register/customer',
        element: (
          <GuestGuard>
            <CustomerRegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: 'register/vendor',
        element: (
          <GuestGuard>
            <VendorRegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <GuestGuard>
            <ForgotPasswordPage />
          </GuestGuard>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <GuestGuard>
            <ResetPasswordPage />
          </GuestGuard>
        ),
      },
      { path: 'products', element: <SearchResultsPage /> },
      { path: 'search', element: <SearchResultsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'offers', element: <OffersPage /> },
      { path: 'offers/:code', element: <OfferDetailPage /> },
      { path: 'vendor/:id', element: <VendorPublicProfilePage /> },
      {
        path: 'cart',
        element: (
          <AuthGuard>
            <CartPage />
          </AuthGuard>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <AuthGuard>
            <WishlistPage />
          </AuthGuard>
        ),
      },
      {
        path: 'recently-viewed',
        element: <RecentlyViewedPage />,
      },
      {
        path: 'checkout',
        element: (
          <AuthGuard>
            <CheckoutPage />
          </AuthGuard>
        ),
      },
      {
        path: 'orders',
        element: (
          <AuthGuard>
            <OrderHistoryPage />
          </AuthGuard>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <AuthGuard>
            <OrderDetailPage />
          </AuthGuard>
        ),
      },
      {
        path: 'profile',
        element: (
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        ),
      },
      {
        path: 'notifications',
        element: (
          <AuthGuard>
            <NotificationsPage />
          </AuthGuard>
        ),
      },
      {
        path: 'settings/notifications',
        element: (
          <AuthGuard>
            <NotificationSettingsPage />
          </AuthGuard>
        ),
      },
      {
        path: 'become-vendor',
        element: (
          <AuthGuard>
            <BecomeVendorPage />
          </AuthGuard>
        ),
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <AuthGuard allowedRoles={['VENDOR']}>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <VendorDashboardPage /> },
      { path: 'profile', element: <VendorProfilePage /> },
      { path: 'products', element: <VendorProductListPage /> },
      { path: 'products/new', element: <VendorProductFormPage /> },
      { path: 'products/edit/:id', element: <VendorProductFormPage /> },
      { path: 'inventory', element: <VendorInventoryPage /> },
      { path: 'inventory/low-stock', element: <VendorLowStockPage /> },
      { path: 'inventory/out-of-stock', element: <VendorOutOfStockPage /> },
    ],
  },
  {
    path: '/vendor',
    element: (
      <AuthGuard allowedRoles={['VENDOR']}>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { path: 'dashboard', element: <VendorDashboardPage /> },
      { path: 'products', element: <VendorProductListPage /> },
      { path: 'products/new', element: <VendorProductFormPage /> },
      { path: 'products/:id/edit', element: <VendorProductFormPage /> },
      { path: 'inventory', element: <VendorInventoryPage /> },
      { path: 'inventory/low-stock', element: <VendorLowStockPage /> },
      { path: 'inventory/out-of-stock', element: <VendorOutOfStockPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <AuthGuard allowedRoles={['ADMIN']}>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'vendors', element: <AdminVendorsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/:id/review', element: <AdminProductReviewPage /> },
      { path: 'inventory', element: <AdminInventoryPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'coupons', element: <AdminCouponsPage /> },
      { path: 'homepage', element: <AdminHomepagePage /> },
      { path: 'marketing', element: <AdminHomepagePage /> },
      { path: 'announcements', element: <AdminAnnouncementsPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
