import React from 'react';
import { 
  useListMedia, useUploadMedia, useDeleteMedia, useUpdateMediaUsage, 
  useUpdateMedia, resolveMediaUrl, Media 
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Upload, Trash2, Edit, Search, Image as ImageIcon, Check, 
  X, Loader2, AlertCircle, UploadCloud, Layers
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

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
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);

  // Multi-file upload queue & drag-and-drop state
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadQueue, setUploadQueue] = React.useState<UploadItem[]>([]);
  const [isUploadingBatch, setIsUploadingBatch] = React.useState(false);
  const [showQueueCard, setShowQueueCard] = React.useState(false);

  // Process files selected via input or drop
  const handleFilesChosen = (files: FileList | File[]) => {
    const rawList = Array.from(files);
    const validImages = rawList.filter(f => f.type.startsWith('image/'));

    if (validImages.length === 0) {
      toast({
        title: "No valid images selected",
        description: "Please select image files (JPG, PNG, WEBP, GIF).",
        variant: "destructive",
      });
      return;
    }

    if (validImages.length < rawList.length) {
      toast({
        title: "Non-image files skipped",
        description: `${rawList.length - validImages.length} non-image file(s) were excluded.`,
      });
    }

    const newItems: UploadItem[] = validImages.map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
    }));

    setUploadQueue(prev => [...prev, ...newItems]);
    setShowQueueCard(true);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesChosen(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesChosen(e.dataTransfer.files);
    }
  };

  // Upload queue runner with managed concurrency
  React.useEffect(() => {
    const pendingItems = uploadQueue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0 || isUploadingBatch) return;

    let isMounted = true;
    setIsUploadingBatch(true);

    const runUploads = async () => {
      // Process in concurrent batches of 2 files
      const CONCURRENCY = 2;
      const queueCopy = [...pendingItems];

      while (queueCopy.length > 0 && isMounted) {
        const batch = queueCopy.splice(0, CONCURRENCY);

        await Promise.all(
          batch.map(async (item) => {
            setUploadQueue(prev =>
              prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q)
            );

            try {
              await upload.mutateAsync({ data: { file: item.file } });
              if (!isMounted) return;

              setUploadQueue(prev =>
                prev.map(q => q.id === item.id ? { ...q, status: 'success' } : q)
              );
              // Invalidate cache immediately so new images pop into the grid in real-time
              queryClient.invalidateQueries({ queryKey: ['/api/media'] });
            } catch (err) {
              if (!isMounted) return;
              const msg = err instanceof Error ? err.message : "Upload failed";
              setUploadQueue(prev =>
                prev.map(q => q.id === item.id ? { ...q, status: 'error', errorMessage: msg } : q)
              );
            }
          })
        );
      }

      if (isMounted) {
        setIsUploadingBatch(false);
        queryClient.invalidateQueries({ queryKey: ['/api/media'] });

        // Calculate summary for final notification
        setUploadQueue(currentQueue => {
          const successCount = currentQueue.filter(q => q.status === 'success').length;
          const errorCount = currentQueue.filter(q => q.status === 'error').length;
          if (successCount > 0 && errorCount === 0) {
            toast({
              title: "Uploads Complete",
              description: `Successfully uploaded ${successCount} picture${successCount > 1 ? 's' : ''} to the Media Library.`,
            });
          } else if (errorCount > 0) {
            toast({
              title: "Uploads Finished with Errors",
              description: `${successCount} uploaded successfully, ${errorCount} failed.`,
              variant: "destructive",
            });
          }
          return currentQueue;
        });
      }
    };

    runUploads();

    return () => {
      isMounted = false;
    };
  }, [uploadQueue, isUploadingBatch, upload, queryClient, toast]);

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

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (!confirm(`Are you sure you want to delete all ${ids.length} selected pictures? This action cannot be undone.`)) {
      return;
    }

    setIsBulkDeleting(true);
    let deletedCount = 0;
    let failedCount = 0;

    for (const id of ids) {
      try {
        await deleteMedia.mutateAsync({ id });
        deletedCount++;
      } catch {
        failedCount++;
      }
    }

    queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
    setSelectedIds(new Set());
    setIsBulkDeleting(false);

    if (deletedCount > 0) {
      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${deletedCount} picture${deletedCount > 1 ? 's' : ''}.${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
      });
    } else {
      toast({
        title: "Delete Failed",
        description: "Could not delete selected items.",
        variant: "destructive",
      });
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

  // Queue calculation
  const totalQueueCount = uploadQueue.length;
  const completedQueueCount = uploadQueue.filter(i => i.status === 'success' || i.status === 'error').length;
  const queuePercent = totalQueueCount > 0 ? Math.round((completedQueueCount / totalQueueCount) * 100) : 0;

  return (
    <div 
      className="space-y-8 relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Full-screen drag overlay when dragging files over window */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm border-4 border-dashed border-primary flex flex-col items-center justify-center p-8 pointer-events-none transition-all animate-in fade-in duration-200">
          <div className="bg-background/95 p-8 rounded-xl shadow-2xl border border-primary/40 flex flex-col items-center text-center max-w-md">
            <UploadCloud className="w-16 h-16 text-primary animate-bounce mb-3" />
            <h3 className="text-2xl font-serif text-primary font-medium">Drop Pictures Here</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Release to instantly queue and upload multiple pictures to your Media Library
            </p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Media Library</h1>
          <p className="text-muted-foreground mt-1">Manage and upload multiple images for rooms, gallery, and website hero</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInputChange} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploadingBatch} 
            className="gap-2 w-full sm:w-auto shadow-sm"
          >
            {isUploadingBatch ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading ({completedQueueCount}/{totalQueueCount})...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Multiple Pictures</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Drag & Drop Hero Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-primary bg-primary/10 shadow-md' 
            : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-card/60'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-base font-medium text-foreground">
            Click to browse or drag & drop multiple pictures here
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            Select multiple JPG, PNG, WEBP, or GIF files at once (up to 20MB each)
          </p>
        </div>
      </div>

      {/* Live Upload Progress Drawer Card */}
      {showQueueCard && uploadQueue.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isUploadingBatch ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
              <span className="font-medium text-sm">
                {isUploadingBatch 
                  ? `Uploading pictures: ${completedQueueCount} of ${totalQueueCount} completed (${queuePercent}%)` 
                  : `Batch upload finished: ${completedQueueCount} picture${completedQueueCount > 1 ? 's' : ''} processed`}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setShowQueueCard(false);
                if (!isUploadingBatch) setUploadQueue([]);
              }}
            >
              {isUploadingBatch ? 'Hide' : 'Dismiss'}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${queuePercent}%` }}
            />
          </div>

          {/* Individual items preview list (max 5 visible with scroll) */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-border/50 text-xs">
            {uploadQueue.map(item => (
              <div key={item.id} className="pt-1.5 flex items-center justify-between gap-3">
                <span className="truncate max-w-[280px] sm:max-w-md font-mono text-muted-foreground">{item.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground">{(item.size / 1024).toFixed(0)} KB</span>
                  {item.status === 'pending' && <span className="text-muted-foreground">Pending</span>}
                  {item.status === 'uploading' && (
                    <span className="text-primary flex items-center gap-1 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading
                    </span>
                  )}
                  {item.status === 'success' && (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-destructive flex items-center gap-1 font-medium" title={item.errorMessage}>
                      <AlertCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Bulk Selection Bar */}
      <div className="bg-card p-4 rounded-sm border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by filename..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between sm:justify-end gap-3 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-sm font-medium">
            <span>{selectedIds.size} selected</span>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-primary hover:bg-primary/20" 
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                disabled={isBulkDeleting}
                className="h-7 text-xs gap-1.5" 
                onClick={handleBulkDelete}
              >
                {isBulkDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete ({selectedIds.size})</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm"></div>)}
        </div>
      ) : mediaFiles?.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-sm bg-muted/20">
          <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif text-primary mb-2">No media found</h3>
          <p className="text-foreground/60 text-sm mb-4">Upload some pictures to get started.</p>
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="w-4 h-4" /> Choose Pictures
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mediaFiles?.map((media) => {
            const isSelected = selectedIds.has(media.id);
            return (
              <div 
                key={media.id} 
                className={`relative aspect-square group rounded-sm overflow-hidden border-2 transition-all ${
                  isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent bg-muted'
                }`}
              >
                <img 
                  src={resolveMediaUrl(media.url)} 
                  alt={media.altText || media.filename} 
                  className={`w-full h-full object-cover cursor-pointer ${isSelected ? 'opacity-90 scale-95 rounded-sm' : ''}`}
                  onClick={() => toggleSelect(media.id)}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80";
                  }}
                />
                
                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'hidden' : ''}`}>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="w-8 h-8 rounded-full" 
                    onClick={(e) => { e.stopPropagation(); setPreviewMedia(media); }}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="w-8 h-8 rounded-full" 
                    onClick={(e) => { e.stopPropagation(); handleDelete(media.id); }}
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
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

      {/* Media Details Dialog */}
      <MediaPreviewDialog 
        media={previewMedia} 
        open={!!previewMedia} 
        onOpenChange={(v) => !v && setPreviewMedia(null)}
        onDelete={() => previewMedia && handleDelete(previewMedia.id)}
      />
    </div>
  );
}

const Eye = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
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
            <img 
              src={resolveMediaUrl(media.url)} 
              alt={media.altText || ''} 
              className="max-w-full max-h-full object-contain drop-shadow-md" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
              }}
            />
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