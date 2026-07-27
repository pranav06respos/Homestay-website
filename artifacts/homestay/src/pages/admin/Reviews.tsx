import React from 'react';
import { useListReviews, useToggleReviewVisible, useCreateReview, useUpdateReview, useDeleteReview, Review } from '@workspace/api-client-react';
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
  const [editingItem, setEditingItem] = React.useState<Review | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleToggleVisible = async (id: number) => {
    try {
      await toggleVisible.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: "Visibility updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
        toast({ title: "Review deleted" });
      } catch {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    }
  };

  const openEdit = (item: Review) => {
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
          <h1 className="text-3xl font-serif text-primary">Reviews</h1>
          <p className="text-muted-foreground mt-2">Manage guest testimonials and ratings</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Review
        </Button>
      </div>

      <div className="bg-card rounded-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Source/Date</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : reviews?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No reviews found.</TableCell></TableRow>
            ) : (
              reviews?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.guestName}</TableCell>
                  <TableCell>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{item.reviewText}</TableCell>
                  <TableCell>
                    <div className="text-sm">{item.source || '-'}</div>
                    <div className="text-xs text-muted-foreground">{item.stayDate || '-'}</div>
                  </TableCell>
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

      <ReviewDialog item={editingItem} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}

function ReviewDialog({ item, open, onOpenChange }: { item: Review | null, open: boolean, onOpenChange: (open: boolean) => void }) {
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
    } else {
      form.reset({ guestName: '', rating: 5, reviewText: '', stayDate: '', source: '', isVisible: true });
    }
  }, [item, form, open]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      rating: parseInt(data.rating),
    };

    try {
      if (item) {
        await update.mutateAsync({ id: item.id, data: payload });
        toast({ title: "Review updated" });
      } else {
        await create.mutateAsync({ data: payload });
        toast({ title: "Review created" });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      onOpenChange(false);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{item ? 'Edit Review' : 'Add Review'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Guest Name</Label>
              <Input {...form.register('guestName')} required />
            </div>
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <Controller
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5,4,3,2,1].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Stars</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Review Text</Label>
            <Textarea {...form.register('reviewText')} rows={4} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stay Date (e.g. "October 2023")</Label>
              <Input {...form.register('stayDate')} />
            </div>
            <div className="space-y-2">
              <Label>Source (e.g. "Google", "Airbnb")</Label>
              <Input {...form.register('source')} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Switch 
                checked={form.watch('isVisible')} 
                onCheckedChange={(checked) => form.setValue('isVisible', checked)} 
              />
              <Label>Visible to Public</Label>
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