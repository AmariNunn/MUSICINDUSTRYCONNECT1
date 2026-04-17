import { useState, useRef, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { GalleryPostWithItems } from "@shared/schema";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_ITEMS = 10;

type DraftItem = {
  id: string;
  file: File;
  dataUrl: string;
  mediaType: "image" | "video";
};

interface ProfileGalleryProps {
  profileUserId: number;
  isOwner: boolean;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function GalleryCarousel({ post }: { post: GalleryPostWithItems }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (i: number) => emblaApi?.scrollTo(i);

  const items = post.items;
  const multi = items.length > 1;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg bg-black" ref={emblaRef}>
        <div className="flex">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative flex-[0_0_100%] min-w-0 flex items-center justify-center"
              style={{ aspectRatio: "4 / 3" }}
              data-testid={`gallery-item-${item.id}`}
            >
              {item.mediaType === "video" ? (
                <video
                  src={item.mediaUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={item.mediaUrl}
                  alt=""
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {multi && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={selectedIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:opacity-30 text-white rounded-full p-2"
            aria-label="Previous"
            data-testid={`button-carousel-prev-${post.id}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={selectedIndex === items.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 disabled:opacity-30 text-white rounded-full p-2"
            aria-label="Next"
            data-testid={`button-carousel-next-${post.id}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === selectedIndex ? "bg-white w-4" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
                data-testid={`dot-carousel-${post.id}-${i}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ProfileGallery({ profileUserId, isOwner }: ProfileGalleryProps) {
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: posts = [], isLoading } = useQuery<GalleryPostWithItems[]>({
    queryKey: ["/api/gallery", profileUserId],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const items = drafts.map((d, idx) => ({
        mediaUrl: d.dataUrl,
        mediaType: d.mediaType,
        orderIndex: idx,
      }));
      const res = await apiRequest("POST", "/api/gallery", {
        userId: profileUserId,
        caption: caption.trim(),
        items,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery", profileUserId] });
      setDrafts([]);
      setCaption("");
      setUploadOpen(false);
      toast({ title: "Posted to gallery!" });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/gallery/${postId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery", profileUserId] });
      toast({ title: "Post deleted" });
    },
    onError: () => {
      toast({ title: "Delete failed", variant: "destructive" });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const remaining = MAX_ITEMS - drafts.length;
    if (files.length > remaining) {
      toast({
        title: `Limit is ${MAX_ITEMS} items per post`,
        description: `${files.length - remaining} file(s) skipped.`,
        variant: "destructive",
      });
    }

    const accepted: DraftItem[] = [];
    for (const file of files.slice(0, remaining)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        toast({
          title: "Unsupported file",
          description: `${file.name} isn't a photo or video.`,
          variant: "destructive",
        });
        continue;
      }
      const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (file.size > limit) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${isVideo ? "50MB" : "10MB"} limit.`,
          variant: "destructive",
        });
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        accepted.push({
          id: `${file.name}-${file.size}-${Math.random()}`,
          file,
          dataUrl,
          mediaType: isVideo ? "video" : "image",
        });
      } catch {
        toast({ title: "Failed to read", description: file.name, variant: "destructive" });
      }
    }
    if (accepted.length > 0) setDrafts((prev) => [...prev, ...accepted]);
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const moveDraft = (id: string, dir: -1 | 1) => {
    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: "-0.01em" }}>
              Gallery
            </h2>
            <p className="text-sm text-gray-500">Photos & videos</p>
          </div>
          {isOwner && (
            <Button
              onClick={() => setUploadOpen(true)}
              className="bg-[#c084fc] hover:bg-[#a855f7] text-white"
              data-testid="button-add-gallery-post"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Gallery
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading gallery…
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No gallery posts yet</p>
            {isOwner && (
              <p className="text-sm mt-1">Share photos and short clips of your work.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                data-testid={`gallery-post-${post.id}`}
              >
                <GalleryCarousel post={post} />
                <div className="p-3 space-y-2">
                  {post.caption && (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap" data-testid={`text-caption-${post.id}`}>
                      {post.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500" data-testid={`text-timestamp-${post.id}`}>
                      {formatTimeAgo(new Date(post.createdAt))}
                    </span>
                    {isOwner && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Delete this gallery post?")) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
                        className="text-gray-500 hover:text-red-600"
                        data-testid={`button-delete-gallery-${post.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={uploadOpen} onOpenChange={(o) => !createMutation.isPending && setUploadOpen(o)}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New gallery post</DialogTitle>
            <DialogDescription>
              Up to {MAX_ITEMS} items. Photos up to 10 MB, videos up to 50 MB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-gallery-file"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={drafts.length >= MAX_ITEMS}
              className="w-full"
              data-testid="button-pick-files"
            >
              <Upload className="w-4 h-4 mr-2" />
              {drafts.length === 0 ? "Choose photos / videos" : `Add more (${drafts.length}/${MAX_ITEMS})`}
            </Button>

            {drafts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {drafts.map((d, idx) => (
                  <div
                    key={d.id}
                    className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                    data-testid={`draft-item-${idx}`}
                  >
                    <div className="aspect-square bg-black flex items-center justify-center">
                      {d.mediaType === "video" ? (
                        <video src={d.dataUrl} className="w-full h-full object-contain" />
                      ) : (
                        <img src={d.dataUrl} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => removeDraft(d.id)}
                        className="bg-black/70 hover:bg-black text-white rounded-full p-1"
                        aria-label="Remove"
                        data-testid={`button-remove-draft-${idx}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                      <span className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                        {d.mediaType === "video" ? <VideoIcon className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {idx + 1}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveDraft(d.id, -1)}
                          disabled={idx === 0}
                          className="bg-black/70 hover:bg-black disabled:opacity-30 text-white rounded p-0.5"
                          aria-label="Move left"
                          data-testid={`button-move-left-${idx}`}
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDraft(d.id, 1)}
                          disabled={idx === drafts.length - 1}
                          className="bg-black/70 hover:bg-black disabled:opacity-30 text-white rounded p-0.5"
                          aria-label="Move right"
                          data-testid={`button-move-right-${idx}`}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Textarea
                placeholder="Add a caption (optional)…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                maxLength={2000}
                data-testid="input-gallery-caption"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setDrafts([]);
                  setCaption("");
                  setUploadOpen(false);
                }}
                disabled={createMutation.isPending}
                data-testid="button-cancel-gallery"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={drafts.length === 0 || createMutation.isPending}
                className="bg-[#c084fc] hover:bg-[#a855f7] text-white"
                data-testid="button-publish-gallery"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
