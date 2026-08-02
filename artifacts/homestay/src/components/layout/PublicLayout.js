import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Link, useLocation } from 'wouter';
import { useGetSettings } from '@workspace/api-client-react';
import { Menu, X, Phone, MapPin, MessageCircle, Plus, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
function useSiteNameParts(siteName) {
    return [siteName || 'Neel Kamal Homestay', 'KASAULI'];
}
export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [location] = useLocation();
    const [scrolled, setScrolled] = React.useState(false);
    const { data: settings } = useGetSettings();
    const [theme, setTheme] = React.useState('light');
    React.useEffect(() => {
        const storedTheme = localStorage.getItem('neel-kamal-theme');
        const preferredTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(preferredTheme);
        document.documentElement.classList.toggle('dark', preferredTheme === 'dark');
    }, []);
    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('neel-kamal-theme', nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };
    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const links = [
        { href: '/', label: 'Home' },
        { href: '/rooms', label: 'Rooms' },
        { href: '/gallery', label: 'Gallery' },
        { href: '/amenities', label: 'Amenities' },
        { href: '/attractions', label: 'Attractions' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];
    const isHome = location === '/';
    const navBg = scrolled ? 'bg-background/95 backdrop-blur-sm border-b shadow-sm' : isHome ? 'bg-transparent text-white' : 'bg-background border-b';
    const linkColor = scrolled || !isHome ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white';
    const logoColor = scrolled || !isHome ? 'text-primary' : 'text-white';
    const [siteTop, siteBottom] = useSiteNameParts(settings?.siteName);
    return (_jsxs("nav", { className: `fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`, children: [_jsx("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-20", children: [_jsxs(Link, { href: "/", className: `flex flex-col items-center justify-center ${logoColor}`, children: [_jsx("span", { className: "font-serif text-2xl tracking-wide leading-none", children: siteTop }), _jsx("span", { className: "text-[10px] tracking-[0.3em] font-medium opacity-80 uppercase mt-1", children: siteBottom })] }), _jsxs("div", { className: "hidden md:flex items-center space-x-8", children: [links.map((link) => (_jsx(Link, { href: link.href, className: `text-sm tracking-wide transition-colors ${location === link.href ? 'font-medium' : ''} ${linkColor}`, children: link.label }, link.href))), _jsx(Link, { href: "/book", className: `px-5 py-2 border rounded-sm text-sm tracking-wide transition-colors ${scrolled || !isHome ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' : 'border-white text-white hover:bg-white hover:text-primary'}`, children: "Book Now" }), _jsx("button", { type: "button", onClick: toggleTheme, "aria-label": `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, className: `p-2 rounded-full transition-all duration-300 hover:scale-110 ${scrolled || !isHome ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'}`, children: theme === 'dark' ? _jsx(Sun, { className: "h-4 w-4" }) : _jsx(Moon, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "md:hidden flex items-center gap-3", children: [_jsx("button", { type: "button", onClick: toggleTheme, "aria-label": `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, className: `p-2 rounded-full transition-all duration-300 hover:scale-110 ${linkColor}`, children: theme === 'dark' ? _jsx(Sun, { className: "h-5 w-5" }) : _jsx(Moon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => setIsOpen(!isOpen), className: linkColor, children: isOpen ? _jsx(X, { className: "h-6 w-6" }) : _jsx(Menu, { className: "h-6 w-6" }) })] })] }) }), isOpen && (_jsx("div", { className: "md:hidden bg-background border-b absolute top-20 left-0 w-full shadow-lg", children: _jsxs("div", { className: "px-2 pt-2 pb-6 space-y-1 sm:px-3 flex flex-col", children: [links.map((link) => (_jsx(Link, { href: link.href, onClick: () => setIsOpen(false), className: `block px-3 py-3 text-base font-medium border-b border-border/50 ${location === link.href ? 'text-primary' : 'text-foreground'}`, children: link.label }, link.href))), _jsx(Link, { href: "/book", onClick: () => setIsOpen(false), className: "block mt-4 mx-3 px-3 py-3 text-center text-base font-medium bg-primary text-primary-foreground rounded-sm", children: "Book Now" })] }) }))] }));
}
export function Footer() {
    const { data: settings } = useGetSettings();
    const [siteTop, siteBottom] = useSiteNameParts(settings?.siteName);
    return (_jsx("footer", { className: "bg-foreground text-background py-16", children: _jsxs("div", { className: "container mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-12", children: [_jsxs("div", { children: [_jsxs(Link, { href: "/", className: "inline-flex flex-col items-start mb-6", children: [_jsx("span", { className: "font-serif text-3xl tracking-wide leading-none text-background", children: siteTop }), _jsx("span", { className: "text-xs tracking-[0.3em] font-medium opacity-70 uppercase mt-2", children: siteBottom })] }), _jsx("p", { className: "text-background/70 text-sm leading-relaxed max-w-xs", children: settings?.tagline || 'A serene high-altitude retreat for urban seekers who want to disappear into the Himalayas without sacrificing comfort.' })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-serif text-xl mb-6", children: "Contact" }), _jsxs("ul", { className: "space-y-4 text-sm text-background/80", children: [_jsxs("li", { className: "flex items-start gap-3", children: [_jsx(MapPin, { className: "w-5 h-5 shrink-0 opacity-70" }), _jsx("span", { children: settings?.contactAddress || 'Village Mashobra, Kasauli, Himachal Pradesh, India' })] }), _jsxs("li", { className: "flex items-center gap-3", children: [_jsx(Phone, { className: "w-5 h-5 shrink-0 opacity-70" }), _jsx("span", { children: settings?.contactPhone || '+91 00000 00000' })] }), _jsxs("li", { className: "flex items-center gap-3", children: [_jsx(MessageCircle, { className: "w-5 h-5 shrink-0 opacity-70" }), _jsx("span", { children: settings?.contactEmail || 'hello@neelkamal.com' })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-serif text-xl mb-6", children: "Quick Links" }), _jsxs("ul", { className: "space-y-3 text-sm text-background/80", children: [_jsx("li", { children: _jsx(Link, { href: "/rooms", className: "hover:text-background transition-colors", children: "Our Rooms" }) }), _jsx("li", { children: _jsx(Link, { href: "/gallery", className: "hover:text-background transition-colors", children: "Gallery" }) }), _jsx("li", { children: _jsx(Link, { href: "/amenities", className: "hover:text-background transition-colors", children: "Amenities" }) }), _jsx("li", { children: _jsx(Link, { href: "/attractions", className: "hover:text-background transition-colors", children: "Local Attractions" }) }), _jsx("li", { children: _jsx(Link, { href: "/book", className: "hover:text-background transition-colors", children: "Book a Stay" }) })] })] })] }), _jsx("div", { className: "mt-16 pt-8 border-t border-background/20 text-center text-sm text-background/60", children: _jsx("p", { children: settings?.footerText || `© ${new Date().getFullYear()} Neel Kamal Homestay. All rights reserved.` }) })] }) }));
}
export function FloatingContact() {
    const { data: settings } = useGetSettings();
    const [open, setOpen] = React.useState(false);
    const hasActions = settings?.googleMapsUrl || settings?.contactPhone || settings?.contactWhatsapp;
    if (!hasActions)
        return null;
    const actions = [
        ...(settings?.contactWhatsapp ? [{
                label: 'WhatsApp',
                icon: MessageCircle,
                href: `https://wa.me/${settings.contactWhatsapp.replace(/\D/g, '')}`,
                external: true,
                color: 'bg-green-600 text-white hover:bg-green-700',
            }] : []),
        ...(settings?.contactPhone ? [{
                label: 'Call',
                icon: Phone,
                href: `tel:${settings.contactPhone}`,
                external: false,
                color: 'bg-blue-600 text-white hover:bg-blue-700',
            }] : []),
        ...(settings?.googleMapsUrl ? [{
                label: 'Location',
                icon: MapPin,
                href: settings.googleMapsUrl,
                external: true,
                color: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            }] : []),
    ].reverse();
    return (_jsxs("div", { className: "fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-2", children: [_jsx("div", { className: cn("flex flex-col items-end gap-2 transition-all duration-300", open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"), children: actions.map((action) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-medium text-foreground bg-background/95 backdrop-blur-sm px-2 py-1 rounded-sm shadow-sm border border-border", children: action.label }), _jsx("a", { href: action.href, target: action.external ? "_blank" : undefined, rel: action.external ? "noopener noreferrer" : undefined, onClick: () => setOpen(false), className: cn("w-11 h-11 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95", action.color), "aria-label": action.label, children: _jsx(action.icon, { className: "w-5 h-5 md:w-6 md:h-6" }) })] }, action.label))) }), _jsx("button", { onClick: () => setOpen(!open), className: cn("w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95", open ? "bg-primary text-primary-foreground rotate-45" : "bg-primary text-primary-foreground"), "aria-label": open ? "Close contact options" : "Open contact options", children: _jsx(Plus, { className: "w-6 h-6 md:w-7 md:h-7" }) })] }));
}
export default function PublicLayout({ children }) {
    const [location] = useLocation();
    React.useEffect(() => {
        window.history.scrollRestoration = 'manual';
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        const metadata = {
            '/': {
                title: 'Neel Kamal Homestay · KASAULI',
                description: 'A premium boutique homestay in Kasauli, Himachal Pradesh.',
            },
            '/rooms': {
                title: 'Rooms · Neel Kamal Homestay Kasauli',
                description: 'Discover peaceful rooms and thoughtful comforts at Neel Kamal Homestay in Kasauli.',
            },
            '/gallery': {
                title: 'Gallery · Neel Kamal Homestay Kasauli',
                description: 'Explore the rooms, views, and surroundings of Neel Kamal Homestay.',
            },
            '/amenities': {
                title: 'Amenities · Neel Kamal Homestay Kasauli',
                description: 'Enjoy thoughtful amenities and mountain comfort at Neel Kamal Homestay.',
            },
            '/attractions': {
                title: 'Attractions · Neel Kamal Homestay Kasauli',
                description: 'Discover Kasauli landmarks and mountain experiences near Neel Kamal Homestay.',
            },
            '/about': {
                title: 'About · Neel Kamal Homestay Kasauli',
                description: 'Learn the story and policies behind Neel Kamal Homestay in Kasauli.',
            },
            '/contact': {
                title: 'Contact · Neel Kamal Homestay Kasauli',
                description: 'Contact Neel Kamal Homestay to plan your mountain retreat in Kasauli.',
            },
            '/book': {
                title: 'Book Your Stay · Neel Kamal Homestay Kasauli',
                description: 'Send a booking request for your stay at Neel Kamal Homestay.',
            },
        };
        const page = metadata[location] ?? metadata['/'];
        document.title = page.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
    }, [location]);
    return (_jsxs("div", { className: "min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden transition-colors duration-300", children: [_jsx(Navbar, {}), _jsx("main", { className: "flex-1 pb-20 md:pb-0", children: _jsx(AnimatePresence, { mode: "wait", initial: false, children: _jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.3, ease: 'easeOut' }, children: children }, location) }) }), _jsx(FloatingContact, {}), _jsx(Footer, {})] }));
}
