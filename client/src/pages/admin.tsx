import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Shield,
  Search,
  Loader2,
  Users as UsersIcon,
  FileText,
  Crown,
  Sparkles,
  Plus,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Post } from "@shared/schema";

type AdminUser = Omit<User, "password">;
type AdminPost = Post & { author: User };

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const loggedInUserId = typeof window !== "undefined"
    ? localStorage.getItem("currentUserId")
    : null;

  const meQuery = useQuery<AdminUser>({
    queryKey: ["/api/users", loggedInUserId],
    enabled: !!loggedInUserId,
    queryFn: async () => {
      const res = await fetch(`/api/users/${loggedInUserId}`);
      if (!res.ok) throw new Error("Failed to fetch current user");
      return res.json();
    },
  });

  const isAdmin = !!meQuery.data?.isAdmin;

  useEffect(() => {
    if (!loggedInUserId) {
      setLocation("/login");
    } else if (meQuery.isError) {
      setLocation("/login");
    } else if (!meQuery.isLoading && meQuery.data && !isAdmin) {
      setLocation("/home");
    }
  }, [loggedInUserId, meQuery.isLoading, meQuery.isError, meQuery.data, isAdmin, setLocation]);

  if (!loggedInUserId || meQuery.isError || meQuery.isLoading || !meQuery.data || !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c084fc]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-white text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div
          className="rounded-3xl border border-[#c084fc]/20 p-6 sm:p-8 mb-8 shadow-[0_15px_45px_-18px_rgba(192,132,252,0.35)] bg-white/90"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(244,231,255,0.96) 100%)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[#7c3aed] mb-2">
            <Sparkles className="w-4 h-4" />
            Admin · Owner controls
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
            Admin
          </h1>
          <p className="text-gray-700 mt-1 max-w-2xl">
            Manage community members and Core posts. Admin access can only be
            granted by editing the database directly.
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-[#c084fc] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-gray-600 transition-all flex items-center gap-2"
              data-testid="tab-admin-users"
            >
              <UsersIcon className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="data-[state=active]:bg-[#c084fc] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-gray-600 transition-all flex items-center gap-2"
              data-testid="tab-admin-posts"
            >
              <FileText className="w-4 h-4" />
              Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab currentAdminId={meQuery.data.id} />
          </TabsContent>

          <TabsContent value="posts">
            <PostsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function initialsOf(u: { firstName: string; lastName: string; avatar?: string | null }) {
  if (u.avatar && u.avatar.length > 0 && u.avatar.length <= 4) return u.avatar;
  return `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();
}

function UsersTab({ currentAdminId }: { currentAdminId: number }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const usersQuery = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return res.json();
    },
  });

  const memberLevelMutation = useMutation({
    mutationFn: async ({ id, memberLevel }: { id: number; memberLevel: string }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/users/${id}/member-level`,
        { memberLevel },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Member level updated" });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update",
        description: err?.message ?? "Try again",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "User deleted" });
      setPendingDelete(null);
    },
    onError: (err: any) => {
      toast({
        title: "Failed to delete",
        description: err?.message ?? "Try again",
        variant: "destructive",
      });
    },
  });

  const all = usersQuery.data ?? [];
  const filtered = useMemo(() => {
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter((u) =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.pkaName ?? "").toLowerCase().includes(q),
    );
  }, [all, search]);

  const platinumCount = all.filter((u) => u.memberLevel === "Platinum").length;
  const goldCount = all.filter((u) => u.memberLevel === "Gold").length;

  return (
    <div className="space-y-6">
      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<UsersIcon className="w-5 h-5" />}
          label="Total members"
          value={all.length}
        />
        <StatCard
          icon={<Crown className="w-5 h-5" />}
          label="Platinum"
          value={platinumCount}
          accent="amber"
        />
        <StatCard
          icon={<Crown className="w-5 h-5" />}
          label="Gold"
          value={goldCount}
          accent="purple"
        />
      </div>
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-[#c084fc]" />
              All members
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email"
                className="pl-9 h-10 bg-gray-50 border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]/30"
                data-testid="input-search-users"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {usersQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#c084fc]" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="w-6 h-6 text-[#c084fc]" />}
              title={search ? "No matching members" : "No members yet"}
              description={search ? "Try a different name or email." : "New signups will appear here."}
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-3 py-4 rounded-xl hover:bg-purple-50/40 transition-colors text-[#000000]"
                  data-testid={`row-user-${u.id}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c084fc] to-purple-500 text-white font-semibold flex items-center justify-center shrink-0 shadow-sm">
                      {initialsOf(u)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-semibold text-gray-900 truncate"
                          data-testid={`text-user-name-${u.id}`}
                        >
                          {u.firstName} {u.lastName}
                        </span>
                        {u.pkaName && (
                          <span className="text-xs text-gray-500">
                            ({u.pkaName})
                          </span>
                        )}
                        {u.isAdmin && (
                          <Badge className="bg-[#c084fc] hover:bg-[#c084fc] text-white text-[10px] px-2 py-0">
                            <Shield className="w-3 h-3 mr-1" /> Admin
                          </Badge>
                        )}
                      </div>
                      <p
                        className="text-sm text-gray-600 truncate"
                        data-testid={`text-user-email-${u.id}`}
                      >
                        {u.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 sm:ml-auto">
                    <Select
                      value={u.memberLevel}
                      onValueChange={(value) =>
                        memberLevelMutation.mutate({ id: u.id, memberLevel: value })
                      }
                      disabled={memberLevelMutation.isPending}
                    >
                      <SelectTrigger
                        className="w-[130px] h-9 bg-white border-gray-200"
                        data-testid={`select-level-${u.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 text-red-500 border-red-200 bg-white hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      disabled={u.id === currentAdminId}
                      onClick={() => setPendingDelete(u)}
                      title={u.id === currentAdminId ? "You cannot delete your own admin account" : "Delete user"}
                      data-testid={`button-delete-user-${u.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <AlertDialog
            open={!!pendingDelete}
            onOpenChange={(open) => !open && setPendingDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete user?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{" "}
                  <span className="font-semibold">
                    {pendingDelete?.firstName} {pendingDelete?.lastName}
                  </span>{" "}
                  along with all of their posts, comments, connections,
                  favorites, and gallery posts. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete-user">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() =>
                    pendingDelete && deleteMutation.mutate(pendingDelete.id)
                  }
                  data-testid="button-confirm-delete-user"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

const POST_TYPES = ["community", "opportunity", "resource", "event"] as const;
type PostType = (typeof POST_TYPES)[number];

const POST_TYPE_LABEL: Record<PostType, string> = {
  community: "Community · Open MiC",
  opportunity: "Opportunities · MiC Is Hot",
  resource: "Resources · MiC Check",
  event: "Events · MiC Drop",
};

const POST_TYPE_SHORT: Record<PostType, string> = {
  community: "Community",
  opportunity: "Opportunities",
  resource: "Resources",
  event: "Events",
};

const POST_TYPE_STYLE: Record<string, string> = {
  community: "bg-purple-50 text-[#7c3aed] border-purple-200",
  post: "bg-purple-50 text-[#7c3aed] border-purple-200",
  opportunity: "bg-amber-50 text-amber-700 border-amber-200",
  resource: "bg-emerald-50 text-emerald-700 border-emerald-200",
  event: "bg-sky-50 text-sky-700 border-sky-200",
  tip: "bg-emerald-50 text-emerald-700 border-emerald-200",
  milestone: "bg-sky-50 text-sky-700 border-sky-200",
};

function PostsTab() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("community");
  const [pendingDelete, setPendingDelete] = useState<AdminPost | null>(null);
  const [filter, setFilter] = useState<"all" | PostType>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState<string>("community");

  const postsQuery = useQuery<AdminPost[]>({
    queryKey: ["/api/admin/posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/posts");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/posts", {
        content: content.trim(),
        type,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setContent("");
      setType("community");
      toast({ title: "Post created" });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to create post",
        description: err?.message ?? "Try again",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/posts/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post deleted" });
      setPendingDelete(null);
    },
    onError: (err: any) => {
      toast({
        title: "Failed to delete",
        description: err?.message ?? "Try again",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      content,
      type,
    }: {
      id: number;
      content: string;
      type: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/posts/${id}`, {
        content,
        type,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post updated" });
      setEditingId(null);
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update",
        description: err?.message ?? "Try again",
        variant: "destructive",
      });
    },
  });

  const startEdit = (p: AdminPost) => {
    setEditingId(p.id);
    setEditContent(p.content);
    setEditType(p.type);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const all = postsQuery.data ?? [];
  const visible = filter === "all" ? all : all.filter((p) => p.type === filter);

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#c084fc]" />
            New Core post
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5 text-[#000000]">
          <div className="grid sm:grid-cols-[240px_1fr] gap-5 items-start">
            <div className="space-y-2">
              <Label className="text-gray-600">Core section</Label>
              <Select value={type} onValueChange={(v) => setType(v as PostType)}>
                <SelectTrigger
                  className="bg-gray-50 border-gray-200 text-black"
                  data-testid="select-new-post-type"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-black">
                      {POST_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Posts publish to this section on the Core page.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Write something for the community..."
                className="bg-gray-50 border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]/30 resize-none"
                data-testid="textarea-new-post-content"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-[#c084fc] hover:bg-[#a855f7] text-white shadow-sm"
              disabled={!content.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              data-testid="button-create-admin-post"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#c084fc]" />
              All posts
              <span className="text-sm font-normal text-gray-500">
                ({all.length})
              </span>
            </CardTitle>
            <div className="flex flex-wrap gap-1.5">
              <FilterChip
                label="All"
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              {POST_TYPES.map((t) => (
                <FilterChip
                  key={t}
                  label={POST_TYPE_SHORT[t]}
                  active={filter === t}
                  onClick={() => setFilter(t)}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {postsQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#c084fc]" />
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-6 h-6 text-[#c084fc]" />}
              title={filter === "all" ? "No posts yet" : "No posts of this type"}
              description="Posts published on Core will appear here."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {visible.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <li
                    key={p.id}
                    className="px-3 py-4 flex flex-col sm:flex-row gap-3 hover:bg-purple-50/40 rounded-xl transition-colors"
                    data-testid={`row-post-${p.id}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c084fc] to-purple-500 text-white text-sm font-semibold flex items-center justify-center shrink-0 shadow-sm">
                      {initialsOf(p.author)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-semibold text-gray-900 truncate">
                          {p.author.firstName} {p.author.lastName}
                        </span>
                        {!isEditing && (
                          <span
                            className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full border ${POST_TYPE_STYLE[p.type] ?? POST_TYPE_STYLE.community}`}
                          >
                            {p.type}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Select
                            value={editType}
                            onValueChange={(v) => setEditType(v)}
                          >
                            <SelectTrigger
                              className="bg-gray-50 border-gray-200 h-9 w-full sm:w-[260px]"
                              data-testid={`select-edit-post-type-${p.id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {POST_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {POST_TYPE_LABEL[t]}
                                </SelectItem>
                              ))}
                              {!(POST_TYPES as readonly string[]).includes(
                                editType,
                              ) && (
                                <SelectItem value={editType}>
                                  {editType} (legacy)
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                            className="bg-gray-50 border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]/30 resize-none"
                            data-testid={`textarea-edit-post-content-${p.id}`}
                          />
                        </div>
                      ) : (
                        <p
                          className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-4"
                          data-testid={`text-post-content-${p.id}`}
                        >
                          {p.content}
                        </p>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-center gap-2 self-start">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-emerald-600 border-emerald-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40"
                            disabled={
                              !editContent.trim() || editMutation.isPending
                            }
                            onClick={() =>
                              editMutation.mutate({
                                id: p.id,
                                content: editContent.trim(),
                                type: editType,
                              })
                            }
                            title="Save changes"
                            data-testid={`button-save-edit-post-${p.id}`}
                          >
                            {editMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-gray-500 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-700"
                            onClick={cancelEdit}
                            title="Cancel"
                            data-testid={`button-cancel-edit-post-${p.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-[#7c3aed] border-purple-200 bg-white hover:bg-purple-50 hover:text-[#c084fc]"
                            onClick={() => startEdit(p)}
                            title="Edit post"
                            data-testid={`button-edit-post-${p.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-red-500 border-red-200 bg-white hover:bg-red-50 hover:text-red-600"
                            onClick={() => setPendingDelete(p)}
                            data-testid={`button-delete-post-${p.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <AlertDialog
            open={!!pendingDelete}
            onOpenChange={(open) => !open && setPendingDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the post and all of its
                  comments. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete-post">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() =>
                    pendingDelete && deleteMutation.mutate(pendingDelete.id)
                  }
                  data-testid="button-confirm-delete-post"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = "purple",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: "purple" | "amber";
}) {
  const accentClasses =
    accent === "amber"
      ? "from-amber-100 to-amber-50 text-amber-600"
      : "from-purple-100 to-purple-50 text-[#c084fc]";
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accentClasses} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-[#c084fc] text-white border-[#c084fc]"
          : "bg-white text-gray-600 border-gray-200 hover:bg-purple-50/60 hover:text-[#c084fc] hover:border-[#c084fc]/40"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-purple-50 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}
