import React from 'react';
import { Link, useLocation } from 'wouter';
import { useGetAdminMe, useAdminLogout } from '@workspace/api-client-react';
import { 
  LayoutDashboard, BedDouble, Image as ImageIcon, ImagePlus, 
  CalendarDays, Map, Star, Settings, LogOut, Menu, X, Sun, Moon, ExternalLink, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { AdminGuideModal, AdminSectionKey } from '@/components/admin/AdminGuideModal';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/media', label: 'Media Library', icon: ImagePlus },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/attractions', label: 'Attractions', icon: Map },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: adminMe, isLoading, error } = useGetAdminMe();
  const logout = useAdminLogout();
  const { toast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [guideOpen, setGuideOpen] = React.useState(false);

  const getCurrentSection = (): AdminSectionKey => {
    if (location.includes('/rooms/') && location.includes('/images')) return 'room-images';
    if (location.startsWith('/admin/rooms')) return 'rooms';
    if (location.startsWith('/admin/media')) return 'media';
    if (location.startsWith('/admin/gallery')) return 'gallery';
    if (location.startsWith('/admin/bookings')) return 'bookings';
    if (location.startsWith('/admin/attractions')) return 'attractions';
    if (location.startsWith('/admin/reviews')) return 'reviews';
    if (location.startsWith('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  React.useEffect(() => {
    if (!isLoading && (!adminMe?.authenticated || error)) {
      window.location.href = '/admin/login';
    }
  }, [adminMe, isLoading, error]);

  if (isLoading || !adminMe?.authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/20">Loading...</div>;
  }

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('neel_kamal_admin_jwt');
      toast({ title: "Logged out successfully" });
      window.location.href = '/admin/login';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/admin" className="inline-flex flex-col items-start">
          <span className="font-serif text-2xl tracking-wide leading-none text-sidebar-primary">Neel Kamal Homestay</span>
          <span className="text-[10px] tracking-[0.2em] font-medium opacity-70 uppercase mt-1">KASAULI · Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? (location === '/admin' || location === '/admin/')
            : (location === item.href || location.startsWith(`${item.href}/`));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-sidebar-primary' : 'opacity-70'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-1.5">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-xs"
          onClick={() => { setMobileOpen(false); setGuideOpen(true); }}
          title="Open helpful guide for this section"
        >
          <Lightbulb className="w-4 h-4 mr-3 text-amber-400" />
          <span>How this works</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 mr-3 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 mr-3 opacity-70" />
          )}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="w-5 h-5 mr-3 opacity-70" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-64 bg-sidebar">
            <SidebarContent />
            <button 
              className="absolute top-6 -right-12 p-2 bg-background rounded-full shadow-md"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <span className="font-serif text-lg text-foreground font-medium">Host Dashboard</span>
            <span className="opacity-40">·</span>
            <span className="text-[11px] uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGuideOpen(true)}
              className="gap-2 text-xs font-medium border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 bg-amber-500/5 shadow-xs"
              title="Open step-by-step guide for this section"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>How this works</span>
            </Button>
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted font-medium border border-transparent hover:border-border"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2 text-xs font-medium border-border hover:bg-muted"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-muted-foreground" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-40">
          <div className="flex items-center">
            <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 mr-2 text-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-serif text-lg text-primary font-medium">Neel Kamal Homestay</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGuideOpen(true)}
              className="gap-1.5 text-xs px-2.5 h-8 border-amber-500/30 text-amber-900 dark:text-amber-200 bg-amber-500/5"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Guide</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Contextual Walkthrough Guide Dialog */}
      <AdminGuideModal 
        open={guideOpen} 
        onOpenChange={setGuideOpen} 
        initialSection={getCurrentSection()} 
      />
    </div>
  );
}