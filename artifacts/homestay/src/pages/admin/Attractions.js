import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useListAttractions, useToggleAttractionVisible, useCreateAttraction, useUpdateAttraction, useDeleteAttraction } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
export default function Attractions() {
    const { data: attractions, isLoading } = useListAttractions({ admin: 'true' });
    const toggleVisible = useToggleAttractionVisible();
    const deleteAttraction = useDeleteAttraction();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = React.useState(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const handleToggleVisible = async (id) => {
        try {
            await toggleVisible.mutateAsync({ id });
            queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
            toast({ title: "Visibility updated" });
        }
        catch {
            toast({ title: "Failed to update", variant: "destructive" });
        }
    };
    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this attraction?")) {
            try {
                await deleteAttraction.mutateAsync({ id });
                queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
                toast({ title: "Attraction deleted" });
            }
            catch {
                toast({ title: "Failed to delete", variant: "destructive" });
            }
        }
    };
    const openEdit = (item) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };
    const openCreate = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-serif text-primary", children: "Attractions" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Manage nearby places of interest" })] }), _jsxs(Button, { onClick: openCreate, className: "gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add Attraction"] })] }), _jsx("div", { className: "bg-card rounded-sm border border-border overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Distance" }), _jsx(TableHead, { children: "Duration" }), _jsx(TableHead, { children: "Sort Order" }), _jsx(TableHead, { children: "Visibility" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8", children: "Loading..." }) })) : attractions?.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground", children: "No attractions found." }) })) : (attractions?.map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: item.name }), _jsx(TableCell, { children: item.distance || '-' }), _jsx(TableCell, { children: item.duration || '-' }), _jsx(TableCell, { children: item.sortOrder }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: item.isVisible, onCheckedChange: () => handleToggleVisible(item.id) }), _jsx("span", { className: "text-sm", children: item.isVisible ? 'Visible' : 'Hidden' })] }) }), _jsx(TableCell, { className: "text-right", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => openEdit(item), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDelete(item.id), className: "text-destructive hover:text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, item.id)))) })] }) }), _jsx(AttractionDialog, { item: editingItem, open: isDialogOpen, onOpenChange: setIsDialogOpen })] }));
}
function AttractionDialog({ item, open, onOpenChange }) {
    const create = useCreateAttraction();
    const update = useUpdateAttraction();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const form = useForm({
        defaultValues: {
            name: '',
            distance: '',
            duration: '',
            description: '',
            sortOrder: 0,
            isVisible: true
        }
    });
    React.useEffect(() => {
        if (item) {
            form.reset({
                name: item.name,
                distance: item.distance || '',
                duration: item.duration || '',
                description: item.description || '',
                sortOrder: item.sortOrder,
                isVisible: item.isVisible
            });
        }
        else {
            form.reset({ name: '', distance: '', duration: '', description: '', sortOrder: 0, isVisible: true });
        }
    }, [item, form, open]);
    const onSubmit = async (data) => {
        const payload = {
            ...data,
            sortOrder: parseInt(data.sortOrder),
        };
        try {
            if (item) {
                await update.mutateAsync({ id: item.id, data: payload });
                toast({ title: "Attraction updated" });
            }
            else {
                await create.mutateAsync({ data: payload });
                toast({ title: "Attraction created" });
            }
            queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
            onOpenChange(false);
        }
        catch {
            toast({ title: "Failed to save", variant: "destructive" });
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "font-serif text-2xl", children: item ? 'Edit Attraction' : 'Add Attraction' }) }), _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Name" }), _jsx(Input, { ...form.register('name'), required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Distance (e.g. \"1.5 km\")" }), _jsx(Input, { ...form.register('distance') })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Duration (e.g. \"15 mins drive\")" }), _jsx(Input, { ...form.register('duration') })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Description" }), _jsx(Textarea, { ...form.register('description'), rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Sort Order" }), _jsx(Input, { type: "number", ...form.register('sortOrder') })] }), _jsx("div", { className: "space-y-2 flex flex-col justify-end", children: _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Switch, { checked: form.watch('isVisible'), onCheckedChange: (checked) => form.setValue('isVisible', checked) }), _jsx(Label, { children: "Visible to Public" })] }) })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: create.isPending || update.isPending, children: "Save" })] })] })] }) }));
}
