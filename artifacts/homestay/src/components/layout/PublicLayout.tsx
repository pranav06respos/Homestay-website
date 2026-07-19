import React from 'react';
import { Link, useLocation } from 'wouter';
import { useGetSettings } from '@workspace/api-client-react';
import { Menu, X, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [location] = useLocation();
  const [scrolled, setScrolled] = React.useState(false);

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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className={`flex flex-col items-center justify-center ${logoColor}`}>
            <span className="font-serif text-2xl tracking-wide leading-none">Neel Kamal</span>
            <span className="text-[10px] tracking-[0.3em] font-medium opacity-80 uppercase mt-1">Homestay</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm tracking-wide transition-colors ${location === link.href ? 'font-medium' : ''} ${linkColor}`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" className={`px-5 py-2 border rounded-sm text-sm tracking-wide transition-colors ${scrolled || !isHome ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' : 'border-white text-white hover:bg-white hover:text-primary'}`}>
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={linkColor}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b absolute top-20 left-0 w-full shadow-lg">
          <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 text-base font-medium border-b border-border/50 ${location === link.href ? 'text-primary' : 'text-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setIsOpen(false)}
              className="block mt-4 mx-3 px-3 py-3 text-center text-base font-medium bg-primary text-primary-foreground rounded-sm"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  const { data: settings } = useGetSettings();

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Link href="/" className="inline-flex flex-col items-start mb-6">
              <span className="font-serif text-3xl tracking-wide leading-none text-background">Neel Kamal</span>
              <span className="text-xs tracking-[0.3em] font-medium opacity-70 uppercase mt-2">Homestay</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed max-w-xs">
              {settings?.tagline || 'A serene high-altitude retreat for urban seekers who want to disappear into the Himalayas without sacrificing comfort.'}
            </p>
          </div>
          
          <div>
            <h4 className="font-serif text-xl mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-background/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 opacity-70" />
                <span>{settings?.contactAddress || 'Village Mashobra, Kasauli, Himachal Pradesh, India'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0 opacity-70" />
                <span>{settings?.contactPhone || '+91 00000 00000'}</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 shrink-0 opacity-70" />
                <span>{settings?.contactEmail || 'hello@neelkamal.com'}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif text-xl mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-background/80">
              <li><Link href="/rooms" className="hover:text-background transition-colors">Our Rooms</Link></li>
              <li><Link href="/gallery" className="hover:text-background transition-colors">Gallery</Link></li>
              <li><Link href="/amenities" className="hover:text-background transition-colors">Amenities</Link></li>
              <li><Link href="/attractions" className="hover:text-background transition-colors">Local Attractions</Link></li>
              <li><Link href="/book" className="hover:text-background transition-colors">Book a Stay</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-background/20 text-center text-sm text-background/60">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} Neel Kamal Homestay. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
}

export function FloatingContact() {
  const { data: settings } = useGetSettings();

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      {settings?.googleMapsUrl && (
        <a 
          href={settings.googleMapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-destructive text-destructive-foreground p-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          title="Directions"
        >
          <MapPin className="w-6 h-6" />
        </a>
      )}
      
      {settings?.contactPhone && (
        <a 
          href={`tel:${settings.contactPhone}`} 
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          title="Call Us"
        >
          <Phone className="w-6 h-6" />
        </a>
      )}
      
      {settings?.contactWhatsapp && (
        <a 
          href={`https://wa.me/${settings.contactWhatsapp.replace(/\D/g,'')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          title="WhatsApp Us"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <FloatingContact />
      <Footer />
    </div>
  );
}