import React from 'react';
import { useGetSettings } from '@workspace/api-client-react';
import { Wind, Wifi, Car, Coffee, Tv, Shield, Trees, Map, Utensils, Mountain } from 'lucide-react';

const defaultAmenities = [
  { icon: Mountain, name: 'Valley View', desc: 'Panoramic views of the Himalayan range from your private balcony or window.' },
  { icon: Wifi, name: 'High-Speed WiFi', desc: 'Stay connected with reliable, fast internet access throughout the property.' },
  { icon: Car, name: 'Free Parking', desc: 'Secure, complimentary parking available on the premises.' },
  { icon: Coffee, name: 'Room Service', desc: 'Enjoy hot meals and beverages delivered right to your door.' },
  { icon: Wind, name: '24×7 Hot Water', desc: 'Continuous hot water supply to keep you warm in the mountain chill.' },
  { icon: Shield, name: 'CCTV Security', desc: 'Round-the-clock surveillance in common areas for your safety.' },
  { icon: Trees, name: 'Private Balcony', desc: 'Step out into the crisp mountain air without leaving your room.' },
  { icon: Utensils, name: 'In-House Dining', desc: 'Home-cooked local and multi-cuisine delicacies prepared fresh.' },
];

export default function Amenities() {
  const { data: settings } = useGetSettings();
  const amenities = settings?.amenitiesText
    ? settings.amenitiesText.split('\n').map((line, i) => {
        const [name, ...description] = line.split('|');
        return { icon: defaultAmenities[i % defaultAmenities.length].icon, name: name.trim(), desc: description.join('|').trim() };
      }).filter((item) => item.name)
    : defaultAmenities;
  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">Curated Comforts</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            We've thoughtfully provided everything you need to feel at home, while allowing the mountain environment to remain the focus of your stay.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-16">
          {amenities.map((amenity, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 md:p-8 bg-card border border-border/50 rounded-sm hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary/5 transition-colors">
                <amenity.icon className="w-6 h-6 md:w-8 md:h-8 text-primary/70 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg md:text-xl font-serif text-primary mb-2 md:mb-3">{amenity.name}</h3>
              <p className="text-xs md:text-sm text-foreground/70 leading-relaxed font-light">{amenity.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}