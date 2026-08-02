import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useListMedia, useUploadMedia, useDeleteMedia, useUpdateMedia } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Search, Image as ImageIcon, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
export default function MediaLibrary() {
    const [search, setSearch] = React.useState('');
    const { data: mediaFiles, isLoading } = useListMedia({ search });
    const upload = useUploadMedia();
    const deleteMedia = useDeleteMedia();
    const updateMedia = useUpdateMedia();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = React.useRef(null);
    const [selectedIds, setSelectedIds] = React.useState(new Set());
    const [previewMedia, setPreviewMedia] = React.useState(null);
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            // Need to cast to any for FormData usage with orval mutation
            const formData = new FormData();
            formData.append('file', file);
            await upload.mutateAsync({ data: formData });
            queryClient.invalidateQueries({ queryKey: ['/api/media'] });
            toast({ title: "Media uploaded successfully" });
        }
        catch {
            toast({ title: "Upload failed", variant: "destructive" });
        }
        finally {
            if (fileInputRef.current)
                fileInputRef.current.value = '';
        }
    };
    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this file? It will be removed from all associated uses.")) {
            try {
                await deleteMedia.mutateAsync({ id });
                queryClient.invalidateQueries({ queryKey: ['/api/media'] });
                queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                setPreviewMedia(null);
                toast({ title: "Media deleted" });
            }
            catch {
                toast({ title: "Failed to delete", variant: "destructive" });
            }
        }
    };
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-serif text-primary", children: "Media Library" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Manage all images and files" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Input, { type: "file", ref: fileInputRef, onChange: handleUpload, className: "hidden", accept: "image/*" }), _jsxs(Button, { onClick: () => fileInputRef.current?.click(), disabled: upload.isPending, className: "gap-2", children: [_jsx(Upload, { className: "w-4 h-4" }), " ", upload.isPending ? 'Uploading...' : 'Upload File'] })] })] }), _jsxs("div", { className: "bg-card p-4 rounded-sm border border-border flex items-center justify-between", children: [_jsxs("div", { className: "relative w-72", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by filename...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })] }), selectedIds.size > 0 && (_jsxs("div", { className: "flex items-center gap-4 text-sm bg-primary/10 text-primary px-4 py-2 rounded-sm font-medium", children: [_jsxs("span", { children: [selectedIds.size, " selected"] }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 text-primary hover:bg-primary/20", onClick: () => setSelectedIds(new Set()), children: "Clear" })] }))] }), isLoading ? (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6", children: [...Array(10)].map((_, i) => _jsx("div", { className: "aspect-square bg-muted animate-pulse rounded-sm" }, i)) })) : mediaFiles?.length === 0 ? (_jsxs("div", { className: "text-center py-32 border border-dashed border-border rounded-sm bg-muted/20", children: [_jsx(ImageIcon, { className: "w-16 h-16 mx-auto text-muted-foreground/30 mb-4" }), _jsx("h3", { className: "text-xl font-serif text-primary mb-2", children: "No media found" }), _jsx("p", { className: "text-foreground/60", children: "Upload some images to get started." })] })) : (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4", children: mediaFiles?.map((media) => {
                    const isSelected = selectedIds.has(media.id);
                    return (_jsxs("div", { className: `relative aspect-square group rounded-sm overflow-hidden border-2 transition-all ${isSelected ? 'border-primary' : 'border-transparent bg-muted'}`, children: [_jsx("img", { src: media.url, alt: media.altText || media.filename, className: `w-full h-full object-cover cursor-pointer ${isSelected ? 'opacity-90 scale-95 rounded-sm' : ''}`, onClick: () => toggleSelect(media.id) }), isSelected && (_jsx("div", { className: "absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center", children: _jsx(Check, { className: "w-4 h-4" }) })), _jsx("div", { className: `absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'hidden' : ''}`, children: _jsx(Button, { variant: "secondary", size: "icon", className: "w-8 h-8 rounded-full", onClick: (e) => { e.stopPropagation(); setPreviewMedia(media); }, children: _jsx(Eye, { className: "w-4 h-4" }) }) }), _jsx("div", { className: "absolute bottom-0 left-0 w-full bg-black/60 text-white text-[10px] truncate px-2 py-1 backdrop-blur-sm", children: media.originalName })] }, media.id));
                }) })), _jsx(MediaPreviewDialog, { media: previewMedia, open: !!previewMedia, onOpenChange: (v) => !v && setPreviewMedia(null), onDelete: () => previewMedia && handleDelete(previewMedia.id) })] }));
}
// Temporary inline Eye icon component since it wasn't imported in the main file
const Eye = ({ className }) => (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: className, children: [_jsx("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] }));
function MediaPreviewDialog({ media, open, onOpenChange, onDelete }) {
    const updateMedia = useUpdateMedia();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [altText, setAltText] = React.useState('');
    React.useEffect(() => {
        if (media)
            setAltText(media.altText || '');
    }, [media]);
    const handleSave = async () => {
        if (!media)
            return;
        try {
            await updateMedia.mutateAsync({ id: media.id, data: { altText } });
            queryClient.invalidateQueries({ queryKey: ['/api/media'] });
            toast({ title: "Media updated" });
            onOpenChange(false);
        }
        catch {
            toast({ title: "Update failed", variant: "destructive" });
        }
    };
    if (!media)
        return null;
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsx(DialogContent, { className: "max-w-4xl p-0 overflow-hidden bg-background", children: _jsxs("div", { className: "flex flex-col md:flex-row h-[70vh]", children: [_jsx("div", { className: "w-full md:w-2/3 bg-muted/30 flex items-center justify-center p-4 border-r border-border", children: _jsx("img", { src: media.url, alt: media.altText || '', className: "max-w-full max-h-full object-contain drop-shadow-md" }) }), _jsxs("div", { className: "w-full md:w-1/3 p-6 flex flex-col bg-card", children: [_jsx(DialogHeader, { className: "mb-6", children: _jsx(DialogTitle, { className: "font-serif", children: "Media Details" }) }), _jsxs("div", { className: "space-y-4 flex-1", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider mb-1", children: "Filename" }), _jsx("p", { className: "text-sm font-mono break-all", children: media.originalName })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider mb-1", children: "Type" }), _jsx("p", { className: "text-sm", children: media.mimeType })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider mb-1", children: "Size" }), _jsxs("p", { className: "text-sm", children: [(media.sizeBytes / 1024).toFixed(1), " KB"] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider mb-1", children: "Used In" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: media.usedIn.length > 0 ? (media.usedIn.map((use, i) => (_jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-sm", children: use }, i)))) : (_jsx("span", { className: "text-xs text-muted-foreground italic", children: "Not used anywhere" })) })] }), _jsxs("div", { className: "pt-4 border-t border-border", children: [_jsx(Label, { children: "Alt Text (for accessibility)" }), _jsx(Input, { value: altText, onChange: (e) => setAltText(e.target.value), className: "mt-2", placeholder: "Describe the image..." })] })] }), _jsxs(DialogFooter, { className: "mt-8 flex justify-between sm:justify-between items-center", children: [_jsxs(Button, { variant: "outline", className: "text-destructive hover:text-destructive hover:bg-destructive/10", onClick: onDelete, children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), " Delete"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Close" }), _jsx(Button, { onClick: handleSave, disabled: updateMedia.isPending, children: "Save" })] })] })] })] }) }) }));
}
