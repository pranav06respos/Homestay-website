import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useListBookings, useUpdateBookingStatus } from '@workspace/api-client-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Phone } from 'lucide-react';
export default function Bookings() {
    const { data: bookings, isLoading } = useListBookings();
    const updateStatus = useUpdateBookingStatus();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const handleStatusChange = async (id, status) => {
        try {
            await updateStatus.mutateAsync({ id, data: { status } });
            queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
            toast({ title: "Status updated" });
        }
        catch {
            toast({ title: "Failed to update status", variant: "destructive" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-serif text-primary", children: "Bookings" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Manage reservation requests and confirmations" })] }), _jsx("div", { className: "bg-card rounded-sm border border-border overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Guest" }), _jsx(TableHead, { children: "Contact" }), _jsx(TableHead, { children: "Dates" }), _jsx(TableHead, { children: "Room" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Requested On" })] }) }), _jsx(TableBody, { children: isLoading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8", children: "Loading..." }) })) : bookings?.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-8 text-muted-foreground", children: "No bookings found." }) })) : (bookings?.map((booking) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { children: [_jsx("div", { className: "font-medium", children: booking.guestName }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [booking.guests, " Guests"] })] }), _jsxs(TableCell, { children: [_jsx("div", { className: "text-sm mb-1", children: booking.phone }), booking.email && _jsx("div", { className: "text-xs text-muted-foreground mb-2", children: booking.email }), _jsxs("div", { className: "flex gap-1.5", children: [booking.phone && (_jsxs("a", { href: `tel:${booking.phone.replace(/\s/g, '')}`, className: "inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm hover:bg-blue-100 transition-colors", title: "Call guest", children: [_jsx(Phone, { className: "w-3 h-3" }), " Call"] })), booking.phone && (_jsxs("a", { href: `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${booking.guestName}, thank you for your booking enquiry at Neel Kamal Homestay · KASAULI. `)}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-sm hover:bg-green-100 transition-colors", title: "WhatsApp guest", children: [_jsx(MessageCircle, { className: "w-3 h-3" }), " WhatsApp"] }))] })] }), _jsxs(TableCell, { children: [_jsx("div", { className: "text-sm", children: new Date(booking.checkIn).toLocaleDateString() }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["to ", new Date(booking.checkOut).toLocaleDateString()] })] }), _jsx(TableCell, { children: _jsx("div", { className: "text-sm", children: booking.roomName || 'Any Room' }) }), _jsx(TableCell, { children: _jsxs(Select, { defaultValue: booking.status, onValueChange: (val) => handleStatusChange(booking.id, val), children: [_jsx(SelectTrigger, { className: `h-8 w-32 text-xs uppercase tracking-wider font-medium rounded-sm border ${getStatusColor(booking.status)}`, children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "confirmed", children: "Confirmed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" })] })] }) }), _jsx(TableCell, { className: "text-sm text-muted-foreground", children: new Date(booking.createdAt).toLocaleDateString() })] }, booking.id)))) })] }) })] }));
}
