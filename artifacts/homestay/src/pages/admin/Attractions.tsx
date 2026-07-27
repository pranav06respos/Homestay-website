import React from 'react';
import { useListAttractions, useToggleAttractionVisible, useCreateAttraction, useUpdateAttraction, useDeleteAttraction, Attraction } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

export default function Attractions() {
  const { data: attractions, isLoading } = useListAttractions({ admin: 'true' });
  const toggleVisible = useToggleAttractionVisible();
  const deleteAttraction = useDeleteAttraction();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = React.useState<Attraction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleToggleVisible = async (id: number) => {
    try {
      await toggleVisible.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
      toast({ title: "Visibility updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this attraction?")) {
      try {
        await deleteAttraction.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
        toast({ title: "Attraction deleted" });
      } catch {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    }
  };

  const openEdit = (item: Attraction) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-primary">Attractions</h1>
          <p className="text-muted-foreground mt-2">Manage nearby places of interest</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Attraction
        </Button>
      </div>

      <div className="bg-card rounded-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : attractions?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No attractions found.</TableCell></TableRow>
            ) : (
              attractions?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.distance || '-'}</TableCell>
                  <TableCell>{item.duration || '-'}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={item.isVisible} 
                        onCheckedChange={() => handleToggleVisible(item.id)} 
                      />
                      <span className="text-sm">{item.isVisible ? 'Visible' : 'Hidden'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
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

      <AttractionDialog item={editingItem} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}

function AttractionDialog({ item, open, onOpenChange }: { item: Attraction | null, open: boolean, onOpenChange: (open: boolean) => void }) {
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
    } else {
      form.reset({ name: '', distance: '', duration: '', description: '', sortOrder: 0, isVisible: true });
    }
  }, [item, form, open]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      sortOrder: parseInt(data.sortOrder),
    };

    try {
      if (item) {
        await update.mutateAsync({ id: item.id, data: payload });
        toast({ title: "Attraction updated" });
      } else {
        await create.mutateAsync({ data: payload });
        toast({ title: "Attraction created" });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
      onOpenChange(false);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{item ? 'Edit Attraction' : 'Add Attraction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Distance (e.g. "1.5 km")</Label>
              <Input {...form.register('distance')} />
            </div>
            <div className="space-y-2">
              <Label>Duration (e.g. "15 mins drive")</Label>
              <Input {...form.register('duration')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...form.register('description')} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" {...form.register('sortOrder')} />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <Switch 
                  checked={form.watch('isVisible')} 
                  onCheckedChange={(checked) => form.setValue('isVisible', checked)} 
                />
                <Label>Visible to Public</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}