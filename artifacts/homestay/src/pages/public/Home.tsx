import React from 'react';
import { useGetSettings, useListRooms, useListReviews } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { MapPin, Wifi, Car, Coffee, Tv, Wind, Check, Star, Church, Mountain, Trees, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { data: settings } = useGetSettings();
  const { data: rooms } = useListRooms();
  const { data: reviews } = useListReviews();
  const [reviewStart, setReviewStart] = React.useState(0);

  const visibleRooms = rooms?.filter(r => r.isVisible) || [];
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[88vh] md:min-h-screen w-full flex items-center justify-center overflow-hidden">
        {settings?.heroVisible !== false && settings?.heroImageUrl ? (
          <picture className="absolute inset-0 z-0">
            <img
              src={settings.heroImageUrl}
              alt={settings?.heroHeading || 'Neel Kamal Homestay'}
              className="w-full h-full object-cover object-left md:object-center"
              loading="eager"
              decoding="async"
            />
          </picture>
        ) : settings?.heroVisible !== false ? (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/20 to-background flex items-end justify-center">
            {/* Elegant mountain silhouette placeholder */}
            <svg viewBox="0 0 1440 320" className="w-full h-auto text-primary/10 fill-current opacity-50" preserveAspectRatio="none">
              <path d="M0,320 L1440,320 L1440,160 C1200,200 1000,100 800,180 C600,260 400,120 0,220 Z"></path>
              <path d="M0,320 L1440,320 L1440,240 C1100,280 900,180 700,260 C500,340 200,200 0,300 Z" className="text-primary/20"></path>
            </svg>
          </div>
        ) : null}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto mt-24 md:mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[2.1rem] leading-[1.15] sm:text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-4 md:mb-6"
          >
            {settings?.heroHeading || 'Silence in the High Himalayas'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-10 font-light tracking-wide max-w-2xl mx-auto"
          >
            {settings?.heroSubheading || 'A bespoke sanctuary above the clouds.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
          >
            <Link href="/book" className="px-6 md:px-8 py-2.5 md:py-3 bg-white text-primary rounded-sm font-medium tracking-wide hover:bg-white/90 transition-colors w-full sm:w-auto">
              Book Your Stay
            </Link>
            <Link href="/rooms" className="px-6 md:px-8 py-2.5 md:py-3 border border-white text-white rounded-sm font-medium tracking-wide hover:bg-white/10 transition-colors w-full sm:w-auto">
              Explore Rooms
            </Link>
          </motion.div>
        </div>
      </section>
      {/* Nearby Location Cards */}
      <section className="py-6 md:py-8 bg-primary">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 max-w-4xl mx-auto">
            {[
              { icon: MapPin, title: 'Heritage Market', meta: '1.5 km • ~10 min' },
              { icon: Church, title: 'Christ Church', meta: '1.5 km • ~10 min' },
              { icon: Mountain, title: 'Manki Point', meta: '~13 min' },
              { icon: Trees, title: 'Gilbert Trail', meta: '~15 min' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-2.5 md:gap-3 p-2.5 md:p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm text-white flex-row justify-center items-center"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium truncate">{item.title}</p>
                  <p className="text-[10px] md:text-xs text-white/70">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-base md:text-lg font-medium text-primary whitespace-pre-line">
            {settings?.mealHighlight || '🥗 100% Pure Vegetarian Homemade Meals\nFreshly Prepared • Self-Service'}
          </p>
        </div>
      </section>
      {/* About Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-muted">
              {settings?.aboutImageUrl ? (
              <img src={settings.aboutImageUrl} alt="About Neel Kamal Homestay" className="object-cover w-full h-full" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Wind className="w-24 h-24 opacity-20" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-serif text-primary mb-6">
                {settings?.aboutHeading || 'A Home Above the World'}
              </h2>
              <div className="text-foreground/80 space-y-6 leading-relaxed text-lg">
                <p>{settings?.aboutText || 'Discover a space where time slows down. Handcrafted wooden interiors, panoramic valley views, and the crisp mountain air create an atmosphere of profound peace.'}</p>
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
          <h3 className="text-sm tracking-[0.2em] uppercase text-primary mb-12">Curated Comforts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Wind, label: 'Valley View' },
              { icon: Wifi, label: 'High-Speed WiFi' },
              { icon: Car, label: 'Private Parking' },
              { icon: Coffee, label: 'Room Service' },
            ].map((amenity, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-3 md:gap-4 p-4 md:p-6 bg-card rounded-sm shadow-sm border border-border">
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
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-4">Our Rooms</h2>
              <p className="text-foreground/70">Spaces designed for rest and reflection.</p>
            </div>
            <Link href="/rooms" className="hidden md:inline-flex px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors uppercase text-xs tracking-wider font-medium">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleRooms.slice(0, 3).map((room) => (
              <Link key={room.id} href={`/rooms/${room.slug}`} className="group block relative rounded-sm overflow-hidden bg-card border border-border transition-shadow hover:shadow-md">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {room.coverImageUrl ? (
                    <img src={room.coverImageUrl} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50">
                      <Wind className="w-12 h-12 mb-2" />
                      <span className="text-xs uppercase tracking-wider">Photos Coming Soon</span>
                    </div>
                  )}
                  {!room.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                      <span className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest font-medium rounded-sm">Currently Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif text-primary">{room.name}</h3>
                    {room.pricePerNight && (
                      <span className="text-sm font-medium text-foreground">₹{room.pricePerNight} <span className="text-xs text-muted-foreground font-normal">/ night</span></span>
                    )}
                  </div>
                  <p className="text-foreground/70 text-sm mb-4 line-clamp-2">{room.shortDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded-sm text-foreground/80">{room.maxGuests} Guests</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-sm text-foreground/80">{room.bedType}</span>
                  </div>
                </div>
              </Link>
            ))}
            {visibleRooms.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground border border-dashed border-border rounded-sm">
                Rooms are being prepared. Check back soon.
              </div>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/rooms" className="inline-flex px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors uppercase text-sm tracking-wider font-medium w-full justify-center">
              View All Rooms
            </Link>
          </div>
        </div>
      </section>
      {/* Reviews Preview */}
      {visibleReviews.length > 0 && (
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-12">Guest Experiences</h2>
            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {displayedReviews.map((review) => (
                <motion.div
                  key={`${review.id}-${reviewStart}`}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card p-8 rounded-sm shadow-sm border border-border text-left flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex gap-1 mb-4 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <p className="text-foreground/80 italic flex-1 mb-6">"{review.reviewText}"</p>
                  <div>
                    <p className="font-medium text-primary">{review.guestName}</p>
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
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3">Share Your Experience</p>
          <h3 className="text-2xl md:text-3xl font-serif text-foreground mb-4">Stayed with us? We'd love your review.</h3>
          <p className="text-foreground/60 mb-8 text-sm leading-relaxed">Your kind words help other travellers discover this little corner of the Himalayas.</p>
          <a
             href={settings?.googleReviewsUrl || "https://www.google.com/search?q=Neel+Kamal+Homestay+Kasauli+reviews"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-sm transition-colors uppercase text-xs tracking-wider font-medium"
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
          <h2 className="text-3xl md:text-5xl font-serif mb-6">Ready for a mountain escape?</h2>
          <p className="text-primary-foreground/80 mb-10 text-lg">Leave the noise behind. Your sanctuary awaits.</p>
          <Link href="/book" className="inline-block px-10 py-4 bg-background text-primary rounded-sm font-medium tracking-wide hover:bg-background/90 transition-colors uppercase text-sm">
            Book Your Stay
          </Link>
        </div>
      </section>
    </div>
  );
}