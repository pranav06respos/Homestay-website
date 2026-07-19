import React from 'react';
import { useLocation } from 'wouter';
import { useListBookings, useUpdateBookingStatus, BookingStatusUpdateStatus } from '@workspace/api-client-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function Bookings() {
  const { data: bookings, isLoading } = useListBookings();
  const updateStatus = useUpdateBookingStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (id: number, status: BookingStatusUpdateStatus) => {
    try {
      await updateStatus.mutateAsync({ params: { id }, data: { status } });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-primary">Bookings</h1>
        <p className="text-muted-foreground mt-2">Manage reservation requests and confirmations</p>
      </div>

      <div className="bg-card rounded-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : bookings?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bookings found.</TableCell></TableRow>
            ) : (
              bookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.guestName}</div>
                    <div className="text-xs text-muted-foreground">{booking.guests} Guests</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{booking.phone}</div>
                    {booking.email && <div className="text-xs text-muted-foreground">{booking.email}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(booking.checkIn).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">to {new Date(booking.checkOut).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{booking.roomName || 'Any Room'}</div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={booking.status} 
                      onValueChange={(val) => handleStatusChange(booking.id, val as BookingStatusUpdateStatus)}
                    >
                      <SelectTrigger className={`h-8 w-32 text-xs uppercase tracking-wider font-medium rounded-sm border ${getStatusColor(booking.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}