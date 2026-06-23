import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { GlobalSearchBar } from '../search/GlobalSearchBar';
import { NotificationBell } from '../notifications/NotificationBell';

export function Navbar({ onMenuToggle, showAdminMenu }) {
  const { user, token, logout, isAdmin, isVendor } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const wishlistCount = useWishlistStore((s) => s.itemCount);
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const showCustomerNav = token && !isAdmin() && !isVendor();
  const showVendorNav = token && isVendor() && !isAdmin();
  const showAdminNav = token && isAdmin();

  const WishlistLink = ({ className = '', onClick, mobile = false }) => (
    <Link
      to="/wishlist"
      className={className}
      onClick={onClick}
    >
      {mobile ? (
        <span className="flex items-center justify-between w-full">
          <span>❤️ Wishlist</span>
          {wishlistCount > 0 && (
            <span className="bg-gradient-to-br from-pink-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-5 px-1.5 flex items-center justify-center shadow-md">
              {wishlistCount}
            </span>
          )}
        </span>
      ) : (
        <span className="relative inline-flex items-center gap-1">
          ❤️ Wishlist
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-gradient-to-br from-pink-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-5 px-1.5 flex items-center justify-center shadow-lg shadow-pink-500/40 border-2 border-white dark:border-slate-900">
              {wishlistCount}
            </span>
          )}
        </span>
      )}
    </Link>
  );

  return (
    <header className={`sticky top-0 z-50 
      bg-white/80 dark:bg-slate-900/80 
      backdrop-blur-2xl backdrop-saturate-150
      border-b border-slate-200/60 dark:border-slate-700/60 
      transition-all duration-500
      ${scrolled 
        ? 'shadow-xl shadow-slate-200/50 dark:shadow-slate-900/80' 
        : 'shadow-md shadow-slate-200/30 dark:shadow-slate-900/50'
      }`}
      style={{
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-14' : 'h-16'}`}>
          {/* Left side - Logo with hamburger menu */}
          <div className="flex items-center gap-3">
            {/* Admin hamburger only — mobile shoppers use bottom nav */}
            {showAdminMenu && (
              <div className="lg:hidden">
                <button
                  onClick={onMenuToggle}
                  className="p-2 rounded-lg 
                    bg-indigo-600/90 dark:bg-indigo-500/80 
                    text-white
                    hover:bg-indigo-700/95 dark:hover:bg-indigo-600/90
                    transition-colors min-h-[44px] min-w-[44px]"
                  aria-label="Toggle admin menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold 
              bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 
              dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400
              bg-clip-text text-transparent
              hover:scale-105 transition-transform duration-300">
              Buyora
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <GlobalSearchBar />
          </div>

          {/* Mobile quick actions */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            {token && showCustomerNav && (
              <>
                <Link to="/wishlist" className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Wishlist">
                  <span className="text-lg">❤️</span>
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-0 min-w-[16px] h-4 px-1 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Cart">
                  <span className="text-lg">🛒</span>
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-0 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {!token && (
              <Link to="/login" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 px-2 min-h-[44px] flex items-center">
                Login
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link to="/" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
              hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
              transition-all duration-300 backdrop-blur-sm">
              Home
            </Link>
            <Link to="/products" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
              hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
              transition-all duration-300 backdrop-blur-sm">
              Shop
            </Link>
            <Link to="/offers" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
              hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
              transition-all duration-300 backdrop-blur-sm">
              Offers
            </Link>

            {token ? (
              <>
                {/* Customer: Cart, Orders */}
                {showCustomerNav && (
                  <>
                    <WishlistLink className="relative px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105 transition-all duration-300 backdrop-blur-sm" />
                    <Link to="/cart" className="relative px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Cart
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 
                          bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600
                          text-white text-xs font-bold rounded-full min-w-[22px] h-5 px-1.5 
                          flex items-center justify-center
                          shadow-lg shadow-indigo-500/50 dark:shadow-indigo-400/30
                          animate-pulse
                          border-2 border-white dark:border-slate-900">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/orders" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Orders
                    </Link>
                  </>
                )}

                {/* Vendor: Vendor Dashboard, My Products, Cart, Orders */}
                {showVendorNav && (
                  <>
                    <Link to="/dashboard" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Dashboard
                    </Link>
                    <Link to="/dashboard/products" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      My Products
                    </Link>
                    <WishlistLink className="relative px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105 transition-all duration-300 backdrop-blur-sm" />
                    <Link to="/cart" className="relative px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Cart
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 
                          bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600
                          text-white text-xs font-bold rounded-full min-w-[22px] h-5 px-1.5 
                          flex items-center justify-center
                          shadow-lg shadow-indigo-500/50 dark:shadow-indigo-400/30
                          animate-pulse
                          border-2 border-white dark:border-slate-900">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/orders" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Orders
                    </Link>
                  </>
                )}

                {/* Admin: Admin Dashboard, Products (moderation), Categories, Orders, Analytics */}
                {showAdminNav && (
                  <>
                    <Link to="/admin" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Admin
                    </Link>
                    <Link to="/admin/products" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Products
                    </Link>
                    <Link to="/admin/categories" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Categories
                    </Link>
                    <Link to="/admin/orders" className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold
                      hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-105
                      transition-all duration-300 backdrop-blur-sm">
                      Orders
                    </Link>
                  </>
                )}

                <ThemeToggle />

                <NotificationBell />

                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((open) => !open)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl 
                      bg-white/60 dark:bg-slate-800/60 
                      backdrop-blur-sm
                      text-slate-700 dark:text-slate-300 font-semibold
                      hover:shadow-lg hover:scale-105
                      transition-all duration-300
                      border border-slate-300/30 dark:border-slate-600/30"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                      {user?.fullName?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">{user?.fullName}</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 
                      bg-white/90 dark:bg-slate-800/90 
                      backdrop-blur-2xl backdrop-saturate-150
                      rounded-2xl shadow-2xl 
                      border border-slate-200/60 dark:border-slate-700/60 
                      py-2 z-50
                      animate-fadeIn"
                      style={{
                        backdropFilter: 'blur(24px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                      }}>
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.fullName}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium
                          text-slate-700 dark:text-slate-300
                          hover:bg-slate-100 dark:hover:bg-slate-700
                          transition-colors"
                      >
                        My Profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium
                          text-red-600 dark:text-red-400
                          hover:bg-red-50 dark:hover:bg-red-900/20
                          transition-colors duration-200
                          flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link to="/login"><Button variant="ghost">Login</Button></Link>
                <Link to="/register"><Button>Register</Button></Link>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden pb-3">
          <GlobalSearchBar mobile />
        </div>

        {/* Legacy mobile menu — admin/vendor dashboard links only when needed */}
        {mobileMenuOpen && !showAdminMenu && false && (
          <div className="lg:hidden 
            bg-white/90 dark:bg-slate-900/90 
            backdrop-blur-2xl backdrop-saturate-150
            border-t border-slate-200/60 dark:border-slate-700/60 
            py-4 space-y-2 rounded-b-3xl shadow-xl"
            style={{
              backdropFilter: 'blur(24px) saturate(150%)',
              WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            }}>
            <div className="px-2 pb-3 md:hidden">
              <GlobalSearchBar mobile onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <Link 
              to="/" 
              className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                hover:bg-white/60 dark:hover:bg-slate-800/60 
                rounded-xl transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                hover:bg-white/60 dark:hover:bg-slate-800/60 
                rounded-xl transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>

            {token ? (
              <>
                {showCustomerNav && (
                  <>
                    <WishlistLink
                      mobile
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <Link 
                      to="/cart" 
                      className="flex items-center justify-between mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Cart</span>
                      {itemCount > 0 && (
                        <span className="bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600
                          text-white text-xs font-bold rounded-full min-w-[22px] h-5 px-1.5 
                          flex items-center justify-center shadow-md">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  </>
                )}

                {showVendorNav && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/dashboard/products" 
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Products
                    </Link>
                    <WishlistLink
                      mobile
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium hover:bg-white/60 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <Link 
                      to="/cart" 
                      className="flex items-center justify-between mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Cart</span>
                      {itemCount > 0 && (
                        <span className="bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600
                          text-white text-xs font-bold rounded-full min-w-[22px] h-5 px-1.5 
                          flex items-center justify-center shadow-md">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  </>
                )}

                {showAdminNav && (
                  <>
                    <Link 
                      to="/admin" 
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                    <Link 
                      to="/admin/products" 
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Products
                    </Link>
                    <Link 
                      to="/admin/categories" 
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Categories
                    </Link>
                    <Link 
                      to="/admin/orders" 
                      className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                        hover:bg-white/60 dark:hover:bg-slate-800/60 
                        rounded-xl transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  </>
                )}

                <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-3 mt-3 mx-2">
                  <div className="px-4 py-2.5 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block mt-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium
                      hover:bg-white/60 dark:hover:bg-slate-800/60 
                      rounded-xl transition-all duration-300"
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full mt-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-900/20
                      rounded-xl transition-all duration-300
                      flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block mx-2 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium text-center
                    hover:bg-white/60 dark:hover:bg-slate-800/60 
                    rounded-xl transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <div className="mx-2">
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
