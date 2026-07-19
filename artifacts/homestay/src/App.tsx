import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

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

function Router() {
  return (
    <Switch>
      {/* Admin Login Route (No Layout) */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin Routes with Layout */}
      <Route path="/admin/*">
        <AdminLayout>
          <Switch>
            <Route path="/admin" component={Dashboard} />
            <Route path="/admin/rooms" component={AdminRooms} />
            <Route path="/admin/rooms/:id/images" component={RoomImages} />
            <Route path="/admin/gallery" component={AdminGallery} />
            <Route path="/admin/media" component={MediaLibrary} />
            <Route path="/admin/bookings" component={Bookings} />
            <Route path="/admin/attractions" component={AdminAttractions} />
            <Route path="/admin/reviews" component={Reviews} />
            <Route path="/admin/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>

      {/* Public Routes with Layout */}
      <Route path="/*">
        <PublicLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/rooms" component={Rooms} />
            <Route path="/rooms/:slug" component={RoomDetail} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/amenities" component={Amenities} />
            <Route path="/attractions" component={Attractions} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/book" component={Book} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;