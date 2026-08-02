import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useParams } from 'wouter';
import { useGetRoom, useListRoomImages, useSetRoomCoverImage, useRemoveRoomImage, useAddRoomImage, useListMedia } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Trash2, Star, Check, Search, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
export default function RoomImages() {
    const { id } = useParams();
    const roomId = parseInt(id || '0', 10);
    const { data: room, isLoading: isLoadingRoom } = useGetRoom(roomId, {
        query: { enabled: !!roomId, queryKey: ['/api/rooms', roomId] },
    });
    const { data: images, isLoading: isLoadingImages } = useListRoomImages(roomId, {
        query: { enabled: !!roomId, queryKey: ['/api/rooms', roomId, 'images'] },
    });
    const setCover = useSetRoomCoverImage();
    const removeImage = useRemoveRoomImage();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isMediaPickerOpen, setIsMediaPickerOpen] = React.useState(false);
    const sortedImages = [...(images || [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const handleSetCover = async (imageId) => {
        try {
            await setCover.mutateAsync({ id: roomId, imageId });
            queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId] });
            queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/images`] });
            queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
            toast({ title: "Cover image updated" });
        }
        catch {
            toast({ title: "Failed to update cover", variant: "destructive" });
        }
    };
    const handleRemove = async (imageId) => {
        if (confirm("Remove this image from the room?")) {
            try {
                await removeImage.mutateAsync({ id: roomId, imageId });
                queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/images`] });
                toast({ title: "Removed from room" });
            }
            catch {
                toast({ title: "Delete failed", variant: "destructive" });
            }
        }
    };
    if (isLoadingRoom)
        return _jsx("div", { className: "p-8", children: "Loading room details..." });
    if (!room)
        return _jsx("div", { className: "p-8", children: "Room not found." });
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs(Link, { href: "/admin/rooms", className: "inline-flex items-center text-sm text-muted-foreground hover:text-primary", children: [_jsx(ChevronLeft, { className: "w-4 h-4 mr-1" }), " Back to Rooms"] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-serif text-primary", children: ["Manage Images: ", room.name] }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Add and organize photos for this specific room." })] }), _jsxs(Button, { onClick: () => setIsMediaPickerOpen(true), className: "gap-2", children: [_jsx(ImagePlus, { className: "w-4 h-4" }), " Add Images"] })] }), isLoadingImages ? (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6", children: [...Array(4)].map((_, i) => _jsx("div", { className: "aspect-square bg-muted animate-pulse rounded-sm" }, i)) })) : sortedImages.length === 0 ? (_jsxs("div", { className: "text-center py-32 border border-dashed border-border rounded-sm bg-muted/20", children: [_jsx(ImagePlus, { className: "w-16 h-16 mx-auto text-muted-foreground/30 mb-4" }), _jsx("h3", { className: "text-xl font-serif text-primary mb-2", children: "No images found" }), _jsx("p", { className: "text-foreground/60 mb-6", children: "Select images from your media library to display them on the room page." }), _jsx(Button, { onClick: () => setIsMediaPickerOpen(true), variant: "outline", children: "Browse Media Library" })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: sortedImages.map((image) => (_jsxs("div", { className: "bg-card border border-border rounded-sm overflow-hidden flex flex-col", children: [_jsxs("div", { className: "aspect-[4/3] bg-muted relative group", children: [_jsx("img", { src: image.url, alt: image.altText || '', className: "w-full h-full object-cover" }), image.isCover && (_jsxs("div", { className: "absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-medium uppercase tracking-wider rounded-sm shadow-sm flex items-center", children: [_jsx(Star, { className: "w-3 h-3 fill-current mr-1" }), " Cover"] }))] }), _jsx("div", { className: "p-4 flex-1 flex flex-col gap-4", children: _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Button, { variant: image.isCover ? "secondary" : "outline", size: "sm", className: "w-full", onClick: () => handleSetCover(image.id), disabled: image.isCover, children: image.isCover ? 'Current Cover' : 'Set as Cover' }), _jsxs(Button, { variant: "ghost", size: "sm", className: "w-full text-destructive hover:text-destructive hover:bg-destructive/10", onClick: () => handleRemove(image.id), children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), " Remove"] })] }) })] }, image.id))) })), _jsx(RoomMediaPickerDialog, { roomId: roomId, open: isMediaPickerOpen, onOpenChange: setIsMediaPickerOpen, existingMediaIds: sortedImages.map(i => i.mediaId) })] }));
}
function RoomMediaPickerDialog({ roomId, open, onOpenChange, existingMediaIds }) {
    const [search, setSearch] = React.useState('');
    const { data: mediaFiles, isLoading } = useListMedia({ search });
    const addRoomImage = useAddRoomImage();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = React.useState(new Set());
    React.useEffect(() => {
        if (!open) {
            setSelectedIds(new Set());
            setSearch('');
        }
    }, [open]);
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
    const handleAdd = async () => {
        try {
            const promises = Array.from(selectedIds).map(mediaId => addRoomImage.mutateAsync({ id: roomId, data: { mediaId, isCover: false, sortOrder: 999 } }));
            await Promise.all(promises);
            queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/images`] });
            toast({ title: `Added ${selectedIds.size} images to room` });
            onOpenChange(false);
        }
        catch {
            toast({ title: "Failed to add some images", variant: "destructive" });
        }
    };
    const availableMedia = mediaFiles?.filter(m => !existingMediaIds.includes(m.id)) || [];
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] flex flex-col", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "font-serif text-2xl", children: "Select Media" }) }), _jsxs("div", { className: "relative mb-4", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by filename...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })] }), _jsx("div", { className: "flex-1 overflow-y-auto min-h-[300px] border border-border p-4 rounded-sm bg-muted/10", children: isLoading ? (_jsx("div", { className: "text-center py-12", children: "Loading media..." })) : availableMedia.length === 0 ? (_jsx("div", { className: "text-center py-20 text-muted-foreground", children: search ? 'No matches found.' : 'No new media available. Upload some in the Media Library.' })) : (_jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4", children: availableMedia.map(media => {
                            const isSelected = selectedIds.has(media.id);
                            return (_jsxs("div", { className: `relative aspect-square cursor-pointer border-2 rounded-sm overflow-hidden ${isSelected ? 'border-primary' : 'border-transparent hover:border-primary/50'}`, onClick: () => toggleSelect(media.id), children: [_jsx("img", { src: media.url, alt: "", className: `w-full h-full object-cover ${isSelected ? 'opacity-80' : ''}` }), isSelected && (_jsx("div", { className: "absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center", children: _jsx(Check, { className: "w-4 h-4" }) }))] }, media.id));
                        }) })) }), _jsx(DialogFooter, { className: "mt-4 border-t border-border pt-4", children: _jsxs("div", { className: "flex justify-between items-center w-full", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: [selectedIds.size, " selected"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), _jsx(Button, { onClick: handleAdd, disabled: selectedIds.size === 0 || addRoomImage.isPending, children: "Add to Room" })] })] }) })] }) }));
}
