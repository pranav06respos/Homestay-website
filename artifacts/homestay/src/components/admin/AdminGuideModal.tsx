import React from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, BedDouble, Image as ImageIcon, ImagePlus, 
  CalendarDays, Settings, Star, Map, HelpCircle, CheckCircle2, 
  ArrowRight, Sparkles, Lightbulb
} from 'lucide-react';

export type AdminSectionKey = 
  | 'dashboard' 
  | 'rooms' 
  | 'room-images' 
  | 'media' 
  | 'gallery' 
  | 'bookings' 
  | 'attractions' 
  | 'reviews' 
  | 'settings';

interface AdminGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection?: AdminSectionKey;
}

interface GuideContent {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: {
    title: string;
    description: string;
  }[];
  quickTip?: string;
}

const guides: Record<AdminSectionKey, GuideContent> = {
  dashboard: {
    title: "Host Dashboard",
    subtitle: "Your homestay summary and quick shortcuts",
    icon: LayoutDashboard,
    steps: [
      {
        title: "1. Check Your Overview",
        description: "The top cards show your live room count, pending bookings, and total gallery photos."
      },
      {
        title: "2. Review Pending Bookings",
        description: "Recent enquiries appear in the left card. Click 'View All' to accept or manage them."
      },
      {
        title: "3. Quick Action Buttons",
        description: "Use the bottom-right shortcuts to jump straight to Manage Rooms, Gallery, or Website Settings."
      }
    ],
    quickTip: "Tap any stat card to go directly to that management section."
  },
  rooms: {
    title: "Rooms & Pricing",
    subtitle: "Add, edit, and organize photos for each room",
    icon: BedDouble,
    steps: [
      {
        title: "1. Add a New Room",
        description: "Click '+ Add Room', enter the room name (e.g. Deluxe Suite), price per night, and save."
      },
      {
        title: "2. Add Photos to a Specific Room",
        description: "Click the 🖼️ image icon on that room's row. From there, pick photos from your Media Library that belong to this room."
      },
      {
        title: "3. Turn Rooms On or Off",
        description: "Toggle 'Available' (available for booking) or 'Visible' (shown to visitors on website)."
      },
      {
        title: "4. Edit or Delete",
        description: "Use the pencil icon to update prices or description, or the trash icon to delete."
      }
    ],
    quickTip: "When visitors click 'View Details' on a room, only the photos you added to that specific room will be shown!"
  },
  'room-images': {
    title: "Room Photos Manager",
    subtitle: "Add and set photos specifically for this room",
    icon: ImageIcon,
    steps: [
      {
        title: "1. Add Photos",
        description: "Click 'Add Images' and pick one or more photos from your Media Library for this room."
      },
      {
        title: "2. Set Cover Photo",
        description: "Click 'Set as Cover' on any image. This photo will be the main cover picture visitors see for this room."
      },
      {
        title: "3. Remove a Photo",
        description: "Click 'Remove' to detach a photo from this room (it remains safe in your Media Library)."
      }
    ],
    quickTip: "Make sure to set one photo as 'Cover' so your room looks inviting on the website!"
  },
  media: {
    title: "Media Library",
    subtitle: "Upload and store all your homestay pictures",
    icon: ImagePlus,
    steps: [
      {
        title: "1. Fast Multiple Upload",
        description: "Click 'Upload Multiple Pictures' to select 5, 10, or 20 photos at once. Photos are automatically compressed and upload in seconds!"
      },
      {
        title: "2. Drag & Drop Photos",
        description: "You can drag photo files directly from your computer or phone folder and drop them anywhere onto this page."
      },
      {
        title: "3. Real-Time Updates",
        description: "Photos appear in your library immediately as each one finishes uploading—no refresh needed."
      },
      {
        title: "4. Delete or Clean Up",
        description: "Select multiple photos with checkmarks and click 'Delete Selected' to remove unwanted images."
      }
    ],
    quickTip: "Always upload photos here first! Then you can easily attach them to any Room, the Gallery, or the main Hero banner."
  },
  gallery: {
    title: "Website Gallery",
    subtitle: "Photos shown on the public 'Gallery' page",
    icon: ImageIcon,
    steps: [
      {
        title: "1. Add to Gallery",
        description: "Click 'Add from Media Library' and select the pictures you want visitors to see in the Gallery."
      },
      {
        title: "2. Featured on Home Page",
        description: "Turn ON 'Featured' to display that photo in the photo showcase on the website homepage."
      },
      {
        title: "3. Show or Hide",
        description: "Toggle 'Visible' on or off to temporarily hide a picture without deleting it."
      }
    ],
    quickTip: "Pick 4–6 of your best scenic mountain and room photos as 'Featured' for a stunning homepage impression."
  },
  bookings: {
    title: "Guest Bookings",
    subtitle: "Manage booking enquiries from the website",
    icon: CalendarDays,
    steps: [
      {
        title: "1. View Enquiries",
        description: "See guest name, check-in and check-out dates, room requested, and number of guests."
      },
      {
        title: "2. Call or WhatsApp",
        description: "Click the Phone or WhatsApp button to chat directly with the guest and confirm their arrival."
      },
      {
        title: "3. Update Status",
        description: "Mark as 'Confirmed' once booked, or 'Cancelled' if dates are unavailable."
      }
    ],
    quickTip: "The WhatsApp button opens a pre-filled greeting message so you can reply to guests in seconds."
  },
  attractions: {
    title: "Nearby Attractions",
    subtitle: "Local Kasauli places to visit shown to guests",
    icon: Map,
    steps: [
      {
        title: "1. Add an Attraction",
        description: "Click '+ Add Attraction', enter the spot name (e.g. Sunset Point, Gilbert Trail), and distance (e.g. '2.5 km')."
      },
      {
        title: "2. Add a Photo",
        description: "Pick a photo representing the attraction so guests can see what Kasauli has to offer."
      }
    ],
    quickTip: "Include travel times or nearby tips in the description to help guests plan their day trips."
  },
  reviews: {
    title: "Guest Reviews",
    subtitle: "Display testimonials and 5-star feedback",
    icon: Star,
    steps: [
      {
        title: "1. Add Reviews",
        description: "Click '+ Add Review' to paste positive feedback from Google, Airbnb, or guest guestbooks."
      },
      {
        title: "2. Control Visibility",
        description: "Toggle 'Visible' to select which reviews appear in the review carousel on the homepage."
      }
    ]
  },
  settings: {
    title: "Website Settings",
    subtitle: "Phone numbers, main Hero photo, and contact details",
    icon: Settings,
    steps: [
      {
        title: "1. Contact & Socials",
        description: "Update your WhatsApp number, calling phone number, email address, and Instagram link."
      },
      {
        title: "2. Hero Banner Photo",
        description: "Pick the large background photo that appears at the very top of your homestay website."
      },
      {
        title: "3. Save & Publish Live",
        description: "Click 'Save Changes' at the bottom. When you're ready, click 'Publish Live' to push changes to the live website!"
      }
    ],
    quickTip: "Always make sure your phone and WhatsApp numbers are correct so guests can reach you instantly."
  }
};

