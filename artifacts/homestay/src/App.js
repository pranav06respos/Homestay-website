import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/admin/login", component: AdminLogin }), _jsx(Route, { path: "/admin/*", children: _jsx(AdminLayout, { children: _jsxs(Switch, { children: [_jsx(Route, { path: "/admin", component: Dashboard }), _jsx(Route, { path: "/admin/rooms", component: AdminRooms }), _jsx(Route, { path: "/admin/rooms/:id/images", component: RoomImages }), _jsx(Route, { path: "/admin/gallery", component: AdminGallery }), _jsx(Route, { path: "/admin/media", component: MediaLibrary }), _jsx(Route, { path: "/admin/bookings", component: Bookings }), _jsx(Route, { path: "/admin/attractions", component: AdminAttractions }), _jsx(Route, { path: "/admin/reviews", component: Reviews }), _jsx(Route, { path: "/admin/settings", component: Settings }), _jsx(Route, { component: NotFound })] }) }) }), _jsx(Route, { path: "/*", children: _jsx(PublicLayout, { children: _jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Home }), _jsx(Route, { path: "/rooms", component: Rooms }), _jsx(Route, { path: "/rooms/:slug", component: RoomDetail }), _jsx(Route, { path: "/gallery", component: Gallery }), _jsx(Route, { path: "/amenities", component: Amenities }), _jsx(Route, { path: "/attractions", component: Attractions }), _jsx(Route, { path: "/about", component: About }), _jsx(Route, { path: "/contact", component: Contact }), _jsx(Route, { path: "/book", component: Book }), _jsx(Route, { component: NotFound })] }) }) })] }));
}
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(TooltipProvider, { children: [_jsx(WouterRouter, { base: import.meta.env.BASE_URL.replace(/\/$/, ''), children: _jsx(Router, {}) }), _jsx(Toaster, {})] }) }));
}
export default App;
