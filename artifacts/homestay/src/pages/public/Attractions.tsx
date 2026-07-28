import React from 'react';
import { useListAttractions, useGetSettings } from '@workspace/api-client-react';
import { MapPin, Navigation, Clock, Map } from 'lucide-react';

export default function Attractions() {
  const { data: attractions, isLoading } = useListAttractions();
  const { data: settings } = useGetSettings();

  const visibleAttractions = attractions?.filter(a => a.isVisible) || [];
  const sortedAttractions = [...visibleAttractions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">Explore the Surroundings</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Neel Kamal Homestay is perfectly situated to offer both profound seclusion and easy access to local landmarks.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-muted/30 p-8 rounded-sm h-48 border border-border"></div>
            ))}
          </div>
        ) : sortedAttractions.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-sm bg-muted/10">
            <Map className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-serif text-primary mb-2">Discovering Locations</h3>
            <p className="text-foreground/60">We are currently compiling a list of our favorite spots.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedAttractions.map((attraction) => (
              <div key={attraction.id} className="bg-card p-8 rounded-sm border border-border hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                <h3 className="text-2xl font-serif text-primary mb-4 pr-12">{attraction.name}</h3>
                
                <div className="flex flex-wrap gap-4 mb-5 text-sm text-foreground/70">
                  {attraction.distance && (
                    <div className="flex items-center">
                      <Navigation className="w-4 h-4 mr-2 opacity-60" />
                      {attraction.distance}
                    </div>
                  )}
                  {attraction.duration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 opacity-60" />
                      {attraction.duration}
                    </div>
                  )}
                </div>
                
                {attraction.description && (
                  <p className="text-foreground/80 font-light leading-relaxed mb-6">
                    {attraction.description}
                  </p>
                )}

                {settings?.googleMapsUrl && (
                  <a 
                    href={settings.googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary uppercase tracking-widest hover:underline mt-auto"
                  >
                    <MapPin className="w-4 h-4 mr-2" /> Get Directions
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}