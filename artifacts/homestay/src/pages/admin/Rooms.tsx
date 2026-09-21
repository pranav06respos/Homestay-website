import React from 'react';
import { 
  useListRooms, useToggleRoomAvailable, useToggleRoomVisible, 
  useDeleteRoom, useCreateRoom, useUpdateRoom, Room, resolveMediaUrl, customFetch 
} from '@workspace/api-client-react';
import { Link } from 'wouter';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, BedDouble, 
  Image as ImageIcon, GripVertical, ArrowUp, ArrowDown, Loader2 
} from 'lucide-react';
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

  const [orderedRooms, setOrderedRooms] = React.useState<Room[]>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [isReordering, setIsReordering] = React.useState(false);

  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Sync ordered rooms from backend query
  React.useEffect(() => {
    if (rooms) {
      const sorted = [...rooms].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setOrderedRooms(sorted);
    }
  }, [rooms]);

  const saveOrder = async (newRooms: Room[]) => {
    setOrderedRooms(newRooms);
    const items = newRooms.map((r, i) => ({ id: r.id, sortOrder: i }));
    setIsReordering(true);
    try {
      await customFetch('/api/rooms/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      // Update local storage so live visitor views reflect reordered rooms immediately
      try {
        localStorage.setItem('nkh_cached_rooms', JSON.stringify(newRooms));
      } catch {}
      toast({ title: "Room order updated!" });
    } catch {
      toast({ title: "Failed to save room order", variant: "destructive" });
    } finally {
      setIsReordering(false);
    }
  };

  const moveRoom = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === orderedRooms.length - 1)
    ) return;

    const newRooms = [...orderedRooms];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newRooms[index], newRooms[targetIndex]] = [newRooms[targetIndex], newRooms[index]];
    saveOrder(newRooms);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const newRooms = [...orderedRooms];
    const [moved] = newRooms.splice(draggedIndex, 1);
    newRooms.splice(targetIndex, 0, moved);
    setDraggedIndex(null);
    saveOrder(newRooms);
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Rooms</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Drag any room row up or down to reorder, or use the arrow buttons. The website displays rooms in this exact order.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isReordering && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving order...
            </span>
          )}
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Room
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 text-center">Order</TableHead>
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
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading rooms...</TableCell></TableRow>
            ) : orderedRooms.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No rooms found.</TableCell></TableRow>
            ) : (
              orderedRooms.map((room, index) => {
                const isOver = dragOverIndex === index;
                const isDragging = draggedIndex === index;

                return (
                  <TableRow 
                    key={room.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`transition-all select-none ${
                      isOver ? 'bg-primary/10 border-t-2 border-primary' : ''
                    } ${isDragging ? 'opacity-40' : ''}`}
                  >
                    {/* Reorder Handle & Up/Down Buttons */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div 
                          className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Drag up or down to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveRoom(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
                            title="Move room up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveRoom(index, 'down')}
                            disabled={index === orderedRooms.length - 1}
                            className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
                            title="Move room down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="w-16 h-12 bg-muted rounded-md overflow-hidden flex items-center justify-center shadow-xs">
                        {room.coverImageUrl ? (
                          <img 
                            src={resolveMediaUrl(room.coverImageUrl)} 
                            alt={room.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-foreground">{room.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {room.maxGuests} max</span>
                        <span>•</span>
                        <span>{room.bedType}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {room.pricePerNight ? <span className="font-medium">₹{room.pricePerNight}</span> : '-'}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={room.isAvailable} 
                          onCheckedChange={() => handleToggleAvailable(room.id)} 
                        />
                        <span className="text-xs font-medium">{room.isAvailable ? 'Available' : 'Booked'}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => handleToggleVisible(room.id)}>
                          {room.isVisible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <span className="text-xs text-muted-foreground">{room.isVisible ? 'Public' : 'Hidden'}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/rooms/${room.id}/images`}>
                          <Button variant="outline" size="sm" title="Manage Photos">
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
                );
              })
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

  const onSubmit = async (data: any) => {
    const rawSlug = data.slug?.trim() || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = rawSlug || `room-${Date.now()}`;
    const payload = {
      name: data.name,
      slug,
      description: data.description,
      shortDescription: data.shortDescription,
      pricePerNight: data.pricePerNight ? parseInt(data.pricePerNight) : null,
      maxGuests: parseInt(data.maxGuests),
      bedType: data.bedType,
      amenities: data.amenities.split(',').map((s: string) => s.trim()).filter(Boolean),
      sortOrder: parseInt(data.sortOrder) || 0
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {room ? 'Edit Room' : 'Add New Room'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input {...form.register('name', { required: true })} placeholder="e.g. Deluxe Suite" />
            </div>
            <div className="space-y-2">
              <Label>Price Per Night (₹)</Label>
              <Input type="number" {...form.register('pricePerNight')} placeholder="e.g. 3500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Guests</Label>
              <Input type="number" {...form.register('maxGuests')} />
            </div>
            <div className="space-y-2">
              <Label>Bed Type</Label>
              <Input {...form.register('bedType')} placeholder="e.g. King Bed" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Short Description (Shown on cards)</Label>
            <Input {...form.register('shortDescription', { required: true })} placeholder="Brief summary of the room" />
          </div>

          <div className="space-y-2">
            <Label>Full Description</Label>
            <Textarea {...form.register('description', { required: true })} rows={4} placeholder="Detailed room overview" />
          </div>

          <div className="space-y-2">
            <Label>Amenities (comma separated)</Label>
            <Input {...form.register('amenities')} placeholder="Valley View, WiFi, Private Balcony, Electric Kettle" />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}