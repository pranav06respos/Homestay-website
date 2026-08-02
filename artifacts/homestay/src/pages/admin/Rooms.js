import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useListRooms, useToggleRoomAvailable, useToggleRoomVisible, useDeleteRoom, useCreateRoom, useUpdateRoom } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Plus, Edit, Trash2, Eye, EyeOff, BedDouble, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
export default function Rooms() {
    const { data: rooms, isLoading } = useListRooms({ admin: 'true' });
    const toggleAvailable = useToggleRoomAvailable();
    const toggleVisible = useToggleRoomVisible();
    const deleteRoom = useDeleteRoom();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingRoom, setEditingRoom] = React.useState(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const handleToggleAvailable = async (id) => {
        try {
            await toggleAvailable.mutateAsync({ id });
            queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
            toast({ title: "Availability updated" });
        }
        catch {
            toast({ title: "Failed to update", variant: "destructive" });
        }
    };
    const handleToggleVisible = async (id) => {
        try {
            await toggleVisible.mutateAsync({ id });
            queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
            toast({ title: "Visibility updated" });
        }
        catch {
            toast({ title: "Failed to update", variant: "destructive" });
        }
    };
    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this room? This cannot be undone.")) {
            try {
                await deleteRoom.mutateAsync({ id });
                queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
                toast({ title: "Room deleted" });
            }
            catch {
                toast({ title: "Failed to delete room", variant: "destructive" });
            }
        }
    };
    const openEdit = (room) => {
        setEditingRoom(room);
        setIsDialogOpen(true);
    };
    const openCreate = () => {
        setEditingRoom(null);
        setIsDialogOpen(true);
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-serif text-primary", children: "Rooms" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Manage property rooms and accommodations" })] }), _jsxs(Button, { onClick: openCreate, className: "gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add Room"] })] }), _jsx("div", { className: "bg-card rounded-sm border border-border overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-20", children: "Image" }), _jsx(TableHead, { children: "Details" }), _jsx(TableHead, { children: "Price / Night" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Visibility" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8", children: "Loading..." }) })) : rooms?.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground", children: "No rooms found." }) })) : (rooms?.map((room) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx("div", { className: "w-16 h-12 bg-muted rounded overflow-hidden flex items-center justify-center", children: room.coverImageUrl ? (_jsx("img", { src: room.coverImageUrl, alt: room.name, className: "w-full h-full object-cover" })) : (_jsx(ImageIcon, { className: "w-4 h-4 text-muted-foreground/50" })) }) }), _jsxs(TableCell, { children: [_jsx("div", { className: "font-medium text-foreground", children: room.name }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-2", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(BedDouble, { className: "w-3 h-3" }), " ", room.maxGuests, " max"] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: room.bedType })] })] }), _jsx(TableCell, { children: room.pricePerNight ? `₹${room.pricePerNight}` : '-' }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: room.isAvailable, onCheckedChange: () => handleToggleAvailable(room.id) }), _jsx("span", { className: "text-sm", children: room.isAvailable ? 'Available' : 'Booked' })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "p-0 h-auto", onClick: () => handleToggleVisible(room.id), children: room.isVisible ? _jsx(Eye, { className: "w-4 h-4 text-green-600" }) : _jsx(EyeOff, { className: "w-4 h-4 text-muted-foreground" }) }), _jsx("span", { className: "text-sm text-muted-foreground", children: room.isVisible ? 'Public' : 'Hidden' })] }) }), _jsx(TableCell, { className: "text-right", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Link, { href: `/admin/rooms/${room.id}/images`, children: _jsx(Button, { variant: "outline", size: "sm", title: "Manage Images", children: _jsx(ImageIcon, { className: "w-4 h-4" }) }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => openEdit(room), title: "Edit Room", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDelete(room.id), className: "text-destructive hover:text-destructive", title: "Delete Room", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, room.id)))) })] }) }), _jsx(RoomDialog, { room: editingRoom, open: isDialogOpen, onOpenChange: setIsDialogOpen })] }));
}
function RoomDialog({ room, open, onOpenChange }) {
    const createRoom = useCreateRoom();
    const updateRoom = useUpdateRoom();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const form = useForm({
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            shortDescription: '',
            pricePerNight: '',
            maxGuests: 2,
            bedType: '',
            amenities: '',
            sortOrder: 0
        }
    });
    React.useEffect(() => {
        if (room) {
            form.reset({
                name: room.name,
                slug: room.slug,
                description: room.description,
                shortDescription: room.shortDescription,
                pricePerNight: room.pricePerNight?.toString() || '',
                maxGuests: room.maxGuests,
                bedType: room.bedType,
                amenities: room.amenities?.join(', ') || '',
                sortOrder: room.sortOrder || 0
            });
        }
        else {
            form.reset({
                name: '', slug: '', description: '', shortDescription: '', pricePerNight: '', maxGuests: 2, bedType: '', amenities: '', sortOrder: 0
            });
        }
    }, [room, form, open]);
    const generateSlug = (name) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        form.setValue('slug', slug);
    };
    const onSubmit = async (data) => {
        const payload = {
            name: data.name,
            slug: data.slug,
            description: data.description,
            shortDescription: data.shortDescription,
            pricePerNight: data.pricePerNight ? parseInt(data.pricePerNight) : null,
            maxGuests: parseInt(data.maxGuests),
            bedType: data.bedType,
            amenities: data.amenities.split(',').map((s) => s.trim()).filter(Boolean),
            sortOrder: parseInt(data.sortOrder)
        };
        try {
            if (room) {
                await updateRoom.mutateAsync({ id: room.id, data: payload });
                toast({ title: "Room updated" });
            }
            else {
                await createRoom.mutateAsync({ data: payload });
                toast({ title: "Room created" });
            }
            queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
            onOpenChange(false);
        }
        catch {
            toast({ title: "Failed to save room", variant: "destructive" });
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "font-serif text-2xl", children: room ? 'Edit Room' : 'Add New Room' }) }), _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6 mt-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Room Name" }), _jsx(Input, { ...form.register('name'), onChange: (e) => {
                                                form.register('name').onChange(e);
                                                if (!room)
                                                    generateSlug(e.target.value);
                                            } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "URL Slug" }), _jsx(Input, { ...form.register('slug') })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Price per Night (\u20B9)" }), _jsx(Input, { type: "number", ...form.register('pricePerNight') })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Max Guests" }), _jsx(Input, { type: "number", ...form.register('maxGuests') })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Bed Type (e.g. King Size)" }), _jsx(Input, { ...form.register('bedType') })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Short Description (for list view)" }), _jsx(Textarea, { ...form.register('shortDescription'), rows: 2 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Full Description" }), _jsx(Textarea, { ...form.register('description'), rows: 5 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Amenities (comma separated)" }), _jsx(Input, { ...form.register('amenities'), placeholder: "Free WiFi, Mountain View, TV, Heater" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Sort Order" }), _jsx(Input, { type: "number", ...form.register('sortOrder') })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: createRoom.isPending || updateRoom.isPending, children: room ? 'Save Changes' : 'Create Room' })] })] })] }) }));
}
