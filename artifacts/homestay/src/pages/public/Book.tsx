import React from 'react';
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

  const form = useForm<z.infer<typeof bookingSchema>>({
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

  const getWhatsAppUrl = (values: z.infer<typeof bookingSchema>) => {
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

  const onSubmit = async (values: z.infer<typeof bookingSchema>) => {
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
      }});

      window.location.href = getWhatsAppUrl(values);
      toast({
        title: "Booking Request Sent",
        description: "We will confirm your reservation shortly.",
      });

    } catch {
      toast({
        title: "Opening WhatsApp",
        description: "The booking server is unavailable. Your details are ready to send directly to Neel Kamal Homestay.",
      });
      window.location.href = getWhatsAppUrl(values);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">Request a Reservation</h1>
          <p className="text-foreground/70">
            Submit your details below. We will confirm availability and get back to you immediately.
          </p>
        </div>

        <div className="bg-card p-8 md:p-12 rounded-sm border border-border shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="rounded-sm border-border bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 00000 00000" className="rounded-sm border-border bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" className="rounded-sm border-border bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">Number of Guests *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" className="rounded-sm border-border bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest text-xs">Room Preference</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v, 10))} value={field.value?.toString() || ""}>
                      <FormControl>
                        <SelectTrigger className="rounded-sm border-border bg-background">
                          <SelectValue placeholder="No preference (Any available)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">No preference (Any available)</SelectItem>
                        {availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name} (Max {room.maxGuests} guests)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">Check-in Date *</FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-sm border-border bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest text-xs">Check-out Date *</FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-sm border-border bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialRequest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest text-xs">Special Requests</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any dietary requirements, early check-in, etc." 
                        className="rounded-sm border-border bg-background min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 rounded-sm uppercase tracking-widest font-medium text-sm"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? 'Sending...' : 'Submit Request via WhatsApp'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}