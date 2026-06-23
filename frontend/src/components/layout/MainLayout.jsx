import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { AnnouncementBarStrip } from '../promotions/AnnouncementBarStrip';
import { useMarketingHomepage } from '../../hooks/useMarketingHomepage';

export function MainLayout() {
  const { data: marketing } = useMarketingHomepage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      <AnnouncementBarStrip announcements={marketing?.announcements} />
      <main className="flex-1 safe-bottom md:pb-0">
        <Outlet />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
