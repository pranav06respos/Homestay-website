import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useGetDraftSettings, useUpdateSettings, usePublishSettings, useListMedia } from '@workspace/api-client-react';
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
function MediaPickerDialog({ open, onOpenChange, onSelect, currentMediaId, }) {
    const [search, setSearch] = React.useState('');
    const { data: mediaFiles, isLoading } = useListMedia({ search });
    const [selectedId, setSelectedId] = React.useState(currentMediaId ?? null);
    React.useEffect(() => {
        if (open)
            setSelectedId(currentMediaId ?? null);
        else
            setSearch('');
    }, [open, currentMediaId]);
    const handleConfirm = () => {
        const chosen = mediaFiles?.find(m => m.id === selectedId);
        if (chosen) {
            onSelect(chosen.id, chosen.url);
            onOpenChange(false);
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] flex flex-col", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "font-serif text-2xl", children: "Choose Image" }) }), _jsxs("div", { className: "relative mb-4", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by filename...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })] }), _jsx("div", { className: "flex-1 overflow-y-auto min-h-[300px] border border-border p-4 rounded-sm bg-muted/10", children: isLoading ? (_jsx("div", { className: "text-center py-12", children: "Loading media..." })) : !mediaFiles?.length ? (_jsx("div", { className: "text-center py-20 text-muted-foreground", children: search ? 'No matches found.' : 'No media uploaded yet. Upload images via the Media Library.' })) : (_jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4", children: mediaFiles.map((media) => {
                            const isSelected = selectedId === media.id;
                            return (_jsxs("div", { className: `relative aspect-square cursor-pointer border-2 rounded-sm overflow-hidden transition-all ${isSelected ? 'border-primary' : 'border-transparent hover:border-primary/50'}`, onClick: () => setSelectedId(media.id), children: [_jsx("img", { src: media.url, alt: "", className: `w-full h-full object-cover ${isSelected ? 'opacity-80' : ''}` }), isSelected && (_jsx("div", { className: "absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center", children: _jsx(Check, { className: "w-4 h-4" }) })), _jsx("div", { className: "absolute bottom-0 left-0 w-full bg-black/60 text-white text-[10px] truncate px-2 py-1", children: media.originalName })] }, media.id));
                        }) })) }), _jsx(DialogFooter, { className: "mt-4 border-t border-border pt-4", children: _jsxs("div", { className: "flex justify-between items-center w-full", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: selectedId ? '1 selected' : 'None selected' }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), _jsx(Button, { onClick: handleConfirm, disabled: !selectedId, children: "Use This Image" })] })] }) })] }) }));
}
// Small inline image preview + picker trigger
function ImageField({ label, currentUrl, currentMediaId, onSelect, }) {
    const [pickerOpen, setPickerOpen] = React.useState(false);
    return (_jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: label }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-40 h-28 rounded-sm overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0", children: currentUrl ? (_jsx("img", { src: currentUrl, alt: "", className: "w-full h-full object-cover" })) : (_jsx(ImageIcon, { className: "w-8 h-8 text-muted-foreground/30" })) }), _jsxs("div", { className: "flex flex-col gap-2 pt-1", children: [_jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setPickerOpen(true), className: "gap-2", children: [_jsx(ImageIcon, { className: "w-4 h-4" }), currentUrl ? 'Change Image' : 'Select Image'] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Pick from Media Library. Upload new images there first." })] })] }), _jsx(MediaPickerDialog, { open: pickerOpen, onOpenChange: setPickerOpen, onSelect: onSelect, currentMediaId: currentMediaId })] }));
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
    const [heroImageMediaId, setHeroImageMediaId] = React.useState(null);
    const [heroImageUrl, setHeroImageUrl] = React.useState(null);
    const [aboutImageMediaId, setAboutImageMediaId] = React.useState(null);
    const [aboutImageUrl, setAboutImageUrl] = React.useState(null);
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
    const onSaveDraft = async (data) => {
        try {
            const payload = { ...data };
            if (heroImageMediaId !== null)
                payload.heroImageMediaId = heroImageMediaId;
            if (aboutImageMediaId !== null)
                payload.aboutImageMediaId = aboutImageMediaId;
            await updateSettings.mutateAsync({ data: payload });
            queryClient.invalidateQueries({ queryKey: ['/api/settings/draft'] });
            toast({ title: "Draft saved successfully" });
        }
        catch {
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
            }
            catch {
                toast({ title: "Failed to publish", variant: "destructive" });
            }
        }
    };
    if (isLoading)
        return _jsx("div", { children: "Loading settings..." });
    return (_jsxs("div", { className: "space-y-8 max-w-5xl mx-auto", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-6 rounded-sm border border-border", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-serif text-primary", children: "Website Settings" }), _jsx("p", { className: "text-muted-foreground mt-1", children: draftSettings?.isDraft
                                    ? _jsx("span", { className: "text-amber-600 font-medium flex items-center gap-2", children: "\u25CF Unsaved draft changes exist" })
                                    : _jsx("span", { className: "text-green-600 flex items-center gap-2", children: "\u25CF Draft is synced with live site" }) })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs(Button, { variant: "outline", onClick: form.handleSubmit(onSaveDraft), disabled: updateSettings.isPending, className: "gap-2", children: [_jsx(Save, { className: "w-4 h-4" }), " Save Draft"] }), _jsx(Button, { onClick: onPublish, disabled: publishSettings.isPending || !draftSettings?.isDraft, className: "gap-2 bg-green-600 hover:bg-green-700 text-white", children: "\uD83D\uDE80 Publish Changes" })] })] }), _jsx("div", { className: "bg-card rounded-sm border border-border", children: _jsxs(Tabs, { defaultValue: "general", className: "w-full", children: [_jsxs(TabsList, { className: "w-full justify-start rounded-none border-b border-border bg-transparent h-12 p-0 overflow-x-auto", children: [_jsx(TabsTrigger, { value: "general", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6", children: "General" }), _jsx(TabsTrigger, { value: "hero", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6", children: "Hero Section" }), _jsx(TabsTrigger, { value: "about", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6", children: "About Section" }), _jsx(TabsTrigger, { value: "contact", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6", children: "Contact & Links" }), _jsx(TabsTrigger, { value: "policies", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-6", children: "Policies" })] }), _jsxs("form", { className: "p-8", children: [_jsxs(TabsContent, { value: "general", className: "space-y-6 m-0", children: [_jsx("h2", { className: "text-xl font-serif text-primary mb-6", children: "Global Identity" }), _jsxs("div", { className: "grid gap-6 max-w-2xl", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Site Name" }), _jsx(Input, { ...form.register('siteName') })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Tagline / Short Description" }), _jsx(Textarea, { ...form.register('tagline'), rows: 2 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Footer Text" }), _jsx(Input, { ...form.register('footerText') })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Homepage Property Highlight" }), _jsx(Textarea, { ...form.register('mealHighlight'), rows: 2 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Use a new line to separate the meal title from the service detail." })] })] })] }), _jsxs(TabsContent, { value: "hero", className: "space-y-6 m-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-serif text-primary", children: "Homepage Hero" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: form.watch('heroVisible'), onCheckedChange: (checked) => form.setValue('heroVisible', checked) }), _jsx(Label, { children: "Hero Visible" })] })] }), _jsxs("div", { className: "grid gap-6 max-w-2xl", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Main Heading" }), _jsx(Input, { ...form.register('heroHeading') })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Subheading" }), _jsx(Input, { ...form.register('heroSubheading') })] }), _jsx(ImageField, { label: "Hero Background Image", currentUrl: heroImageUrl, currentMediaId: heroImageMediaId, onSelect: (mediaId, url) => {
                                                        setHeroImageMediaId(mediaId);
                                                        setHeroImageUrl(url);
                                                    } })] })] }), _jsxs(TabsContent, { value: "about", className: "space-y-6 m-0", children: [_jsx("h2", { className: "text-xl font-serif text-primary mb-6", children: "About Section" }), _jsxs("div", { className: "grid gap-6 max-w-2xl", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "About Heading" }), _jsx(Input, { ...form.register('aboutHeading') })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "About Text" }), _jsx(Textarea, { ...form.register('aboutText'), rows: 8 })] }), _jsx(ImageField, { label: "About Section Image", currentUrl: aboutImageUrl, currentMediaId: aboutImageMediaId, onSelect: (mediaId, url) => {
                                                        setAboutImageMediaId(mediaId);
                                                        setAboutImageUrl(url);
                                                    } })] })] }), _jsxs(TabsContent, { value: "contact", className: "space-y-6 m-0", children: [_jsx("h2", { className: "text-xl font-serif text-primary mb-6", children: "Contact Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl", children: [_jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "Phone Number(s)" }), _jsx(Input, { ...form.register('contactPhone'), placeholder: "+91 00000 00000, +91 00000 00000" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Separate multiple numbers with a comma." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "WhatsApp Number (include country code)" }), _jsx(Input, { ...form.register('contactWhatsapp'), placeholder: "+919459040109" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Email Address" }), _jsx(Input, { ...form.register('contactEmail'), type: "email" })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "Physical Address" }), _jsx(Textarea, { ...form.register('contactAddress'), rows: 2 })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "Google Maps URL" }), _jsx(Input, { ...form.register('googleMapsUrl') })] }), _jsxs("div", { className: "space-y-2 md:col-span-2", children: [_jsx(Label, { children: "Google Reviews URL" }), _jsx(Input, { ...form.register('googleReviewsUrl') })] })] })] }), _jsxs(TabsContent, { value: "policies", className: "space-y-6 m-0", children: [_jsx("h2", { className: "text-xl font-serif text-primary mb-6", children: "Homestay Policies" }), _jsxs("div", { className: "grid gap-6 max-w-2xl", children: [_jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Check-In Time" }), _jsx(Input, { ...form.register('checkInTime'), placeholder: "e.g. 1:00 PM" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Check-Out Time" }), _jsx(Input, { ...form.register('checkOutTime'), placeholder: "e.g. 12:00 PM" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Cancellation Policy" }), _jsx(Textarea, { ...form.register('cancellationPolicy'), rows: 4 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Amenities" }), _jsx(Textarea, { ...form.register('amenitiesText'), rows: 10, placeholder: "Amenity name|Description" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["One amenity per line, using ", _jsx("code", { children: "Name|Description" }), "."] })] })] })] })] })] }) })] }));
}
