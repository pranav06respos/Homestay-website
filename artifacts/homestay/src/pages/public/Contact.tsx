import React from 'react';
import { useGetSettings } from '@workspace/api-client-react';
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'wouter';

export default function Contact() {
  const { data: settings } = useGetSettings();

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">Reach Out</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            We're here to help you plan your perfect mountain retreat. 
            For immediate booking inquiries, please use our booking form or contact us via WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-serif text-primary mb-6">Contact Information</h3>
              <ul className="space-y-8">
                <li className="flex items-start">
                  <MapPin className="w-6 h-6 text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1 uppercase tracking-widest text-xs">Address</h4>
                    <p className="text-foreground/80 leading-relaxed">
                      {settings?.contactAddress || 'Village Mashobra, Kasauli, Himachal Pradesh, India'}
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <Phone className="w-6 h-6 text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1 uppercase tracking-widest text-xs">Phone</h4>
                    <a href={`tel:${settings?.contactPhone}`} className="text-foreground/80 hover:text-primary transition-colors text-lg">
                      {settings?.contactPhone || '+91 00000 00000'}
                    </a>
                  </div>
                </li>

                <li className="flex items-start">
                  <MessageCircle className="w-6 h-6 text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1 uppercase tracking-widest text-xs">WhatsApp</h4>
                    <a 
                      href={`https://wa.me/${settings?.contactWhatsapp?.replace(/\D/g,'')}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/80 hover:text-primary transition-colors text-lg inline-flex items-center"
                    >
                      {settings?.contactWhatsapp || '+91 00000 00000'}
                    </a>
                  </div>
                </li>

                <li className="flex items-start">
                  <Mail className="w-6 h-6 text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1 uppercase tracking-widest text-xs">Email</h4>
                    <a href={`mailto:${settings?.contactEmail}`} className="text-foreground/80 hover:text-primary transition-colors text-lg">
                      {settings?.contactEmail || 'hello@neelkamal.com'}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 p-8 rounded-sm border border-primary/10">
              <h4 className="font-serif text-xl text-primary mb-3">Looking to book?</h4>
              <p className="text-foreground/80 mb-6 text-sm leading-relaxed">
                For the fastest response regarding availability and reservations, please fill out our formal booking request form.
              </p>
              <Link href="/book" className="inline-block w-full py-3 bg-primary text-primary-foreground text-center uppercase tracking-widest text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors">
                Book a Stay
              </Link>
            </div>
          </div>

          {/* Map */}
          <div className="h-[500px] md:h-auto bg-muted rounded-sm overflow-hidden relative">
            {settings?.googleMapsUrl ? (
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3421.4395886367566!2d76.95353131513476!3d30.902237881571434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390f898c8c50e2db%3A0xc3c9a6231bdc863!2sNeel%20Kamal%20Homestay!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                <MapPin className="w-16 h-16 mb-4 opacity-50" />
                <span className="text-sm uppercase tracking-widest font-medium">Map Location</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}