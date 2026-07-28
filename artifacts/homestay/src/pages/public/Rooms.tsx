import React from 'react';
import { useListRooms } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Wind, Users, BedDouble } from 'lucide-react';

export default function Rooms() {
  const { data: rooms, isLoading } = useListRooms();

  const visibleRooms = rooms?.filter(r => r.isVisible) || [];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">Our Rooms</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Each room at Neel Kamal Homestay is designed to blur the boundary between indoors and the majestic outdoors.
            Experience the profound quiet of the Himalayas without sacrificing comfort.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 aspect-[4/3] bg-muted rounded-sm"></div>
                <div className="w-full md:w-1/2 space-y-4 py-4">
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : visibleRooms.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-sm">
            <Wind className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-serif text-primary mb-2">No rooms available</h3>
            <p className="text-foreground/60">Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-24">
            {visibleRooms.map((room, index) => (
              <div key={room.id} className={`flex flex-col gap-8 md:gap-16 ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                <div className="w-full md:w-[55%] aspect-[4/3] bg-muted relative overflow-hidden rounded-sm group">
                  {room.coverImageUrl ? (
                    <img 
                      src={room.coverImageUrl} 
                      alt={room.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 bg-card">
                      <Wind className="w-16 h-16 mb-4 opacity-50" />
                      <span className="text-sm uppercase tracking-widest font-medium">Photos Coming Soon</span>
                    </div>
                  )}
                  
                  {!room.isAvailable && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
                      <span className="bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-medium rounded-sm border border-primary-foreground/20">Currently Unavailable</span>
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-[45%] flex flex-col justify-center">
                  <div className="mb-6">
                    <h2 className="text-3xl font-serif text-primary mb-2">{room.name}</h2>
                    {room.pricePerNight && (
                      <p className="text-lg font-medium text-foreground/80">
                        ₹{room.pricePerNight} <span className="text-sm font-normal text-muted-foreground">/ night</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center text-sm text-foreground/70 bg-muted/50 px-3 py-1.5 rounded-sm">
                      <Users className="w-4 h-4 mr-2 opacity-70" />
                      Up to {room.maxGuests} Guests
                    </div>
                    <div className="flex items-center text-sm text-foreground/70 bg-muted/50 px-3 py-1.5 rounded-sm">
                      <BedDouble className="w-4 h-4 mr-2 opacity-70" />
                      {room.bedType}
                    </div>
                  </div>
                  
                  <p className="text-foreground/80 leading-relaxed mb-8">
                    {room.shortDescription}
                  </p>
                  
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mb-10">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Includes</p>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 5).map((amenity, i) => (
                          <span key={i} className="text-xs border border-border px-2 py-1 rounded-sm text-foreground/70">
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 5 && (
                          <span className="text-xs border border-border px-2 py-1 rounded-sm text-foreground/70 bg-muted/30">
                            +{room.amenities.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-4 mt-auto">
                    <Link 
                      href={`/rooms/${room.slug}`}
                      className="px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-wider font-medium hover:bg-primary/90 transition-colors rounded-sm text-center flex-1"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/book?room=${room.id}`}
                      className={`px-6 py-3 border text-sm uppercase tracking-wider font-medium transition-colors rounded-sm text-center flex-1 ${
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