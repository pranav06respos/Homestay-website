import React from 'react';
import { useGetSettings } from '@workspace/api-client-react';
import { Clock, Ban, Info } from 'lucide-react';

export default function About() {
  const { data: settings } = useGetSettings();

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* Brand Story */}
        <div className="mb-24 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-8">
            {settings?.aboutHeading || 'Our Story'}
          </h1>
          {settings?.aboutImageUrl && (
            <div className="aspect-[21/9] bg-muted mb-12 rounded-sm overflow-hidden">
              <img src={settings.aboutImageUrl} alt="Neel Kamal Homestay Property" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="prose prose-stone max-w-3xl mx-auto text-lg leading-relaxed text-foreground/80 text-left md:text-center font-light">
            {(settings?.aboutText || 'Welcome to Neel Kamal Homestay.').split('\n').map((para, i) => (
              <p key={i} className="mb-6">{para}</p>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-primary mb-4">Property Policies</h2>
            <p className="text-foreground/70">Important information for your stay.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-sm border border-border text-center flex flex-col items-center">
              <Clock className="w-8 h-8 text-primary/70 mb-4" />
              <h3 className="font-serif text-xl text-primary mb-2">Check-in / Check-out</h3>
              <div className="text-foreground/80 space-y-2 mt-4">
                <p>Check-in: <strong>{settings?.checkInTime || '14:00 (2:00 PM)'}</strong></p>
                <p>Check-out: <strong>{settings?.checkOutTime || '11:00 (11:00 AM)'}</strong></p>
              </div>
            </div>

            <div className="bg-card p-8 rounded-sm border border-border text-center flex flex-col items-center">
              <Ban className="w-8 h-8 text-primary/70 mb-4" />
              <h3 className="font-serif text-xl text-primary mb-2">Cancellation Policy</h3>
              <p className="text-foreground/80 mt-4 leading-relaxed">
                {settings?.cancellationPolicy || 'Cancellations made 7 days prior to arrival are fully refundable. Later cancellations may be subject to a 1-night retention fee.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}