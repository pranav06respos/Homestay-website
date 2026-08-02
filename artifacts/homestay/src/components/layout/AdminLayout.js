import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Link, useLocation } from 'wouter';
import { useGetAdminMe, useAdminLogout } from '@workspace/api-client-react';
import { LayoutDashboard, BedDouble, Image as ImageIcon, ImagePlus, CalendarDays, Map, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/rooms', label: 'Rooms', icon: BedDouble },
    { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
    { href: '/admin/media', label: 'Media Library', icon: ImagePlus },
    { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
    { href: '/admin/attractions', label: 'Attractions', icon: Map },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];
export default function AdminLayout({ children }) {
    const [location, setLocation] = useLocation();
    const { data: adminMe, isLoading, error } = useGetAdminMe();
    const logout = useAdminLogout();
    const { toast } = useToast();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    React.useEffect(() => {
        if (!isLoading && (!adminMe?.authenticated || error)) {
            setLocation('/admin/login');
        }
    }, [adminMe, isLoading, error, setLocation]);
    if (isLoading || !adminMe?.authenticated) {
        return _jsx("div", { className: "min-h-screen flex items-center justify-center bg-muted/20", children: "Loading..." });
    }
    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
            toast({ title: "Logged out successfully" });
            setLocation('/admin/login');
        }
        catch (err) {
            toast({ title: "Failed to log out", variant: "destructive" });
        }
    };
    const SidebarContent = () => (_jsxs("div", { className: "flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground", children: [_jsx("div", { className: "p-6 border-b border-sidebar-border", children: _jsxs(Link, { href: "/", className: "inline-flex flex-col items-start", children: [_jsx("span", { className: "font-serif text-2xl tracking-wide leading-none text-sidebar-primary", children: "Neel Kamal Homestay" }), _jsx("span", { className: "text-[10px] tracking-[0.2em] font-medium opacity-70 uppercase mt-1", children: "KASAULI \u00B7 Admin Panel" })] }) }), _jsx("nav", { className: "flex-1 py-6 px-3 space-y-1 overflow-y-auto", children: navItems.map((item) => {
                    const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/admin');
                    return (_jsxs(Link, { href: item.href, onClick: () => setMobileOpen(false), className: `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}`, children: [_jsx(item.icon, { className: `w-5 h-5 ${isActive ? 'text-sidebar-primary' : 'opacity-70'}` }), item.label] }, item.href));
                }) }), _jsx("div", { className: "p-4 border-t border-sidebar-border", children: _jsxs(Button, { variant: "ghost", className: "w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", onClick: handleLogout, disabled: logout.isPending, children: [_jsx(LogOut, { className: "w-5 h-5 mr-3 opacity-70" }), "Logout"] }) })] }));
    return (_jsxs("div", { className: "min-h-[100dvh] flex bg-muted/20", children: [_jsx("aside", { className: "hidden md:block w-64 fixed inset-y-0 left-0 z-50", children: _jsx(SidebarContent, {}) }), mobileOpen && (_jsx("div", { className: "md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm", children: _jsxs("div", { className: "fixed inset-y-0 left-0 w-64 bg-sidebar", children: [_jsx(SidebarContent, {}), _jsx("button", { className: "absolute top-6 -right-12 p-2 bg-background rounded-full shadow-md", onClick: () => setMobileOpen(false), children: _jsx(X, { className: "w-5 h-5" }) })] }) })), _jsxs("main", { className: "flex-1 md:ml-64 flex flex-col min-h-screen", children: [_jsxs("header", { className: "md:hidden flex items-center p-4 bg-background border-b border-border sticky top-0 z-40", children: [_jsx("button", { onClick: () => setMobileOpen(true), className: "p-2 -ml-2 mr-2", children: _jsx(Menu, { className: "w-6 h-6" }) }), _jsx("span", { className: "font-serif text-xl text-primary", children: "Neel Kamal Homestay \u00B7 KASAULI" })] }), _jsx("div", { className: "flex-1 p-6 lg:p-8", children: children })] })] }));
}
