import React from 'react';
import { useLocation, useParams } from 'wouter';
import { useListRooms, useListRoomImages } from '@workspace/api-client-react';
import { Users, BedDouble, Wind, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

export default function RoomDetail() {
  const { slug } = useParams();
  const { data: rooms, isLoading: isLoadingRooms } = useListRooms();
  const room = rooms?.find(r => r.slug === slug);
  const { data: images } = useListRoomImages(room?.id || 0, {
    query: { enabled: !!room?.id, queryKey: ['/api/rooms', room?.id || 0, 'images'] },
  });

  const [currentImageIdx, setCurrentImageIdx] = React.useState(0);

  if (isLoadingRooms) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="aspect-[21/9] bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-primary mb-4">Room not found</h1>
          <Link href="/rooms" className="text-sm uppercase tracking-widest text-primary border-b border-primary pb-1">
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  const sortedImages = [...(images || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const displayImages = sortedImages.length > 0 ? sortedImages : (room.coverImageUrl ? [{ url: room.coverImageUrl, id: 0 }] : []);

  const nextImage = () => setCurrentImageIdx((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setCurrentImageIdx((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  return (
    <div className="pt-24 pb-24 min-h-screen bg-background">
      {/* Gallery Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mb-8">
        <Link href="/rooms" className="inline-flex items-center text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Rooms
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-primary mb-3">{room.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-foreground/70">
              <span className="flex items-center"><Users className="w-4 h-4 mr-2 opacity-60" /> Up to {room.maxGuests} Guests</span>
              <span className="flex items-center"><BedDouble className="w-4 h-4 mr-2 opacity-60" /> {room.bedType}</span>
            </div>
          </div>
          <div className="text-left md:text-right">
            {room.pricePerNight && (
              <div className="mb-4">
                <span className="text-2xl font-serif text-primary">₹{room.pricePerNight}</span>
                <span className="text-muted-foreground text-sm ml-1">/ night</span>
              </div>
            )}
            <Link 
              href={`/book?room=${room.id}`}
              className={`inline-flex px-8 py-3 uppercase tracking-widest text-sm font-medium rounded-sm transition-colors ${
                room.isAvailable 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-muted text-muted-foreground pointer-events-none'
              }`}
            >
              {room.isAvailable ? 'Book This Room' : 'Currently Unavailable'}
            </Link>
          </div>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="w-full bg-muted/30 mb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="relative aspect-[16/9] md:aspect-[21/9] bg-card rounded-sm overflow-hidden group">
            {displayImages.length > 0 ? (
              <>
                <img 
                  src={displayImages[currentImageIdx].url} 
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                {displayImages.length > 1 && (
                  <>
                     <button type="button" aria-label="Previous room image" onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background text-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                     <button type="button" aria-label="Next room image" onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background text-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {displayImages.map((_, i) => (
                         <button
                           type="button"
                           aria-label={`Show room image ${i + 1}`}
                          key={i} 
                          onClick={() => setCurrentImageIdx(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === currentImageIdx ? 'bg-white w-4' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <Wind className="w-16 h-16 mb-4 opacity-50" />
                <span className="text-sm uppercase tracking-widest font-medium">Photos Coming Soon</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description & Amenities */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-primary mb-6">About this space</h2>
              <div className="prose prose-stone max-w-none text-foreground/80 font-light leading-relaxed">
                {room.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-muted/20 p-8 rounded-sm border border-border">
              <h3 className="text-lg font-serif text-primary mb-6">Room Amenities</h3>
              <ul className="space-y-4">
                {room.amenities?.map((amenity, i) => (
                  <li key={i} className="flex items-start text-sm text-foreground/80">
                    <Check className="w-4 h-4 mr-3 mt-0.5 text-primary/70 shrink-0" />
                    <span>{amenity}</span>
                  </li>
                ))}
                {(!room.amenities || room.amenities.length === 0) && (
                  <li className="text-sm text-muted-foreground italic">Standard amenities included.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}