import React from 'react';
import { useLocation, useParams } from 'wouter';
import { 
  useGetRoom, useListRoomImages, useSetRoomCoverImage, 
  useRemoveRoomImage, useAddRoomImage, useUploadMedia, useListMedia, resolveMediaUrl 
} from '@workspace/api-client-react';
import { compressImage } from '@/lib/imageCompression';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Trash2, Star, Check, Search, ChevronLeft, Upload, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';

export default function RoomImages() {
  const { id } = useParams();
  const roomId = parseInt(id || '0', 10);
  
  const { data: room, isLoading: isLoadingRoom } = useGetRoom(roomId, {
    query: { enabled: !!roomId, queryKey: ['/api/rooms', roomId] },
  });
  const { data: images, isLoading: isLoadingImages } = useListRoomImages(roomId, {
    query: { enabled: !!roomId, queryKey: ['/api/rooms', roomId, 'images'] },
  });
  
  const setCover = useSetRoomCoverImage();
  const removeImage = useRemoveRoomImage();
  const addRoomImage = useAddRoomImage();
  const upload = useUploadMedia();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMediaPickerOpen, setIsMediaPickerOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const sortedImages = [...(images || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleDirectFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast({ title: "Please select valid image files", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    try {
      // Fast parallel processing with concurrency of 3
      const CONCURRENCY = 3;
      const queue = [...imageFiles];
      while (queue.length > 0) {
        const batch = queue.splice(0, CONCURRENCY);
        await Promise.all(
          batch.map(async (file) => {
            const compressed = await compressImage(file);
            const media = await upload.mutateAsync({ data: { file: compressed } });
            const mediaId = (media as any)?.id;
            if (mediaId) {
              await addRoomImage.mutateAsync({
                id: roomId,
                data: { mediaId, isCover: false, sortOrder: 999 }
              });
              successCount++;
            }
          })
        );
      }
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId, 'images'] });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/images`] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: `Added ${successCount} photo${successCount > 1 ? 's' : ''} to ${room?.name || 'room'}!` });
    } catch (err) {
      toast({ title: "Failed to upload some photos", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  const handleSetCover = async (imageId: number) => {
    try {
      await setCover.mutateAsync({ id: roomId, imageId });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId] });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/images`] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: "Cover image updated" });
    } catch {
      toast({ title: "Failed to update cover", variant: "destructive" });
    }
  };

  const handleRemove = async (imageId: number) => {
    if (confirm("Remove this image from the room?")) {
      try {
        await removeImage.mutateAsync({ id: roomId, imageId });
        queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/images`] });
        toast({ title: "Removed from room" });
      } catch {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    }
  };

  if (isLoadingRoom) return <div className="p-8">Loading room details...</div>;
  if (!room) return <div className="p-8">Room not found.</div>;

  return (
    <div className="space-y-8">
      <Link href="/admin/rooms" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Rooms
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Manage Images: {room.name}</h1>
          <p className="text-muted-foreground mt-2">Photos here will ONLY display for this room.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input 
            type="file" 
            ref={uploadInputRef} 
            onChange={(e) => handleDirectFiles(e.target.files)} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
          <Button 
            onClick={() => uploadInputRef.current?.click()} 
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Uploading Fast..." : "Upload Photos to Room"}
          </Button>
          <Button variant="outline" onClick={() => setIsMediaPickerOpen(true)} className="gap-2">
            <ImagePlus className="w-4 h-4" /> Pick from Media Library
          </Button>
        </div>
      </div>

      {isLoadingImages ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm"></div>)}
        </div>
      ) : sortedImages.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-sm bg-muted/20 px-4">
          <ImagePlus className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif text-primary mb-2">No photos in {room.name} yet</h3>
          <p className="text-foreground/60 mb-6 max-w-md mx-auto">
            Upload photos directly to this room, or select existing ones from your media library.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => uploadInputRef.current?.click()} disabled={isUploading} className="gap-2">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? "Uploading..." : "Upload Photos Directly"}
            </Button>
            <Button onClick={() => setIsMediaPickerOpen(true)} variant="outline">Browse Media Library</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedImages.map((image) => (
            <div key={image.id} className="bg-card border border-border rounded-sm overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-muted relative group">
                <img 
                  src={resolveMediaUrl(image.url)} 
                  alt={image.altText || ''} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80";
                  }}
                />
                
                {image.isCover && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-medium uppercase tracking-wider rounded-sm shadow-sm flex items-center">
                    <Star className="w-3 h-3 fill-current mr-1" /> Cover
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant={image.isCover ? "secondary" : "outline"} 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleSetCover(image.id)}
                    disabled={image.isCover}
                  >
                    {image.isCover ? 'Current Cover' : 'Set as Cover'}
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemove(image.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RoomMediaPickerDialog 
        roomId={roomId}
        open={isMediaPickerOpen} 
        onOpenChange={setIsMediaPickerOpen} 
        existingMediaIds={sortedImages.map(i => i.mediaId)}
      />
    </div>
  );
}

function RoomMediaPickerDialog({ roomId, open, onOpenChange, existingMediaIds }: { roomId: number, open: boolean, onOpenChange: (open: boolean) => void, existingMediaIds: number[] }) {
  const [search, setSearch] = React.useState('');
  const { data: mediaFiles, isLoading } = useListMedia({ search });
  const addRoomImage = useAddRoomImage();
  const upload = useUploadMedia();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [isUploadingPicker, setIsUploadingPicker] = React.useState(false);
  const pickerInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [open]);

  const handlePickerFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setIsUploadingPicker(true);
    let successCount = 0;
    try {
      const CONCURRENCY = 3;
      const queue = [...imageFiles];
      while (queue.length > 0) {
        const batch = queue.splice(0, CONCURRENCY);
        await Promise.all(
          batch.map(async (file) => {
            const compressed = await compressImage(file);
            const media = await upload.mutateAsync({ data: { file: compressed } });
            const mediaId = (media as any)?.id;
            if (mediaId) {
              await addRoomImage.mutateAsync({
                id: roomId,
                data: { mediaId, isCover: false, sortOrder: 999 }
              });
              successCount++;
            }
          })
        );
      }
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId, 'images'] });
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/images`] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: `Uploaded & added ${successCount} photos directly to room!` });
      onOpenChange(false);
    } catch {
      toast({ title: "Failed to upload photos", variant: "destructive" });
    } finally {
      setIsUploadingPicker(false);
      if (pickerInputRef.current) pickerInputRef.current.value = '';
    }
  };

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
        addRoomImage.mutateAsync({ id: roomId, data: { mediaId, isCover: false, sortOrder: 999 } })
      );
      
      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/images`] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms', roomId, 'images'] });
      toast({ title: `Added ${selectedIds.size} images to room` });
      onOpenChange(false);
    } catch {
      toast({ title: "Failed to add some images", variant: "destructive" });
    }
  };

  const availableMedia = mediaFiles?.filter(m => !existingMediaIds.includes(m.id)) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between pr-6">
          <DialogTitle className="font-serif text-2xl">Select Media</DialogTitle>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={pickerInputRef} 
              onChange={(e) => handlePickerFiles(e.target.files)} 
              multiple 
              accept="image/*" 
              className="hidden" 
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => pickerInputRef.current?.click()} 
              disabled={isUploadingPicker}
              className="gap-2"
            >
              {isUploadingPicker ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {isUploadingPicker ? "Uploading..." : "Upload New File(s)"}
            </Button>
          </div>
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
                    <img 
                      src={resolveMediaUrl(media.url)} 
                      alt="" 
                      className={`w-full h-full object-cover ${isSelected ? 'opacity-80' : ''}`} 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
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
              <Button onClick={handleAdd} disabled={selectedIds.size === 0 || addRoomImage.isPending}>
                Add to Room
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}