import React from 'react';
import { useListGallery } from '@workspace/api-client-react';
import { Wind, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Gallery() {
  const { data: galleryItems, isLoading } = useListGallery();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const visibleItems = galleryItems?.filter(item => item.isVisible) || [];
  const sortedItems = [...visibleItems].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">Gallery</h1>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Glimpses of stillness. Explore the spaces, the surroundings, and the moments that await you.
          </p>
        </div>

        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`bg-muted animate-pulse rounded-sm ${i % 3 === 0 ? 'h-96' : i % 2 === 0 ? 'h-64' : 'h-80'}`}></div>
            ))}
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-border rounded-sm bg-muted/20">
            <Wind className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-serif text-primary mb-2">Gallery Coming Soon</h3>
            <p className="text-foreground/60">We are currently curating our visual story.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {sortedItems.map((item) => (
              <button
                type="button"
                key={item.id} 
                className="break-inside-avoid relative group cursor-pointer rounded-sm overflow-hidden bg-muted"
                onClick={() => setSelectedImage(item.url)}
                aria-label={`Open ${item.altText || 'gallery image'}`}
              >
                <img 
                  src={item.url} 
                  alt={item.altText || 'Gallery Image'} 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
             <button
               type="button"
               aria-label="Close expanded image"
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={selectedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[90vh] object-contain rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}