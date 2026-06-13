import { useState, useRef, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ImagePlus,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { GalleryPostWithItems } from "@shared/schema";
import { compressImage } from "@/lib/compressImage";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_ITEMS = 10;

type DraftItem = {
  id: string;
  file: File;
  previewUrl: string;
  mediaType: "image" | "video";
  caption: string;
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
  const currentItem = items[selectedIndex];

  return (
    <div>
      <div className="relative">
        <div className="overflow-hidden rounded-t-xl bg-gray-100" ref={emblaRef}>
          <div className="flex">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative flex-[0_0_100%] min-w-0 flex items-center justify-center bg-gray-100"
                style={{ aspectRatio: "4 / 3" }}
                data-testid={`gallery-item-${item.id}`}
              >
                {item.mediaType === "video" ? (
                  <video
                    src={item.mediaUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.caption || ""}
                    className="w-full h-full object-contain"
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white disabled:opacity-30 text-gray-700 rounded-full p-1.5 shadow-sm transition-all"
              aria-label="Previous"
              data-testid={`button-carousel-prev-${post.id}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={selectedIndex === items.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white disabled:opacity-30 text-gray-700 rounded-full p-1.5 shadow-sm transition-all"
              aria-label="Next"
              data-testid={`button-carousel-next-${post.id}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === selectedIndex
                      ? "bg-purple-500 w-4"
                      : "bg-gray-400/60 w-1.5"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                  data-testid={`dot-carousel-${post.id}-${i}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {currentItem?.caption && (
        <div className="px-3 pt-2 text-sm text-gray-600 italic" data-testid={`text-item-caption-${currentItem.id}`}>
          {currentItem.caption}
        </div>
      )}
    </div>
  );
}

export function ProfileGallery({ profileUserId, isOwner }: ProfileGalleryProps) {
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [postCaption, setPostCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: posts = [], isLoading } = useQuery<GalleryPostWithItems[]>({
    queryKey: ["/api/gallery", profileUserId],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const currentUserId =
        typeof window !== "undefined" ? window.localStorage.getItem("currentUserId") : null;
      const uploaded: { mediaUrl: string; mediaType: "image" | "video"; caption: string }[] = [];
      for (const d of drafts) {
        const fd = new FormData();
        fd.append("file", d.file);
        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: fd,
          headers: currentUserId ? { "x-user-id": currentUserId } : undefined,
        });
        if (!res.ok) {
          let detail = res.statusText;
          const raw = await res.text();
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              detail = parsed.message || parsed.error || raw;
            } catch {
              detail = raw;
            }
          }
          throw new Error(detail);
        }
        const json = (await res.json()) as { mediaUrl: string; mediaType: "image" | "video" };
        uploaded.push({ ...json, caption: d.caption });
      }
      const items = uploaded.map((u, idx) => ({
        mediaUrl: u.mediaUrl,
        mediaType: u.mediaType,
        caption: u.caption,
        orderIndex: idx,
      }));
      const res = await apiRequest("POST", "/api/gallery", {
        userId: profileUserId,
        caption: postCaption.trim(),
        items,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery", profileUserId] });
      setDrafts([]);
      setPostCaption("");
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

    const results = await Promise.all(
      files.slice(0, remaining).map(async (raw) => {
        const isImage = raw.type.startsWith("image/");
        const isVideo = raw.type.startsWith("video/");
        if (!isImage && !isVideo) {
          toast({
            title: "Unsupported file",
            description: `${raw.name} isn't a photo or video.`,
            variant: "destructive",
          });
          return null;
        }
        const file = isImage ? await compressImage(raw) : raw;
        const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
        if (file.size > limit) {
          toast({
            title: "File too large",
            description: `${raw.name} exceeds ${isVideo ? "50MB" : "10MB"} limit.`,
            variant: "destructive",
          });
          return null;
        }
        return {
          id: `${raw.name}-${raw.size}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          mediaType: (isVideo ? "video" : "image") as "video" | "image",
          caption: "",
        };
      })
    );
    const accepted = results.filter(Boolean) as DraftItem[];
    if (accepted.length > 0) setDrafts((prev) => [...prev, ...accepted]);
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((d) => d.id !== id);
    });
  };

  const updateDraftCaption = (id: string, caption: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, caption } : d)));
  };

  useEffect(() => {
    return () => {
      drafts.forEach((d) => URL.revokeObjectURL(d.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const closeDialog = () => {
    drafts.forEach((d) => URL.revokeObjectURL(d.previewUrl));
    setDrafts([]);
    setPostCaption("");
    setUploadOpen(false);
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
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading gallery…
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-500">No gallery posts yet</p>
            {isOwner && (
              <p className="text-sm mt-1 text-gray-400">Share photos and short clips of your work.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                data-testid={`gallery-post-${post.id}`}
              >
                <GalleryCarousel post={post} />
                <div className="px-3 pb-3 pt-2 space-y-1">
                  {post.caption && (
                    <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap" data-testid={`text-caption-${post.id}`}>
                      {post.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400" data-testid={`text-timestamp-${post.id}`}>
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
                        className="text-gray-400 hover:text-red-500 h-7 w-7 p-0"
                        data-testid={`button-delete-gallery-${post.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={uploadOpen} onOpenChange={(o) => { if (!createMutation.isPending) { if (!o) closeDialog(); else setUploadOpen(true); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">New gallery post</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Up to {MAX_ITEMS} items · Photos up to 10 MB · Videos up to 50 MB
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-gallery-file"
            />

            {drafts.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50 hover:bg-purple-100 rounded-xl py-10 flex flex-col items-center gap-2 transition-colors cursor-pointer"
                data-testid="button-pick-files"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <ImagePlus className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-sm font-medium text-purple-600">Choose photos or videos</span>
                <span className="text-xs text-gray-400">or drag and drop</span>
              </button>
            ) : (
              <>
                <div className="space-y-3">
                  {drafts.map((d, idx) => (
                    <div
                      key={d.id}
                    className="flex gap-3 bg-purple-50/70 rounded-xl p-3 border border-purple-100"
                      data-testid={`draft-item-${idx}`}
                    >
                      <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                        {d.mediaType === "video" ? (
                          <video src={d.previewUrl} className="w-full h-full object-cover" />
                        ) : (
                          <img src={d.previewUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute top-1 left-1 bg-white/80 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                          {d.mediaType === "video" ? <VideoIcon className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                          {idx + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <input
                          type="text"
                          placeholder="Add a caption for this photo…"
                          value={d.caption}
                          maxLength={500}
                          onChange={(e) => updateDraftCaption(d.id, e.target.value)}
                          className="w-full text-sm border border-purple-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-gray-900 placeholder:text-gray-500"
                          data-testid={`input-item-caption-${idx}`}
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveDraft(d.id, -1)}
                            disabled={idx === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Move up"
                            data-testid={`button-move-left-${idx}`}
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDraft(d.id, 1)}
                            disabled={idx === drafts.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Move down"
                            data-testid={`button-move-right-${idx}`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDraft(d.id)}
                            className="ml-auto text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                            aria-label="Remove"
                            data-testid={`button-remove-draft-${idx}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {drafts.length < MAX_ITEMS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-purple-200 hover:border-purple-300 rounded-xl py-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-100 transition-colors"
                    data-testid="button-add-more-files"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Add more ({drafts.length}/{MAX_ITEMS})
                  </button>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Post caption (optional)</label>
                  <textarea
                    placeholder="Write something about this post…"
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    className="w-full text-sm border border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-gray-900 placeholder:text-gray-500 resize-none"
                    data-testid="input-gallery-caption"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={closeDialog}
                disabled={createMutation.isPending}
                data-testid="button-cancel-gallery"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={drafts.length === 0 || createMutation.isPending}
                className="bg-[#c084fc] hover:bg-[#a855f7] text-white min-w-[90px]"
                data-testid="button-publish-gallery"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading…
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
