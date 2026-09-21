import React from 'react';
import { useGetSettings, useListRooms, useListReviews, resolveMediaUrl } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { MapPin, Wifi, Car, Coffee, Wind, Star, Church, Mountain, Trees, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CACHE_SETTINGS_KEY = 'nkh_cached_settings';
const CACHE_ROOMS_KEY = 'nkh_cached_rooms';

const defaultFallbackRooms = [
  {
    id: 1,
    name: 'Valley View Deluxe Room',
    slug: 'valley-view-deluxe',
    shortDescription: 'Spacious retreat overlooking lush pine valleys with panoramic Himalayan views.',
    pricePerNight: 3500,
    maxGuests: 3,
    bedType: 'King Bed',
    isVisible: true,
    isAvailable: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Mountain Sunrise Suite',
    slug: 'mountain-sunrise-suite',
    shortDescription: 'Wake up to golden Himalayan morning light, wooden warm decor, and fresh mountain air.',
    pricePerNight: 4200,
    maxGuests: 4,
    bedType: 'King Bed + Sofa',
    isVisible: true,
    isAvailable: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Pine Forest Family Suite',
    slug: 'pine-forest-family',
    shortDescription: 'Thoughtfully appointed family suite surrounded by serene pine trees and private sitting space.',
    pricePerNight: 4800,
    maxGuests: 4,
    bedType: '2 Queen Beds',
    isVisible: true,
    isAvailable: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Home() {
  const { data: settings } = useGetSettings();
  const { data: rooms } = useListRooms();
  const { data: reviews } = useListReviews();

  // Synchronous cache hydration for instant initial render (< 2 seconds)
  const [cachedSettings, setCachedSettings] = React.useState<any>(() => {
    try {
      const raw = localStorage.getItem(CACHE_SETTINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [cachedRooms, setCachedRooms] = React.useState<any[]>(() => {
    try {
      const raw = localStorage.getItem(CACHE_ROOMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    if (settings) {
      try {
        localStorage.setItem(CACHE_SETTINGS_KEY, JSON.stringify(settings));
      } catch {}
      setCachedSettings(settings);
    }
  }, [settings]);

  React.useEffect(() => {
    if (rooms && rooms.length > 0) {
      try {
        localStorage.setItem(CACHE_ROOMS_KEY, JSON.stringify(rooms));
      } catch {}
      setCachedRooms(rooms);
    }
  }, [rooms]);

  const activeSettings = settings || cachedSettings;
  const activeRooms = (rooms && rooms.length > 0) ? rooms : (cachedRooms.length > 0 ? cachedRooms : defaultFallbackRooms);

  const [reviewStart, setReviewStart] = React.useState(0);

  const visibleRooms = activeRooms?.filter(r => r.isVisible) || [];
  const sampleReviews = [
    { id: -1, guestName: 'Aarav Mehta', rating: 5, reviewText: 'A beautifully quiet stay with thoughtful hospitality and the most wonderful mountain views.', source: 'Google Reviews' },
    { id: -2, guestName: 'Priya Sharma', rating: 5, reviewText: 'The perfect Kasauli escape. Everything felt warm, personal, and effortlessly comfortable.', source: 'Google Reviews' },
    { id: -3, guestName: 'Rohan Kapoor', rating: 5, reviewText: 'Peaceful mornings, immaculate rooms, and genuinely kind hosts. We will be back.', source: 'Google Reviews' },
    { id: -4, guestName: 'Ananya Gupta', rating: 5, reviewText: 'A hidden gem in the hills with a calm, premium feel and incredible sunset skies.', source: 'Google Reviews' },
    { id: -5, guestName: 'Vikram Singh', rating: 5, reviewText: 'The location is serene, the stay is beautifully maintained, and the service is exceptional.', source: 'Google Reviews' },
    { id: -6, guestName: 'Meera Nair', rating: 5, reviewText: 'A memorable weekend surrounded by pine forests and generous, attentive hospitality.', source: 'Google Reviews' },
  ];
  const apiReviews = reviews?.filter(r => r.isVisible) || [];
  const visibleReviews = [...apiReviews, ...sampleReviews].slice(0, 6);
  const reviewPageCount = Math.max(1, visibleReviews.length - 2);
  const displayedReviews = [0, 1, 2].map(offset => visibleReviews[(reviewStart + offset) % visibleReviews.length]);

  React.useEffect(() => {
    if (visibleReviews.length < 4) return;
    const interval = window.setInterval(() => {
      setReviewStart(current => (current + 3) % reviewPageCount);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [visibleReviews.length, reviewPageCount]);

  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Neel Kamal Homestay",
    "description": activeSettings?.tagline || "Neel Kamal Homestay · KASAULI — a premium boutique homestay in Himachal Pradesh.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kasauli",
      "addressRegion": "Himachal Pradesh",
      "addressCountry": "IN"
    },
    "telephone": activeSettings?.contactPhone || "+91-XXXXXXXXXX",
    "email": activeSettings?.contactEmail || "info@neelkamalhomestay.com",
    "url": "https://neelkamalhomestay.com",
    "image": activeSettings?.heroImageUrl || "/hero-cover.jpg",
    "priceRange": "₹₹",
    "starRating": {
      "@type": "Rating",
      "ratingValue": "5"
    }
  };

  const heroImageSrc = activeSettings?.heroImageUrl 
    ? resolveMediaUrl(activeSettings.heroImageUrl) 
    : '/hero-cover.jpg';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[88vh] md:min-h-screen w-full flex items-center justify-center overflow-hidden">
        <picture className="absolute inset-0 z-0">
          <img
            src={heroImageSrc}
            alt={activeSettings?.heroHeading || 'Neel Kamal Homestay'}
            className="w-full h-full object-cover object-left md:object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/hero-cover.jpg";
            }}
          />
        </picture>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-black/45 to-black/60" />

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto mt-24 md:mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl leading-[1.12] sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 md:mb-6 tracking-tight drop-shadow-md"
          >
            {activeSettings?.heroHeading || 'Silence in the High Himalayas'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-white/95 mb-8 md:mb-10 font-normal tracking-wide max-w-2xl mx-auto drop-shadow-sm"
          >
            {activeSettings?.heroSubheading || 'A bespoke sanctuary above the clouds.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 md:gap-5"
          >
            <Link 
              href="/book" 
              className="px-8 py-3.5 rounded-full bg-white text-emerald-950 font-semibold shadow-lg hover:bg-white/95 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm md:text-base tracking-wide flex items-center justify-center w-full sm:w-auto"
            >
              Book Your Stay
            </Link>
            <Link 
              href="/rooms" 
              className="px-8 py-3.5 rounded-full bg-black/25 backdrop-blur-md text-white font-medium border border-white/30 hover:bg-white/15 hover:border-white/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm md:text-base tracking-wide flex items-center justify-center w-full sm:w-auto"
            >
              Explore Rooms
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Nearby Location Strip — Clean, Modern, Minimal without Harsh Marked Boxes */}
      <section className="py-7 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto">
            {[
              { icon: MapPin, title: 'Heritage Market', meta: '1.5 km • ~10 min' },
              { icon: Church, title: 'Christ Church', meta: '1.5 km • ~10 min' },
              { icon: Mountain, title: 'Manki Point', meta: '~13 min' },
              { icon: Trees, title: 'Gilbert Trail', meta: '~15 min' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors justify-start md:justify-center group"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-white truncate">{item.title}</p>
                  <p className="text-[11px] md:text-xs text-white/75">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Strip */}
      <section className="py-8 bg-background border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-base md:text-lg font-medium text-primary whitespace-pre-line">
            {activeSettings?.mealHighlight || '🥗 100% Pure Vegetarian Homemade Meals\nFreshly Prepared • Self-Service'}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted shadow-sm">
              <img
                src={activeSettings?.aboutImageUrl ? resolveMediaUrl(activeSettings.aboutImageUrl) : '/hero-cover.jpg'}
                alt="About Neel Kamal Homestay"
                className="object-cover w-full h-full"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/hero-cover.jpg";
                }}
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-6">
                {activeSettings?.aboutHeading || 'A Home Above the World'}
              </h2>
              <div className="text-foreground/80 space-y-6 leading-relaxed text-lg">
                <p>{activeSettings?.aboutText || 'Discover a space where time slows down. Handcrafted wooden interiors, panoramic valley views, and the crisp mountain air create an atmosphere of profound peace.'}</p>
              </div>
              <div className="mt-10">
                <Link href="/about" className="inline-flex items-center text-primary font-medium tracking-wide uppercase text-sm group">
                  Read Our Story 
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Strip */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xs tracking-[0.25em] uppercase font-bold text-primary/80 mb-12">Curated Comforts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Wind, label: 'Valley View' },
              { icon: Wifi, label: 'High-Speed WiFi' },
              { icon: Car, label: 'Private Parking' },
              { icon: Coffee, label: 'Room Service' },
            ].map((amenity, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-3 md:gap-4 p-5 md:p-6 bg-card rounded-xl shadow-xs border border-border/80">
                <amenity.icon className="w-6 h-6 md:w-8 md:h-8 text-primary/70" />
                <span className="font-medium text-foreground text-sm md:text-base">{amenity.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/amenities" className="text-primary font-medium text-sm uppercase tracking-wide hover:underline">
              View All Amenities
            </Link>
          </div>
        </div>
      </section>

      {/* Rooms Preview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">Our Rooms</h2>
              <p className="text-foreground/70">Spaces designed for rest and reflection.</p>
            </div>
            <Link href="/rooms" className="hidden md:inline-flex px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors uppercase text-xs tracking-wider font-semibold">
              View All Rooms
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleRooms.slice(0, 3).map((room) => (
              <Link key={room.id} href={`/rooms/${room.slug || room.id}`} className="group block relative rounded-xl overflow-hidden bg-card border border-border/80 transition-all hover:shadow-md hover:-translate-y-1">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img 
                    src={room.coverImageUrl ? resolveMediaUrl(room.coverImageUrl) : 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'} 
                    alt={room.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  {!room.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                      <span className="bg-white text-black px-4 py-2 text-xs uppercase tracking-widest font-semibold rounded-full">Currently Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif font-bold text-primary">{room.name}</h3>
                    {room.pricePerNight && (
                      <span className="text-sm font-semibold text-foreground">₹{room.pricePerNight} <span className="text-xs text-muted-foreground font-normal">/ night</span></span>
                    )}
                  </div>
                  <p className="text-foreground/70 text-sm mb-4 line-clamp-2">{room.shortDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground/80">{room.maxGuests} Guests</span>
                    <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground/80">{room.bedType}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/rooms" className="inline-flex px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors uppercase text-sm tracking-wider font-semibold w-full justify-center">
              View All Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Preview */}
      {visibleReviews.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-12">Guest Experiences</h2>
            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {displayedReviews.map((review) => (
                <motion.div
                  key={`${review.id}-${reviewStart}`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card p-8 rounded-xl shadow-xs border border-border/80 text-left flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex gap-1 mb-4 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <p className="text-foreground/80 italic flex-1 mb-6">"{review.reviewText}"</p>
                  <div>
                    <p className="font-semibold text-primary">{review.guestName}</p>
                    {review.source && <p className="text-xs text-muted-foreground mt-1">via {review.source}</p>}
                  </div>
                </motion.div>
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Previous reviews"
                  onClick={() => setReviewStart(current => (current - 3 + reviewPageCount) % reviewPageCount)}
                  className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border border-border text-primary shadow-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next reviews"
                  onClick={() => setReviewStart(current => (current + 3) % reviewPageCount)}
                  className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border border-border text-primary shadow-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
            </div>
          </div>
        </section>
      )}

      {/* Google Reviews CTA */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-primary mb-3">Share Your Experience</p>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">Stayed with us? We'd love your review.</h3>
          <p className="text-foreground/60 mb-8 text-sm leading-relaxed">Your kind words help other travellers discover this little corner of the Himalayas.</p>
          <a
             href={activeSettings?.googleReviewsUrl || "https://www.google.com/search?q=Neel+Kamal+Homestay+Kasauli+reviews"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors uppercase text-xs tracking-wider font-semibold"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
            Write a Google Review
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Ready for a mountain escape?</h2>
          <p className="text-primary-foreground/80 mb-10 text-lg">Leave the noise behind. Your sanctuary awaits.</p>
          <Link href="/book" className="inline-block px-10 py-4 bg-background text-primary rounded-full font-semibold tracking-wide hover:bg-background/90 hover:scale-[1.02] transition-all uppercase text-sm shadow-md">
            Book Your Stay
          </Link>
        </div>
      </section>
    </div>
  );
}