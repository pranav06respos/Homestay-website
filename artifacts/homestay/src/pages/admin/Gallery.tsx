import React from 'react';
import { 
  useListGallery, useAddGalleryItem, useUpdateGalleryItem, 
  useDeleteGalleryItem, useReorderGallery, useListMedia 
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Trash2, GripVertical, Star, Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';

export default function GalleryManager() {
  const { data: galleryItems, isLoading } = useListGallery({ admin: 'true' });
  const updateItem = useUpdateGalleryItem();
  const deleteItem = useDeleteGalleryItem();
  const reorder = useReorderGallery();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isMediaPickerOpen, setIsMediaPickerOpen] = React.useState(false);
  
  const sortedItems = [...(galleryItems || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleToggleVisible = async (id: number, current: boolean) => {
    try {
      await updateItem.mutateAsync({ id, data: { isVisible: !current } });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({ title: "Visibility updated" });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleToggleFeatured = async (id: number, current: boolean) => {
    try {
      await updateItem.mutateAsync({ id, data: { isFeatured: !current } });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({ title: "Featured status updated" });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Remove this image from the gallery?")) {
      try {
        await deleteItem.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
        toast({ title: "Removed from gallery" });
      } catch {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === sortedItems.length - 1)
    ) return;

    const newItems = [...sortedItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    const payload = newItems.map((item, idx) => ({ id: item.id, sortOrder: idx }));
    
    try {
      await reorder.mutateAsync({ data: { items: payload } });
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
    } catch {
      toast({ title: "Failed to reorder", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-primary">Gallery Manager</h1>
          <p className="text-muted-foreground mt-2">Manage the public property gallery</p>
        </div>
        <Button onClick={() => setIsMediaPickerOpen(true)} className="gap-2">
          <ImagePlus className="w-4 h-4" /> Add to Gallery
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm"></div>)}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-border rounded-sm bg-muted/20">
          <ImagePlus className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif text-primary mb-2">Gallery is empty</h3>
          <p className="text-foreground/60 mb-6">Select images from your media library to display them.</p>
          <Button onClick={() => setIsMediaPickerOpen(true)} variant="outline">Browse Media Library</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedItems.map((item, index) => (
            <div key={item.id} className="bg-card border border-border rounded-sm overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-muted relative group">
                <img src={item.url} alt={item.altText || 'Gallery image'} className="w-full h-full object-cover" />
                
                {item.isFeatured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1.5 rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                    ↑
                  </Button>
                  <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full" onClick={() => moveItem(index, 'down')} disabled={index === sortedItems.length - 1}>
                    ↓
                  </Button>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visible</span>
                  <Switch checked={item.isVisible} onCheckedChange={() => handleToggleVisible(item.id, item.isVisible)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Featured</span>
                  <Switch checked={item.isFeatured} onCheckedChange={() => handleToggleFeatured(item.id, item.isFeatured)} />
                </div>
                <div className="mt-auto pt-4 border-t border-border flex justify-end">
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPickerDialog 
        open={isMediaPickerOpen} 
        onOpenChange={setIsMediaPickerOpen} 
        existingMediaIds={sortedItems.map(i => i.mediaId)}
      />
    </div>
  );
}

function MediaPickerDialog({ open, onOpenChange, existingMediaIds }: { open: boolean, onOpenChange: (open: boolean) => void, existingMediaIds: number[] }) {
  const [search, setSearch] = React.useState('');
  const { data: mediaFiles, isLoading } = useListMedia({ search });
  const addGalleryItem = useAddGalleryItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [open]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    try {
      const promises = Array.from(selectedIds).map(mediaId => 
        addGalleryItem.mutateAsync({ data: { mediaId, isVisible: true, isFeatured: false, sortOrder: 999 } })
      );
      
      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({ title: `Added ${selectedIds.size} images to gallery` });
      onOpenChange(false);
    } catch {
      toast({ title: "Failed to add some images", variant: "destructive" });
    }
  };

  const availableMedia = mediaFiles?.filter(m => !existingMediaIds.includes(m.id)) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Select Media</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by filename..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] border border-border p-4 rounded-sm bg-muted/10">
          {isLoading ? (
            <div className="text-center py-12">Loading media...</div>
          ) : availableMedia.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {search ? 'No matches found.' : 'No new media available. Upload some in the Media Library.'}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {availableMedia.map(media => {
                const isSelected = selectedIds.has(media.id);
                return (
                  <div 
                    key={media.id} 
                    className={`relative aspect-square cursor-pointer border-2 rounded-sm overflow-hidden ${isSelected ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                    onClick={() => toggleSelect(media.id)}
                  >
                    <img src={media.url} alt="" className={`w-full h-full object-cover ${isSelected ? 'opacity-80' : ''}`} />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t border-border pt-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={selectedIds.size === 0 || addGalleryItem.isPending}>
                Add to Gallery
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}