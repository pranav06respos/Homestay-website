import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListRooms, useCreateBooking, useGetSettings } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
const bookingSchema = z.object({
    guestName: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Valid phone number required"),
    email: z.string().email("Valid email required").optional().or(z.literal('')),
    guests: z.coerce.number().min(1, "At least 1 guest required"),
    roomId: z.coerce.number().optional(),
    checkIn: z.string().min(1, "Check-in date required"),
    checkOut: z.string().min(1, "Check-out date required"),
    specialRequest: z.string().optional(),
}).superRefine((values, ctx) => {
    if (values.checkIn && values.checkOut && values.checkOut <= values.checkIn) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['checkOut'],
            message: 'Check-out must be after check-in',
        });
    }
});
export default function Book() {
    const searchParams = new URLSearchParams(window.location.search);
    const preselectedRoom = searchParams.get('room');
    const { data: rooms } = useListRooms();
    const { data: settings } = useGetSettings();
    const createBooking = useCreateBooking();
    const { toast } = useToast();
    const visibleRooms = rooms?.filter(r => r.isVisible) || [];
    const availableRooms = visibleRooms.filter(r => r.isAvailable);
    const form = useForm({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            guestName: '',
            phone: '',
            email: '',
            guests: 2,
            roomId: preselectedRoom ? parseInt(preselectedRoom, 10) : undefined,
            checkIn: '',
            checkOut: '',
            specialRequest: '',
        },
    });
    const getWhatsAppUrl = (values) => {
        const room = availableRooms.find(r => r.id === values.roomId);
        const roomName = room ? room.name : 'Any available room';
        const message = `New Booking Request

Guest Name: ${values.guestName}
Phone Number: ${values.phone}
Selected Room: ${roomName}
Number of Guests: ${values.guests}
Check-in Date: ${values.checkIn}
Check-out Date: ${values.checkOut}
Special Request: ${values.specialRequest || ''}`;
        return `https://wa.me/919459040109?text=${encodeURIComponent(message)}`;
    };
    const onSubmit = async (values) => {
        try {
            await createBooking.mutateAsync({ data: {
                    guestName: values.guestName,
                    phone: values.phone,
                    email: values.email || undefined,
                    guests: values.guests,
                    roomId: values.roomId && values.roomId > 0 ? values.roomId : undefined,
                    checkIn: new Date(values.checkIn).toISOString(),
                    checkOut: new Date(values.checkOut).toISOString(),
                    specialRequest: values.specialRequest,
                } });
            window.location.href = getWhatsAppUrl(values);
            toast({
                title: "Booking Request Sent",
                description: "We will confirm your reservation shortly.",
            });
        }
        catch {
            toast({
                title: "Opening WhatsApp",
                description: "The booking server is unavailable. Your details are ready to send directly to Neel Kamal Homestay.",
            });
            window.location.href = getWhatsAppUrl(values);
        }
    };
    return (_jsx("div", { className: "pt-32 pb-24 min-h-screen bg-background", children: _jsxs("div", { className: "container mx-auto px-4 max-w-3xl", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-serif text-primary mb-4", children: "Request a Reservation" }), _jsx("p", { className: "text-foreground/70", children: "Submit your details below. We will confirm availability and get back to you immediately." })] }), _jsx("div", { className: "bg-card p-8 md:p-12 rounded-sm border border-border shadow-sm", children: _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormField, { control: form.control, name: "guestName", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Full Name *" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "John Doe", className: "rounded-sm border-border bg-background", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "phone", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Phone Number *" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "+91 00000 00000", className: "rounded-sm border-border bg-background", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Email Address" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "john@example.com", type: "email", className: "rounded-sm border-border bg-background", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "guests", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Number of Guests *" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", min: "1", max: "10", className: "rounded-sm border-border bg-background", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "roomId", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Room Preference" }), _jsxs(Select, { onValueChange: (v) => field.onChange(parseInt(v, 10)), value: field.value?.toString() || "", children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "rounded-sm border-border bg-background", children: _jsx(SelectValue, { placeholder: "No preference (Any available)" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "0", children: "No preference (Any available)" }), availableRooms.map((room) => (_jsxs(SelectItem, { value: room.id.toString(), children: [room.name, " (Max ", room.maxGuests, " guests)"] }, room.id)))] })] }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormField, { control: form.control, name: "checkIn", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Check-in Date *" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", className: "rounded-sm border-border bg-background", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "checkOut", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Check-out Date *" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", className: "rounded-sm border-border bg-background", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "specialRequest", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Special Requests" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Any dietary requirements, early check-in, etc.", className: "rounded-sm border-border bg-background min-h-[100px]", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full h-14 rounded-sm uppercase tracking-widest font-medium text-sm", disabled: createBooking.isPending, children: createBooking.isPending ? 'Sending...' : 'Submit Request via WhatsApp' })] }) }) })] }) }));
}