const navTabs: { key: AdminSectionKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'rooms', label: 'Rooms & Photos' },
  { key: 'media', label: 'Media Library' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'settings', label: 'Settings' },
  { key: 'attractions', label: 'Attractions' },
  { key: 'reviews', label: 'Reviews' },
];

export function AdminGuideModal({ open, onOpenChange, initialSection = 'dashboard' }: AdminGuideModalProps) {
  const [activeTab, setActiveTab] = React.useState<AdminSectionKey>(initialSection);

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialSection);
    }
  }, [open, initialSection]);

  const currentGuide = guides[activeTab] || guides.dashboard;
  const Icon = currentGuide.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-background">
        {/* Header with Title and Section Switcher */}
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-full bg-primary/10 text-primary">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-serif text-2xl text-primary">
                Quick Guide & Walkthrough
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Simple step-by-step tips for managing your homestay website
              </DialogDescription>
            </div>
          </div>

          {/* Quick Section Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guide Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section banner */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-foreground">{currentGuide.title}</h3>
              <p className="text-xs text-muted-foreground">{currentGuide.subtitle}</p>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            {currentGuide.steps.map((step, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-lg bg-card border border-border/80 shadow-xs flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-semibold mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tip Box */}
          {currentGuide.quickTip && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <span className="font-semibold">Helpful Tip: </span>
                {currentGuide.quickTip}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
          <Button onClick={() => onOpenChange(false)} size="sm">
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
