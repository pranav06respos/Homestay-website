import React from 'react';
import { 
  useListGallery, useAddGalleryItem, useUpdateGalleryItem, 
  useDeleteGalleryItem, useReorderGallery, useUploadMedia, useDeleteMedia, resolveMediaUrl 
} from '@workspace/api-client-react';
import { compressImage } from '@/lib/imageCompression';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Star, Loader2, ImagePlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function GalleryManager() {
  const { data: galleryItems, isLoading } = useListGallery({ admin: 'true' });
  const updateItem = useUpdateGalleryItem();
  const deleteItem = useDeleteGalleryItem();
  const deleteMedia = useDeleteMedia();
  const addGalleryItem = useAddGalleryItem();
  const uploadMedia = useUploadMedia();
  const reorder = useReorderGallery();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; mediaId: number } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sortedItems = [...(galleryItems || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDirectUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast({ title: "Please select valid image files", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    try {
      const CONCURRENCY = 3;
      const queue = [...imageFiles];
      while (queue.length > 0) {
        const batch = queue.splice(0, CONCURRENCY);
        await Promise.all(
          batch.map(async (file) => {
            const compressed = await compressImage(file);
            const media = await uploadMedia.mutateAsync({ data: { file: compressed } });
            const mediaId = (media as any)?.id;
            if (mediaId) {
              await addGalleryItem.mutateAsync({
                data: { mediaId, isVisible: true, isFeatured: false, sortOrder: 999 }
              });
              successCount++;
            }
          })
        );
      }
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({ title: `Added ${successCount} photo${successCount > 1 ? 's' : ''} to Gallery!` });
    } catch {
      toast({ title: "Failed to upload some photos", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem.mutateAsync({ id: deleteTarget.id });
      if (deleteTarget.mediaId) {
        try {
          await deleteMedia.mutateAsync({ id: deleteTarget.mediaId });
        } catch {
          // Media deletion may fail silently if referenced elsewhere
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({ title: "Photo removed from gallery" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Gallery Manager</h1>
          <p className="text-muted-foreground mt-2">
            Upload photos directly to the public website gallery. Photos uploaded here will ONLY show on the Gallery and will not affect room pictures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleDirectUpload(e.target.files)} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "Upload Photos to Gallery"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm"></div>)}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-border rounded-sm bg-muted/20 px-4">
          <ImagePlus className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif text-primary mb-2">Gallery is empty</h3>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            Upload photos directly from your phone or computer to showcase your homestay in the website gallery.
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading} 
            className="gap-2"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "Upload Photos to Gallery"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedItems.map((item, index) => (
            <div key={item.id} className="bg-card border border-border rounded-sm overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-muted relative group">
                <img 
                  src={resolveMediaUrl(item.url)} 
                  alt={item.altText || 'Gallery image'} 
                  className="w-full h-full object-cover" 
                />
                
                {item.isFeatured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1.5 rounded-full shadow-sm" title="Featured on Homepage">
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
                  <div>
                    <span className="text-sm font-medium">Featured on Home</span>
                    <p className="text-[11px] text-muted-foreground">Showcase on website homepage</p>
                  </div>
                  <Switch checked={item.isFeatured} onCheckedChange={() => handleToggleFeatured(item.id, item.isFeatured)} />
                </div>
                <div className="mt-auto pt-4 border-t border-border flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                    onClick={() => setDeleteTarget({ id: item.id, mediaId: item.mediaId })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Delete Gallery Photo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground my-3 leading-relaxed">
            Are you sure you want to remove this photo from the website gallery?
          </p>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}