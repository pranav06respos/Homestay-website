import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useListReviews, useToggleReviewVisible, useCreateReview, useUpdateReview, useDeleteReview } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
export default function Reviews() {
    const { data: reviews, isLoading } = useListReviews({ admin: 'true' });
    const toggleVisible = useToggleReviewVisible();
    const deleteReview = useDeleteReview();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = React.useState(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const handleToggleVisible = async (id) => {
        try {
            await toggleVisible.mutateAsync({ id });
            queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
            toast({ title: "Visibility updated" });
        }
        catch {
            toast({ title: "Failed to update", variant: "destructive" });
        }
    };
    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this review?")) {
            try {
                await deleteReview.mutateAsync({ id });
                queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
                toast({ title: "Review deleted" });
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
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-serif text-primary", children: "Reviews" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Manage guest testimonials and ratings" })] }), _jsxs(Button, { onClick: openCreate, className: "gap-2", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add Review"] })] }), _jsx("div", { className: "bg-card rounded-sm border border-border overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Guest" }), _jsx(TableHead, { children: "Rating" }), _jsx(TableHead, { children: "Review" }), _jsx(TableHead, { children: "Source/Date" }), _jsx(TableHead, { children: "Visibility" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8", children: "Loading..." }) })) : reviews?.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground", children: "No reviews found." }) })) : (reviews?.map((item) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: item.guestName }), _jsx(TableCell, { children: _jsx("div", { className: "flex text-amber-500", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `w-3 h-3 ${i < item.rating ? 'fill-current' : 'text-muted-foreground/30'}` }, i))) }) }), _jsx(TableCell, { className: "max-w-xs truncate", children: item.reviewText }), _jsxs(TableCell, { children: [_jsx("div", { className: "text-sm", children: item.source || '-' }), _jsx("div", { className: "text-xs text-muted-foreground", children: item.stayDate || '-' })] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: item.isVisible, onCheckedChange: () => handleToggleVisible(item.id) }), _jsx("span", { className: "text-sm", children: item.isVisible ? 'Visible' : 'Hidden' })] }) }), _jsx(TableCell, { className: "text-right", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => openEdit(item), children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDelete(item.id), className: "text-destructive hover:text-destructive", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, item.id)))) })] }) }), _jsx(ReviewDialog, { item: editingItem, open: isDialogOpen, onOpenChange: setIsDialogOpen })] }));
}
function ReviewDialog({ item, open, onOpenChange }) {
    const create = useCreateReview();
    const update = useUpdateReview();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const form = useForm({
        defaultValues: {
            guestName: '',
            rating: 5,
            reviewText: '',
            stayDate: '',
            source: '',
            isVisible: true
        }
    });
    React.useEffect(() => {
        if (item) {
            form.reset({
                guestName: item.guestName,
                rating: item.rating,
                reviewText: item.reviewText,
                stayDate: item.stayDate || '',
                source: item.source || '',
                isVisible: item.isVisible
            });
        }
        else {
            form.reset({ guestName: '', rating: 5, reviewText: '', stayDate: '', source: '', isVisible: true });
        }
    }, [item, form, open]);
    const onSubmit = async (data) => {
        const payload = {
            ...data,
            rating: parseInt(data.rating),
        };
        try {
            if (item) {
                await update.mutateAsync({ id: item.id, data: payload });
                toast({ title: "Review updated" });
            }
            else {
                await create.mutateAsync({ data: payload });
                toast({ title: "Review created" });
            }
            queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
            onOpenChange(false);
        }
        catch {
            toast({ title: "Failed to save", variant: "destructive" });
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { className: "font-serif text-2xl", children: item ? 'Edit Review' : 'Add Review' }) }), _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 mt-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Guest Name" }), _jsx(Input, { ...form.register('guestName'), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Rating (1-5)" }), _jsx(Controller, { control: form.control, name: "rating", render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, value: field.value.toString(), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: [5, 4, 3, 2, 1].map(num => (_jsxs(SelectItem, { value: num.toString(), children: [num, " Stars"] }, num))) })] })) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Review Text" }), _jsx(Textarea, { ...form.register('reviewText'), rows: 4, required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Stay Date (e.g. \"October 2023\")" }), _jsx(Input, { ...form.register('stayDate') })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Source (e.g. \"Google\", \"Airbnb\")" }), _jsx(Input, { ...form.register('source') })] })] }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Switch, { checked: form.watch('isVisible'), onCheckedChange: (checked) => form.setValue('isVisible', checked) }), _jsx(Label, { children: "Visible to Public" })] }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: create.isPending || update.isPending, children: "Save" })] })] })] }) }));
}
