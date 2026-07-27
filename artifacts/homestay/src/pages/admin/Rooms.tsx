import React from 'react';
import { useListRooms, useToggleRoomAvailable, useToggleRoomVisible, useDeleteRoom, useCreateRoom, useUpdateRoom, Room } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Plus, Edit, Trash2, Eye, EyeOff, BedDouble, Check, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

export default function Rooms() {
  const { data: rooms, isLoading } = useListRooms({ admin: 'true' });
  const toggleAvailable = useToggleRoomAvailable();
  const toggleVisible = useToggleRoomVisible();
  const deleteRoom = useDeleteRoom();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleToggleAvailable = async (id: number) => {
    try {
      await toggleAvailable.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: "Availability updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleToggleVisible = async (id: number) => {
    try {
      await toggleVisible.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: "Visibility updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this room? This cannot be undone.")) {
      try {
        await deleteRoom.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
        toast({ title: "Room deleted" });
      } catch {
        toast({ title: "Failed to delete room", variant: "destructive" });
      }
    }
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingRoom(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-primary">Rooms</h1>
          <p className="text-muted-foreground mt-2">Manage property rooms and accommodations</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Room
        </Button>
      </div>

      <div className="bg-card rounded-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Price / Night</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : rooms?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No rooms found.</TableCell></TableRow>
            ) : (
              rooms?.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <div className="w-16 h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                      {room.coverImageUrl ? (
                        <img src={room.coverImageUrl} alt={room.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{room.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {room.maxGuests} max</span>
                      <span>•</span>
                      <span>{room.bedType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {room.pricePerNight ? `₹${room.pricePerNight}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={room.isAvailable} 
                        onCheckedChange={() => handleToggleAvailable(room.id)} 
                      />
                      <span className="text-sm">{room.isAvailable ? 'Available' : 'Booked'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => handleToggleVisible(room.id)}>
                        {room.isVisible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                      <span className="text-sm text-muted-foreground">{room.isVisible ? 'Public' : 'Hidden'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/rooms/${room.id}/images`}>
                        <Button variant="outline" size="sm" title="Manage Images">
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => openEdit(room)} title="Edit Room">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(room.id)} className="text-destructive hover:text-destructive" title="Delete Room">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RoomDialog 
        room={editingRoom} 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
}

function RoomDialog({ room, open, onOpenChange }: { room: Room | null, open: boolean, onOpenChange: (open: boolean) => void }) {
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
    } else {
      form.reset({
        name: '', slug: '', description: '', shortDescription: '', pricePerNight: '', maxGuests: 2, bedType: '', amenities: '', sortOrder: 0
      });
    }
  }, [room, form, open]);

  const generateSlug = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    form.setValue('slug', slug);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      pricePerNight: data.pricePerNight ? parseInt(data.pricePerNight) : null,
      maxGuests: parseInt(data.maxGuests),
      bedType: data.bedType,
      amenities: data.amenities.split(',').map((s: string) => s.trim()).filter(Boolean),
      sortOrder: parseInt(data.sortOrder)
    };

    try {
      if (room) {
        await updateRoom.mutateAsync({ id: room.id, data: payload });
        toast({ title: "Room updated" });
      } else {
        await createRoom.mutateAsync({ data: payload });
        toast({ title: "Room created" });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      onOpenChange(false);
    } catch {
      toast({ title: "Failed to save room", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input {...form.register('name')} onChange={(e) => {
                form.register('name').onChange(e);
                if (!room) generateSlug(e.target.value);
              }} />
            </div>
            <div className="space-y-2">
              <Label>URL Slug</Label>
              <Input {...form.register('slug')} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price per Night (₹)</Label>
              <Input type="number" {...form.register('pricePerNight')} />
            </div>
            <div className="space-y-2">
              <Label>Max Guests</Label>
              <Input type="number" {...form.register('maxGuests')} />
            </div>
            <div className="space-y-2">
              <Label>Bed Type (e.g. King Size)</Label>
              <Input {...form.register('bedType')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Short Description (for list view)</Label>
            <Textarea {...form.register('shortDescription')} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Full Description</Label>
            <Textarea {...form.register('description')} rows={5} />
          </div>

          <div className="space-y-2">
            <Label>Amenities (comma separated)</Label>
            <Input {...form.register('amenities')} placeholder="Free WiFi, Mountain View, TV, Heater" />
          </div>

          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input type="number" {...form.register('sortOrder')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createRoom.isPending || updateRoom.isPending}>
              {room ? 'Save Changes' : 'Create Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}