import React from 'react';
import { useGetDraftSettings, useUpdateSettings, usePublishSettings } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const { data: draftSettings, isLoading } = useGetDraftSettings();
  const updateSettings = useUpdateSettings();
  const publishSettings = usePublishSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      siteName: '',
      tagline: '',
      footerText: '',
      heroHeading: '',
      heroSubheading: '',
      heroImageUrl: '',
      heroVisible: true,
      aboutHeading: '',
      aboutText: '',
      aboutImageUrl: '',
      contactPhone: '',
      contactWhatsapp: '',
      contactEmail: '',
      contactAddress: '',
      googleMapsUrl: '',
      checkInTime: '',
      checkOutTime: '',
      cancellationPolicy: '',
    }
  });

  React.useEffect(() => {
    if (draftSettings) {
      form.reset({
        siteName: draftSettings.siteName,
        tagline: draftSettings.tagline,
        footerText: draftSettings.footerText,
        heroHeading: draftSettings.heroHeading,
        heroSubheading: draftSettings.heroSubheading,
        heroImageUrl: draftSettings.heroImageUrl || '',
        heroVisible: draftSettings.heroVisible,
        aboutHeading: draftSettings.aboutHeading,
        aboutText: draftSettings.aboutText,
        aboutImageUrl: draftSettings.aboutImageUrl || '',
        contactPhone: draftSettings.contactPhone,
        contactWhatsapp: draftSettings.contactWhatsapp,
        contactEmail: draftSettings.contactEmail,
        contactAddress: draftSettings.contactAddress,
        googleMapsUrl: draftSettings.googleMapsUrl,
        checkInTime: draftSettings.checkInTime,
        checkOutTime: draftSettings.checkOutTime,
        cancellationPolicy: draftSettings.cancellationPolicy,
      });
    }
  }, [draftSettings, form]);

  const onSaveDraft = async (data: any) => {
    try {
      // Create a payload without URL strings, which are read-only
      // In a real app we'd use mediaId pickers, but we'll omit them here to simplify
      // since the API accepts just the basic fields
      const payload = { ...data };
      delete payload.heroImageUrl;
      delete payload.aboutImageUrl;

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
                {/* Note: Media picker omitted for brevity, using ID directly would require a modal */}
                <p className="text-sm text-muted-foreground italic">Use the Media Library to upload and set the Hero Image.</p>
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
                <p className="text-sm text-muted-foreground italic">Use the Media Library to upload and set the About Image.</p>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 m-0">
              <h2 className="text-xl font-serif text-primary mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input {...form.register('contactPhone')} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number (include country code)</Label>
                  <Input {...form.register('contactWhatsapp')} />
                </div>
                <div className="space-y-2 md:col-span-2">
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
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-6 m-0">
              <h2 className="text-xl font-serif text-primary mb-6">Homestay Policies</h2>
              <div className="grid gap-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Check-In Time</Label>
                    <Input {...form.register('checkInTime')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-Out Time</Label>
                    <Input {...form.register('checkOutTime')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cancellation Policy</Label>
                  <Textarea {...form.register('cancellationPolicy')} rows={4} />
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </div>
    </div>
  );
}