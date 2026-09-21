import React from 'react';
import { useListRooms, resolveMediaUrl } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Wind, Users, BedDouble } from 'lucide-react';

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
    amenities: ['Valley View', 'Private Balcony', 'High-Speed WiFi', 'Hot Shower', 'Electric Kettle'],
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
    amenities: ['Sunrise View', 'King Bed', 'Sitting Area', 'High-Speed WiFi', 'Tea & Coffee Maker'],
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
    amenities: ['Pine Forest View', '2 Queen Beds', 'Spacious Living', 'High-Speed WiFi', 'Work Desk'],
  },
];

export default function Rooms() {
  const { data: rooms, isLoading } = useListRooms();

  const [cachedRooms, setCachedRooms] = React.useState<any[]>(() => {
    try {
      const raw = localStorage.getItem(CACHE_ROOMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    if (rooms && rooms.length > 0) {
      try {
        localStorage.setItem(CACHE_ROOMS_KEY, JSON.stringify(rooms));
      } catch {}
      setCachedRooms(rooms);
    }
  }, [rooms]);

  const activeRooms = (rooms && rooms.length > 0) ? rooms : (cachedRooms.length > 0 ? cachedRooms : defaultFallbackRooms);
  const visibleRooms = activeRooms.filter(r => r.isVisible);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">Our Rooms</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Each room at Neel Kamal Homestay is designed to blur the boundary between indoors and the majestic outdoors.
            Experience the profound quiet of the Himalayas without sacrificing comfort.
          </p>
        </div>

        {visibleRooms.length === 0 && isLoading ? (
          <div className="grid grid-cols-1 gap-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 aspect-[4/3] bg-muted rounded-xl"></div>
                <div className="w-full md:w-1/2 space-y-4 py-4">
                  <div className="h-8 bg-muted rounded-md w-1/2"></div>
                  <div className="h-4 bg-muted rounded-md w-1/4 mb-8"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded-md w-full"></div>
                    <div className="h-4 bg-muted rounded-md w-full"></div>
                    <div className="h-4 bg-muted rounded-md w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : visibleRooms.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-xl">
            <Wind className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-serif font-bold text-primary mb-2">No rooms available</h3>
            <p className="text-foreground/60">Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {visibleRooms.map((room, index) => (
              <div key={room.id} className={`flex flex-col gap-8 md:gap-14 ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                <div className="w-full md:w-[55%] aspect-[4/3] bg-muted relative overflow-hidden rounded-2xl group shadow-sm">
                  {room.coverImageUrl ? (
                    <img 
                      src={resolveMediaUrl(room.coverImageUrl)} 
                      alt={room.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 bg-card">
                      <Wind className="w-16 h-16 mb-4 opacity-50" />
                      <span className="text-sm uppercase tracking-widest font-medium">Photos Coming Soon</span>
                    </div>
                  )}
                  
                  {!room.isAvailable && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
                      <span className="bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-semibold rounded-full border border-primary-foreground/20">Currently Unavailable</span>
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-[45%] flex flex-col justify-center">
                  <div className="mb-5">
                    <h2 className="text-3xl font-serif font-bold text-primary mb-2">{room.name}</h2>
                    {room.pricePerNight && (
                      <p className="text-lg font-semibold text-foreground/80">
                        ₹{room.pricePerNight} <span className="text-sm font-normal text-muted-foreground">/ night</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center text-xs font-medium text-foreground/80 bg-muted/60 px-3 py-1.5 rounded-full">
                      <Users className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                      Up to {room.maxGuests} Guests
                    </div>
                    <div className="flex items-center text-xs font-medium text-foreground/80 bg-muted/60 px-3 py-1.5 rounded-full">
                      <BedDouble className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                      {room.bedType}
                    </div>
                  </div>
                  
                  <p className="text-foreground/80 leading-relaxed mb-6">
                    {room.shortDescription}
                  </p>
                  
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mb-8">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2.5 font-semibold">Includes</p>
                      <div className="flex flex-wrap gap-2">
                        {(room.amenities as string[]).slice(0, 5).map((amenity: string, i: number) => (
                          <span key={i} className="text-xs bg-card border border-border/70 px-2.5 py-1 rounded-full text-foreground/80">
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 5 && (
                          <span className="text-xs border border-border/70 px-2.5 py-1 rounded-full text-foreground/70 bg-muted/30">
                            +{room.amenities.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 mt-auto">
                    <Link 
                      href={`/rooms/${room.slug || room.id}`}
                      className="px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-semibold hover:bg-primary/90 transition-colors rounded-full text-center flex-1"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/book?room=${room.id}`}
                      className={`px-6 py-3 border text-xs uppercase tracking-wider font-semibold transition-colors rounded-full text-center flex-1 ${
                        room.isAvailable 
                          ? 'border-primary text-primary hover:bg-primary/5' 
                          : 'border-muted text-muted-foreground pointer-events-none opacity-50'
                      }`}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}