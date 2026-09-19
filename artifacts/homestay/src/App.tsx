import { useEffect, useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useLocationProperty, navigate as wouterNavigate } from 'wouter/use-browser-location';

import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Rooms from './pages/public/Rooms';
import RoomDetail from './pages/public/RoomDetail';
import Gallery from './pages/public/Gallery';
import Amenities from './pages/public/Amenities';
import Attractions from './pages/public/Attractions';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Book from './pages/public/Book';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/Rooms';
import RoomImages from './pages/admin/RoomImages';
import AdminGallery from './pages/admin/Gallery';
import MediaLibrary from './pages/admin/MediaLibrary';
import Bookings from './pages/admin/Bookings';
import AdminAttractions from './pages/admin/Attractions';
import Reviews from './pages/admin/Reviews';
import Settings from './pages/admin/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const currentNormalizedPathname = () => {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname.replace(/\/+/g, '/') || '/';
};

// Reactive location hook that normalizes duplicate slashes and triggers instant re-renders on pushState
function useNormalizedLocation(): [string, (to: string | URL, options?: { replace?: boolean }) => void] {
  const pathname = useLocationProperty(currentNormalizedPathname, () => '/');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('//')) {
      const clean = window.location.pathname.replace(/\/+/g, '/') || '/';
      window.history.replaceState(null, '', clean + window.location.search + window.location.hash);
    }
  }, [pathname]);

  const cleanNavigate = useCallback((to: string | URL, options?: { replace?: boolean }) => {
    const toStr = typeof to === 'string' ? to : to.pathname + to.search + to.hash;
    const cleanTo = toStr.replace(/\/+/g, '/') || '/';
    wouterNavigate(cleanTo, options);
  }, []);

  return [pathname, cleanNavigate];
}

function Router() {
  return (
    <Switch>
      {/* Admin Login Route (No Layout) */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin Routes with Layout */}
      <Route path="/admin">
        <AdminLayout><Dashboard /></AdminLayout>
      </Route>
      <Route path="/admin/rooms">
        <AdminLayout><AdminRooms /></AdminLayout>
      </Route>
      <Route path="/admin/rooms/:id/images">
        <AdminLayout><RoomImages /></AdminLayout>
      </Route>
      <Route path="/admin/gallery">
        <AdminLayout><AdminGallery /></AdminLayout>
      </Route>
      <Route path="/admin/media">
        <AdminLayout><MediaLibrary /></AdminLayout>
      </Route>
      <Route path="/admin/bookings">
        <AdminLayout><Bookings /></AdminLayout>
      </Route>
      <Route path="/admin/attractions">
        <AdminLayout><AdminAttractions /></AdminLayout>
      </Route>
      <Route path="/admin/reviews">
        <AdminLayout><Reviews /></AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout><Settings /></AdminLayout>
      </Route>

      {/* Public Routes with Layout */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/rooms">
        <PublicLayout><Rooms /></PublicLayout>
      </Route>
      <Route path="/rooms/:slug">
        <PublicLayout><RoomDetail /></PublicLayout>
      </Route>
      <Route path="/gallery">
        <PublicLayout><Gallery /></PublicLayout>
      </Route>
      <Route path="/amenities">
        <PublicLayout><Amenities /></PublicLayout>
      </Route>
      <Route path="/attractions">
        <PublicLayout><Attractions /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><Contact /></PublicLayout>
      </Route>
      <Route path="/book">
        <PublicLayout><Book /></PublicLayout>
      </Route>

      {/* 404 Catch-All Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter hook={useNormalizedLocation} base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;