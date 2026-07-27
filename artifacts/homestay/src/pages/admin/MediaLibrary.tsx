import React from 'react';
import { useListMedia, useUploadMedia, useDeleteMedia, useUpdateMediaUsage, useUpdateMedia, Media } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Edit, Search, Image as ImageIcon, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function MediaLibrary() {
  const [search, setSearch] = React.useState('');
  const { data: mediaFiles, isLoading } = useListMedia({ search });
  const upload = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const updateMedia = useUpdateMedia();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [previewMedia, setPreviewMedia] = React.useState<Media | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Need to cast to any for FormData usage with orval mutation
      const formData = new FormData();
      formData.append('file', file);
      
      await upload.mutateAsync({ data: formData as any });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Media uploaded successfully" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this file? It will be removed from all associated uses.")) {
      try {
        await deleteMedia.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ['/api/media'] });
        queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setPreviewMedia(null);
        toast({ title: "Media deleted" });
      } catch {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-primary">Media Library</h1>
          <p className="text-muted-foreground mt-2">Manage all images and files</p>
        </div>
        <div className="flex gap-4">
          <Input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept="image/*"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={upload.isPending} className="gap-2">
            <Upload className="w-4 h-4" /> {upload.isPending ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-sm border border-border flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by filename..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-4 text-sm bg-primary/10 text-primary px-4 py-2 rounded-sm font-medium">
            <span>{selectedIds.size} selected</span>
            <Button variant="ghost" size="sm" className="h-6 text-primary hover:bg-primary/20" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm"></div>)}
        </div>
      ) : mediaFiles?.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-border rounded-sm bg-muted/20">
          <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif text-primary mb-2">No media found</h3>
          <p className="text-foreground/60">Upload some images to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mediaFiles?.map((media) => {
            const isSelected = selectedIds.has(media.id);
            return (
              <div 
                key={media.id} 
                className={`relative aspect-square group rounded-sm overflow-hidden border-2 transition-all ${
                  isSelected ? 'border-primary' : 'border-transparent bg-muted'
                }`}
              >
                <img 
                  src={media.url} 
                  alt={media.altText || media.filename} 
                  className={`w-full h-full object-cover cursor-pointer ${isSelected ? 'opacity-90 scale-95 rounded-sm' : ''}`}
                  onClick={() => toggleSelect(media.id)}
                />
                
                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'hidden' : ''}`}>
                  <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full" onClick={(e) => { e.stopPropagation(); setPreviewMedia(media); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* File info bar */}
                <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[10px] truncate px-2 py-1 backdrop-blur-sm">
                  {media.originalName}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MediaPreviewDialog 
        media={previewMedia} 
        open={!!previewMedia} 
        onOpenChange={(v) => !v && setPreviewMedia(null)}
        onDelete={() => previewMedia && handleDelete(previewMedia.id)}
      />
    </div>
  );
}

// Temporary inline Eye icon component since it wasn't imported in the main file
const Eye = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

function MediaPreviewDialog({ media, open, onOpenChange, onDelete }: { media: Media | null, open: boolean, onOpenChange: (open: boolean) => void, onDelete: () => void }) {
  const updateMedia = useUpdateMedia();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [altText, setAltText] = React.useState('');

  React.useEffect(() => {
    if (media) setAltText(media.altText || '');
  }, [media]);

  const handleSave = async () => {
    if (!media) return;
    try {
      await updateMedia.mutateAsync({ id: media.id, data: { altText } });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({ title: "Media updated" });
      onOpenChange(false);
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  if (!media) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
        <div className="flex flex-col md:flex-row h-[70vh]">
          <div className="w-full md:w-2/3 bg-muted/30 flex items-center justify-center p-4 border-r border-border">
            <img src={media.url} alt={media.altText || ''} className="max-w-full max-h-full object-contain drop-shadow-md" />
          </div>
          <div className="w-full md:w-1/3 p-6 flex flex-col bg-card">
            <DialogHeader className="mb-6">
              <DialogTitle className="font-serif">Media Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 flex-1">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Filename</p>
                <p className="text-sm font-mono break-all">{media.originalName}</p>
              </div>
              
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm">{media.mimeType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Size</p>
                  <p className="text-sm">{(media.sizeBytes / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Used In</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {media.usedIn.length > 0 ? (
                    media.usedIn.map((use, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-sm">{use}</span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Not used anywhere</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Label>Alt Text (for accessibility)</Label>
                <Input 
                  value={altText} 
                  onChange={(e) => setAltText(e.target.value)} 
                  className="mt-2"
                  placeholder="Describe the image..."
                />
              </div>
            </div>

            <DialogFooter className="mt-8 flex justify-between sm:justify-between items-center">
              <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                <Button onClick={handleSave} disabled={updateMedia.isPending}>Save</Button>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}