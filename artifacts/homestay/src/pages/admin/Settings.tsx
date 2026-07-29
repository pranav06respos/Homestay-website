import React from 'react';
import { useGetDraftSettings, useUpdateSettings, usePublishSettings, useListMedia, Media } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Save, Image as ImageIcon, Check, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

// Inline media picker dialog for selecting a single image
function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  currentMediaId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mediaId: number, url: string) => void;
  currentMediaId?: number | null;
}) {
  const [search, setSearch] = React.useState('');
  const { data: mediaFiles, isLoading } = useListMedia({ search });
  const [selectedId, setSelectedId] = React.useState<number | null>(currentMediaId ?? null);

  React.useEffect(() => {
    if (open) setSelectedId(currentMediaId ?? null);
    else setSearch('');
  }, [open, currentMediaId]);

  const handleConfirm = () => {
    const chosen = mediaFiles?.find(m => m.id === selectedId);
    if (chosen) {
      onSelect(chosen.id, chosen.url);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Choose Image</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] border border-border p-4 rounded-sm bg-muted/10">
          {isLoading ? (
            <div className="text-center py-12">Loading media...</div>
          ) : !mediaFiles?.length ? (
            <div className="text-center py-20 text-muted-foreground">
              {search ? 'No matches found.' : 'No media uploaded yet. Upload images via the Media Library.'}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {mediaFiles.map((media) => {
                const isSelected = selectedId === media.id;
                return (
                  <div
                    key={media.id}
                    className={`relative aspect-square cursor-pointer border-2 rounded-sm overflow-hidden transition-all ${isSelected ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                    onClick={() => setSelectedId(media.id)}
                  >
                    <img src={media.url} alt="" className={`w-full h-full object-cover ${isSelected ? 'opacity-80' : ''}`} />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[10px] truncate px-2 py-1">
                      {media.originalName}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t border-border pt-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-muted-foreground">{selectedId ? '1 selected' : 'None selected'}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleConfirm} disabled={!selectedId}>Use This Image</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Small inline image preview + picker trigger
function ImageField({
  label,
  currentUrl,
  currentMediaId,
  onSelect,
}: {
  label: string;
  currentUrl?: string | null;
  currentMediaId?: number | null;
  onSelect: (mediaId: number, url: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        <div className="w-40 h-28 rounded-sm overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
          {currentUrl ? (
            <img src={currentUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          )}
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)} className="gap-2">
            <ImageIcon className="w-4 h-4" />
            {currentUrl ? 'Change Image' : 'Select Image'}
          </Button>
          <p className="text-xs text-muted-foreground">Pick from Media Library. Upload new images there first.</p>
        </div>
      </div>
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={onSelect}
        currentMediaId={currentMediaId}
      />
    </div>
  );
}

export default function Settings() {
  const { data: draftSettings, isLoading } = useGetDraftSettings();
  const updateSettings = useUpdateSettings();
  const publishSettings = usePublishSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      siteName: '',
      mealHighlight: '',
      tagline: '',
      footerText: '',
      heroHeading: '',
      heroSubheading: '',
      heroVisible: true,
      aboutHeading: '',
      aboutText: '',
      contactPhone: '',
      contactWhatsapp: '',
      contactEmail: '',
      contactAddress: '',
      googleMapsUrl: '',
      checkInTime: '',
      checkOutTime: '',
      cancellationPolicy: '',
      amenitiesText: '',
      googleReviewsUrl: '',
    }
  });

  // Tracked separately (not in react-hook-form) since they're picked via dialog
  const [heroImageMediaId, setHeroImageMediaId] = React.useState<number | null>(null);
  const [heroImageUrl, setHeroImageUrl] = React.useState<string | null>(null);
  const [aboutImageMediaId, setAboutImageMediaId] = React.useState<number | null>(null);
  const [aboutImageUrl, setAboutImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (draftSettings) {
      form.reset({
        siteName: draftSettings.siteName,
        mealHighlight: draftSettings.mealHighlight,
        tagline: draftSettings.tagline,
        footerText: draftSettings.footerText,
        heroHeading: draftSettings.heroHeading,
        heroSubheading: draftSettings.heroSubheading,
        heroVisible: draftSettings.heroVisible,
        aboutHeading: draftSettings.aboutHeading,
        aboutText: draftSettings.aboutText,
        contactPhone: draftSettings.contactPhone,
        contactWhatsapp: draftSettings.contactWhatsapp,
        contactEmail: draftSettings.contactEmail,
        contactAddress: draftSettings.contactAddress,
        googleMapsUrl: draftSettings.googleMapsUrl,
        checkInTime: draftSettings.checkInTime,
        checkOutTime: draftSettings.checkOutTime,
        cancellationPolicy: draftSettings.cancellationPolicy,
        amenitiesText: draftSettings.amenitiesText,
        googleReviewsUrl: draftSettings.googleReviewsUrl,
      });
      setHeroImageMediaId(draftSettings.heroImageMediaId ?? null);
      setHeroImageUrl(draftSettings.heroImageUrl ?? null);
      setAboutImageMediaId(draftSettings.aboutImageMediaId ?? null);
      setAboutImageUrl(draftSettings.aboutImageUrl ?? null);
    }
  }, [draftSettings, form]);

  const onSaveDraft = async (data: any) => {
    try {
      const payload: any = { ...data };
      if (heroImageMediaId !== null) payload.heroImageMediaId = heroImageMediaId;
      if (aboutImageMediaId !== null) payload.aboutImageMediaId = aboutImageMediaId;

      await updateSettings.mutateAsync({ data: payload });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/draft'] });
      toast({ title: "Draft saved successfully" });
    } catch {
      toast({ title: "Failed to save draft", variant: "destructive" });
    }
  };

  const onPublish = async () => {
    if (confirm("Are you sure you want to publish these settings to the live website?")) {
      try {
        await publishSettings.mutateAsync();
        queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/settings/draft'] });
        toast({ title: "Settings published successfully!" });
      } catch {
        toast({ title: "Failed to publish", variant: "destructive" });
      }
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-6 rounded-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif text-primary">Website Settings</h1>
          <p className="text-muted-foreground mt-1">
            {draftSettings?.isDraft 
              ? <span className="text-amber-600 font-medium flex items-center gap-2">● Unsaved draft changes exist</span>
              : <span className="text-green-600 flex items-center gap-2">● Draft is synced with live site</span>}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={form.handleSubmit(onSaveDraft)}
            disabled={updateSettings.isPending}
            className="gap-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          <Button 
            onClick={onPublish}
            disabled={publishSettings.isPending || !draftSettings?.isDraft}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            🚀 Publish Changes
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-sm border border-border">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-12 p-0 overflow-x-auto">
            <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6">General</TabsTrigger>
            <TabsTrigger value="hero" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6">Hero Section</TabsTrigger>
            <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6">About Section</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6">Contact & Links</TabsTrigger>
            <TabsTrigger value="policies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6">Policies</TabsTrigger>
          </TabsList>

          <form className="p-8">
            <TabsContent value="general" className="space-y-6 m-0">
              <h2 className="text-xl font-serif text-primary mb-6">Global Identity</h2>
              <div className="grid gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input {...form.register('siteName')} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline / Short Description</Label>
                  <Textarea {...form.register('tagline')} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Input {...form.register('footerText')} />
                </div>
                <div className="space-y-2">
                  <Label>Homepage Property Highlight</Label>
                  <Textarea {...form.register('mealHighlight')} rows={2} />
                  <p className="text-xs text-muted-foreground">Use a new line to separate the meal title from the service detail.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hero" className="space-y-6 m-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-primary">Homepage Hero</h2>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={form.watch('heroVisible')} 
                    onCheckedChange={(checked) => form.setValue('heroVisible', checked)} 
                  />
                  <Label>Hero Visible</Label>
                </div>
              </div>
              <div className="grid gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label>Main Heading</Label>
                  <Input {...form.register('heroHeading')} />
                </div>
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input {...form.register('heroSubheading')} />
                </div>
                <ImageField
                  label="Hero Background Image"
                  currentUrl={heroImageUrl}
                  currentMediaId={heroImageMediaId}
                  onSelect={(mediaId, url) => {
                    setHeroImageMediaId(mediaId);
                    setHeroImageUrl(url);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-6 m-0">
              <h2 className="text-xl font-serif text-primary mb-6">About Section</h2>
              <div className="grid gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label>About Heading</Label>
                  <Input {...form.register('aboutHeading')} />
                </div>
                <div className="space-y-2">
                  <Label>About Text</Label>
                  <Textarea {...form.register('aboutText')} rows={8} />
                </div>
                <ImageField
                  label="About Section Image"
                  currentUrl={aboutImageUrl}
                  currentMediaId={aboutImageMediaId}
                  onSelect={(mediaId, url) => {
                    setAboutImageMediaId(mediaId);
                    setAboutImageUrl(url);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 m-0">
              <h2 className="text-xl font-serif text-primary mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <div className="space-y-2 md:col-span-2">
                  <Label>Phone Number(s)</Label>
                  <Input {...form.register('contactPhone')} placeholder="+91 00000 00000, +91 00000 00000" />
                  <p className="text-xs text-muted-foreground">Separate multiple numbers with a comma.</p>
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number (include country code)</Label>
                  <Input {...form.register('contactWhatsapp')} placeholder="+919459040109" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input {...form.register('contactEmail')} type="email" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Physical Address</Label>
                  <Textarea {...form.register('contactAddress')} rows={2} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Google Maps URL</Label>
                  <Input {...form.register('googleMapsUrl')} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Google Reviews URL</Label>
                  <Input {...form.register('googleReviewsUrl')} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-6 m-0">
              <h2 className="text-xl font-serif text-primary mb-6">Homestay Policies</h2>
              <div className="grid gap-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Check-In Time</Label>
                    <Input {...form.register('checkInTime')} placeholder="e.g. 1:00 PM" />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-Out Time</Label>
                    <Input {...form.register('checkOutTime')} placeholder="e.g. 12:00 PM" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cancellation Policy</Label>
                  <Textarea {...form.register('cancellationPolicy')} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <Textarea {...form.register('amenitiesText')} rows={10} placeholder="Amenity name|Description" />
                  <p className="text-xs text-muted-foreground">One amenity per line, using <code>Name|Description</code>.</p>
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
