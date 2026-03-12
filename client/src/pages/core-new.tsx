import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar,
  Users,
  DollarSign,
  BookOpen,
  Mic,
  Plus,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Search,
  X,
  ExternalLink,
  ChevronLeft,
  Trash2
} from "lucide-react";
import type { User, Post, Comment } from "@shared/schema";
import { Heart, MessageCircle, Send as SendIcon } from "lucide-react";
import { getGenreBadge, getProfessionBadge } from "@/lib/badges";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import communityIcon from "@assets/Community (2)_1762467983061.png";
import opportunityIcon from "@assets/Opportunity_1762467984905.png";
import resourcesIcon from "@assets/Resources_1762467991075.png";
import eventsIcon from "@assets/Events_1762467993706.png";
import goldBadge from "@assets/Gold_Level-removebg-preview_1762468528106.png";
import platinumBadge from "@assets/Platinum Level_1762468203581.png";

export default function CorePage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showArticlesDialog, setShowArticlesDialog] = useState(false);
  const [showCompaniesDialog, setShowCompaniesDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showPerformDialog, setShowPerformDialog] = useState(false);
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [showCreateOpportunityDialog, setShowCreateOpportunityDialog] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<(Post & { author: User }) | null>(null);
  const [applicationEmail, setApplicationEmail] = useState("");
  const [applicationPhone, setApplicationPhone] = useState("");
  const [applicationAnswers, setApplicationAnswers] = useState<Record<number, string>>({});
  const [postContent, setPostContent] = useState("");
  const [opportunityContent, setOpportunityContent] = useState("");
  const [opportunityIsPaid, setOpportunityIsPaid] = useState(true);
  const [opportunityQuestions, setOpportunityQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [postComments, setPostComments] = useState<Record<number, (Comment & { author: User })[]>>({});
  const [loadingComments, setLoadingComments] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: posts = [] } = useQuery<(Post & { author: User })[]>({
    queryKey: ["/api/posts"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get logged-in user from localStorage - no fallback to prevent user bleed
  const loggedInUserId = localStorage.getItem('currentUserId');
  const currentUser = loggedInUserId ? users.find(user => user.id.toString() === loggedInUserId) : undefined;
  const isPlatinum = currentUser?.memberLevel === "Platinum";

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("PATCH", `/api/posts/${postId}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      if (!currentUser?.id) {
        throw new Error("You must be logged in to comment");
      }
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, {
        userId: currentUser.id,
        content
      });
      return res.json();
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      loadComments(postId);
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      toast({ title: "Comment added!", description: "Your comment has been posted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" });
    }
  });

  const loadComments = async (postId: number) => {
    setLoadingComments(postId);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const comments = await res.json();
      setPostComments(prev => ({ ...prev, [postId]: comments }));
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoadingComments(null);
    }
  };

  const handleToggleComments = async (postId: number) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(postId);
      if (!postComments[postId]) {
        await loadComments(postId);
      }
    }
  };

  const handleLike = (postId: number) => {
    likeMutation.mutate(postId);
  };

  const handleSubmitComment = (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    commentMutation.mutate({ postId, content });
  };

  const handleCommentInputChange = (postId: number, value: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; type: string; userId: number }) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setPostContent("");
      setShowCreatePostDialog(false);
      toast({ title: "Post created!", description: "Your post has been shared with the community." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post. Please try again.", variant: "destructive" });
    }
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: { content: string; type: string; userId: number; isPaid: boolean; applicationQuestions: string }) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setOpportunityContent("");
      setOpportunityIsPaid(true);
      setOpportunityQuestions([]);
      setNewQuestion("");
      setShowCreateOpportunityDialog(false);
      toast({ title: "Opportunity posted!", description: "Your opportunity has been shared." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post opportunity. Please try again.", variant: "destructive" });
    }
  });

  const communityPosts = posts.filter(post => post.type === "post");
  const opportunityPosts = posts.filter(post => post.type === "opportunity");

  const handleApplyClick = (opportunity: Post & { author: User }) => {
    setSelectedOpportunity(opportunity);
    setApplicationEmail("");
    setApplicationPhone("");
    setApplicationAnswers({});
    setShowApplicationDialog(true);
  };

  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  const handleSubmitApplication = async () => {
    if (!applicationEmail.trim()) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    if (!selectedOpportunity) return;

    setIsSubmittingApplication(true);
    try {
      const questions = getOpportunityQuestions(selectedOpportunity);
      const answersWithQuestions: Record<string, string> = {};
      questions.forEach((q, i) => {
        answersWithQuestions[q] = applicationAnswers[i] || "";
      });

      const res = await apiRequest("POST", "/api/opportunities/apply", {
        postId: selectedOpportunity.id,
        applicantEmail: applicationEmail.trim(),
        applicantPhone: applicationPhone.trim() || undefined,
        answers: Object.keys(answersWithQuestions).length > 0 ? answersWithQuestions : undefined,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to send application");
      }

      toast({ 
        title: "Application submitted!", 
        description: "Your application has been sent to the opportunity poster." 
      });
      setShowApplicationDialog(false);
      setSelectedOpportunity(null);
      setApplicationEmail("");
      setApplicationPhone("");
      setApplicationAnswers({});
    } catch (error: any) {
      toast({ 
        title: "Error sending application", 
        description: error.message || "Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const getOpportunityQuestions = (opportunity: Post | null): string[] => {
    if (!opportunity?.applicationQuestions) return [];
    try {
      return JSON.parse(opportunity.applicationQuestions);
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="hero-card" style={{
            background: 'linear-gradient(135deg, color-mix(in oklab, #c084fc 18%, transparent), transparent 55%)',
            border: '1px solid rgba(192,132,252,0.25)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 15px 45px -18px rgba(192,132,252,0.45)'
          }}>
            <div className="eyebrow" style={{display: 'inline-flex', gap: '8px', alignItems: 'center', color: '#c084fc', fontSize: '14px', marginBottom: '6px'}}>
              MiC · The Playlist
            </div>
            <h1 className="title" style={{fontWeight: 800, letterSpacing: '-0.02em', margin: '6px 0 8px', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#1f2937'}}>
              Core
            </h1>
            <p className="subtitle" style={{color: 'rgba(17,17,17,0.6)', maxWidth: '720px', margin: 0}}>
              Connect, collaborate, and grow in the music industry
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Vertical Navigation */}
          <div className="w-full lg:w-80 lg:shrink-0">
            <div className="lg:sticky lg:top-8 space-y-3">
              <button 
                onClick={() => setActiveModal("community")}
                className={`w-full p-3 lg:p-4 rounded-2xl text-left transition-all duration-300 group ${
                  activeModal === "community" 
                    ? "bg-[#c084fc] text-white shadow-lg" 
                    : "bg-white hover:bg-[#c084fc]/10 text-gray-700 border border-[#c084fc]/30 hover:border-[#c084fc]/50"
                }`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeModal === "community" 
                      ? "bg-white/20" 
                      : "bg-[#c084fc]/20 group-hover:bg-[#c084fc]/30"
                  }`}>
                    <img 
                      src={communityIcon}
                      alt="Community"
                      className="w-5 h-5 lg:w-6 lg:h-6 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base lg:text-lg truncate">Community</h3>
                    <p className={`text-xs lg:text-sm ${activeModal === "community" ? "text-white/80" : "text-gray-500"} truncate`}>
                      Open MiC discussions
                    </p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setActiveModal("opportunities")}
                className={`w-full p-3 lg:p-4 rounded-2xl text-left transition-all duration-300 group ${
                  activeModal === "opportunities" 
                    ? "bg-[#c084fc] text-white shadow-lg" 
                    : "bg-white hover:bg-[#c084fc]/10 text-gray-700 border border-[#c084fc]/30 hover:border-[#c084fc]/50"
                }`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeModal === "opportunities" 
                      ? "bg-white/20" 
                      : "bg-[#c084fc]/20 group-hover:bg-[#c084fc]/30"
                  }`}>
                    <img 
                      src={opportunityIcon}
                      alt="Opportunities"
                      className="w-5 h-5 lg:w-6 lg:h-6 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base lg:text-lg truncate">Opportunities</h3>
                    <p className={`text-xs lg:text-sm ${activeModal === "opportunities" ? "text-white/80" : "text-gray-500"} truncate`}>
                      MiC Is Hot jobs
                    </p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setActiveModal("resources")}
                className={`w-full p-3 lg:p-4 rounded-2xl text-left transition-all duration-300 group ${
                  activeModal === "resources" 
                    ? "bg-[#c084fc] text-white shadow-lg" 
                    : "bg-white hover:bg-[#c084fc]/10 text-gray-700 border border-[#c084fc]/30 hover:border-[#c084fc]/50"
                }`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeModal === "resources" 
                      ? "bg-white/20" 
                      : "bg-[#c084fc]/20 group-hover:bg-[#c084fc]/30"
                  }`}>
                    <img 
                      src={resourcesIcon}
                      alt="Resources"
                      className="w-5 h-5 lg:w-6 lg:h-6 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base lg:text-lg truncate">Resources</h3>
                    <p className={`text-xs lg:text-sm ${activeModal === "resources" ? "text-white/80" : "text-gray-500"} truncate`}>
                      MiC Check library
                    </p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setActiveModal("events")}
                className={`w-full p-3 lg:p-4 rounded-2xl text-left transition-all duration-300 group ${
                  activeModal === "events" 
                    ? "bg-[#c084fc] text-white shadow-lg" 
                    : "bg-white hover:bg-[#c084fc]/10 text-gray-700 border border-[#c084fc]/30 hover:border-[#c084fc]/50"
                }`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeModal === "events" 
                      ? "bg-white/20" 
                      : "bg-[#c084fc]/20 group-hover:bg-[#c084fc]/30"
                  }`}>
                    <img 
                      src={eventsIcon}
                      alt="Events"
                      className="w-5 h-5 lg:w-6 lg:h-6 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base lg:text-lg truncate">Events</h3>
                    <p className={`text-xs lg:text-sm ${activeModal === "events" ? "text-white/80" : "text-gray-500"} truncate`}>
                      MiC Drop events
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Content - Visible at all sizes */}
          <div className="flex-1">
            {/* Community Content */}
            {activeModal === "community" && (
              <div className="bg-white border border-[#c084fc]/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#c084fc] rounded-full flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#c084fc]">Open MiC</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Post and learn about upcoming shows, releases, non-paid collaborations, and local events
                </p>

                <Button 
                  className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium mb-6"
                  onClick={() => setShowCreatePostDialog(true)}
                  data-testid="button-create-post"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>

                <div className="space-y-6">
                  {communityPosts.length === 0 ? (
                    <Card className="bg-white border-[#c084fc]/20 rounded-2xl">
                      <CardContent className="text-center py-16">
                        <div className="bg-[#c084fc] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No community posts yet</h3>
                        <p className="text-gray-600">Be the first to share something with the community!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    communityPosts.map((post) => (
                      <Card key={post.id} className="bg-white border-[#c084fc]/20 rounded-2xl hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[#c084fc] rounded-full flex items-center justify-center text-white font-bold shrink-0">
                              {post.author.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">
                                  {post.author.usePkaAsMain && post.author.pkaName
                                    ? post.author.pkaName
                                    : `${post.author.firstName} ${post.author.lastName}`}
                                </h4>
                                {post.author.verified && (
                                  <div className="bg-blue-500 rounded-full p-0.5">
                                    <Star className="w-3 h-3 text-white fill-current" />
                                  </div>
                                )}
                                {post.author.genre && post.author.genre.length > 0 && post.author.genre[0] && (
                                  <span className="text-xs font-medium text-[#c084fc] bg-[#c084fc]/10 px-2 py-1 rounded-full border border-[#c084fc]/30">
                                    {post.author.genre[0]}
                                  </span>
                                )}
                                <span className="text-sm text-[#c084fc] bg-[#c084fc]/10 px-2 py-1 rounded-full">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-4">{post.content}</p>
                              
                              {/* Like and Comment buttons */}
                              <div className="flex items-center gap-3 text-sm">
                                <button 
                                  onClick={() => handleLike(post.id)}
                                  className="flex items-center gap-2 text-[#c084fc] border border-[#c084fc]/30 px-4 py-2 rounded-full hover:bg-[#c084fc]/10 hover:border-[#c084fc]/50 transition-all duration-200 group"
                                >
                                  <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${post.likes > 0 ? 'fill-[#c084fc]' : ''}`} />
                                  <span className="font-medium">{post.likes}</span>
                                </button>
                                <button 
                                  onClick={() => handleToggleComments(post.id)}
                                  className={`flex items-center gap-2 border px-4 py-2 rounded-full transition-all duration-200 group ${
                                    expandedComments === post.id 
                                      ? 'bg-[#c084fc] text-white border-[#c084fc]' 
                                      : 'text-[#c084fc] border-[#c084fc]/30 hover:bg-[#c084fc]/10 hover:border-[#c084fc]/50'
                                  }`}
                                >
                                  <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                                  <span className="font-medium">{post.comments}</span>
                                </button>
                              </div>
                              
                              {/* Comments Section */}
                              {expandedComments === post.id && (
                                <div className="mt-4 pt-4 border-t border-[#c084fc]/20 space-y-4">
                                  {/* Comment Input */}
                                  <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                      {currentUser?.avatar || "?"}
                                    </div>
                                    <div className="flex-1 relative">
                                      <Input
                                        value={commentInputs[post.id] || ""}
                                        onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                                        placeholder="Write a comment..."
                                        className="pr-12 bg-gray-50 border-[#c084fc]/20 focus:border-[#c084fc] focus:ring-[#c084fc]/20 rounded-full"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmitComment(post.id);
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() => handleSubmitComment(post.id)}
                                        disabled={!commentInputs[post.id]?.trim() || commentMutation.isPending}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#c084fc] hover:bg-[#c084fc]/90 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                      >
                                        <SendIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Comments List */}
                                  {loadingComments === post.id ? (
                                    <div className="flex items-center justify-center py-4">
                                      <div className="w-5 h-5 border-2 border-[#c084fc] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                  ) : postComments[post.id]?.length > 0 ? (
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                      {postComments[post.id].map((comment) => (
                                        <div key={comment.id} className="flex gap-3 items-start group">
                                          <div className="w-7 h-7 bg-gradient-to-br from-[#c084fc]/80 to-[#c084fc]/50 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {comment.author.avatar}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="bg-gray-50 rounded-2xl px-4 py-2">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900 text-sm">
                                                  {comment.author.usePkaAsMain && comment.author.pkaName
                                                    ? comment.author.pkaName
                                                    : `${comment.author.firstName} ${comment.author.lastName}`}
                                                </span>
                                                <span className="text-xs text-gray-400">{formatTimeAgo(new Date(comment.createdAt))}</span>
                                              </div>
                                              <p className="text-gray-700 text-sm">{comment.content}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Opportunities Content */}
            {activeModal === "opportunities" && (
              <div className="bg-white border border-[#c084fc]/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#c084fc] rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#c084fc]">MiC Is Hot</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Post and find paying opportunities in the music industry
                </p>

                <Button 
                  className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium mb-6"
                  onClick={() => setShowCreateOpportunityDialog(true)}
                  data-testid="button-post-opportunity"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Opportunity
                </Button>

                <div className="grid gap-4">
                  {opportunityPosts.length === 0 ? (
                    <div className="bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-12 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <DollarSign className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities posted yet</h3>
                      <p className="text-gray-500">Check back soon for new paid opportunities!</p>
                    </div>
                  ) : (
                    opportunityPosts.map((post) => (
                      <div key={post.id} className="group bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-6 hover:shadow-xl hover:border-[#c084fc]/40 transition-all duration-300">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${post.isPaid !== false ? 'bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                                <DollarSign className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{post.isPaid !== false ? 'Paid Opportunity' : 'Unpaid Opportunity'}</h4>
                                <span className="text-xs text-gray-500">Posted today</span>
                              </div>
                            </div>
                            {post.isPaid !== false ? (
                              <div className="bg-gradient-to-r from-[#c084fc] to-[#c084fc]/80 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-md">
                                ${Math.floor(Math.random() * 1000) + 200}
                              </div>
                            ) : (
                              <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md">
                                Volunteer
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed">{post.content}</p>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-[#c084fc]/10">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <MapPin className="w-3.5 h-3.5 text-[#c084fc]" />
                                <span>Remote/Local</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-[#c084fc]" />
                                <span>7 days</span>
                              </div>
                            </div>
                            <Button 
                              className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                              onClick={() => handleApplyClick(post)}
                              data-testid={`button-apply-${post.id}`}
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Resources Content */}
            {activeModal === "resources" && (
              <div className="bg-white border border-[#c084fc]/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#c084fc] rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#c084fc]">MiC Check</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Access terminology, articles, links to important music companies, and educational videos
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-white border-[#c084fc]/20 rounded-2xl hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="text-gray-900 flex items-center text-lg">
                        <BookOpen className="w-5 h-5 mr-2 text-[#c084fc]" />
                        Music Terminology
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Essential music industry terms and definitions</p>
                      <Button 
                        className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium w-full"
                        onClick={() => setShowTermsDialog(true)}
                      >
                        Browse Terms
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-[#c084fc]/20 rounded-2xl hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="text-gray-900 flex items-center text-lg">
                        <TrendingUp className="w-5 h-5 mr-2 text-[#c084fc]" />
                        Industry Articles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Latest trends, tips, and insights from industry experts</p>
                      <Button 
                        className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium w-full"
                        onClick={() => setShowArticlesDialog(true)}
                      >
                        Read Articles
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-[#c084fc]/20 rounded-2xl hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="text-gray-900 flex items-center text-lg">
                        <Users className="w-5 h-5 mr-2 text-[#c084fc]" />
                        Music Companies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Directory of important labels, publishers, and industry contacts</p>
                      <Button 
                        className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium w-full"
                        onClick={() => setShowCompaniesDialog(true)}
                      >
                        View Directory
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Events Content */}
            {activeModal === "events" && (
              <div className="bg-white border border-[#c084fc]/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#c084fc] rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#c084fc]">MiC Drop</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Upcoming MiC sponsored events, webinars, showcases, and more
                </p>

                <div className="space-y-4">
                  <Card className="bg-white border-[#c084fc]/20 rounded-2xl hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Music Producer Masterclass</h3>
                          <p className="text-gray-600 mb-4">Learn advanced production techniques from Grammy-winning producers</p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="flex items-center bg-[#c084fc]/10 px-3 py-1.5 rounded-full border border-[#c084fc]/30">
                              <Calendar className="w-4 h-4 mr-1 text-[#c084fc]" />
                              <span className="text-gray-700">Jan 25, 2025</span>
                            </span>
                            <span className="flex items-center bg-[#c084fc]/10 px-3 py-1.5 rounded-full border border-[#c084fc]/30">
                              <Clock className="w-4 h-4 mr-1 text-[#c084fc]" />
                              <span className="text-gray-700">7:00 PM EST</span>
                            </span>
                            <span className="flex items-center bg-[#c084fc]/10 px-3 py-1.5 rounded-full border border-[#c084fc]/30">
                              <MapPin className="w-4 h-4 mr-1 text-[#c084fc]" />
                              <span className="text-gray-700">Virtual</span>
                            </span>
                          </div>
                        </div>
                        <Button 
                          className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium px-6 rounded-xl shrink-0"
                          onClick={() => setShowRegisterDialog(true)}
                        >
                          Register
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-[#c084fc]/20 rounded-2xl hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">MiC Showcase Night</h3>
                          <p className="text-gray-600 mb-4">Perform live and network with industry professionals</p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="flex items-center bg-[#c084fc]/10 px-3 py-1.5 rounded-full border border-[#c084fc]/30">
                              <Calendar className="w-4 h-4 mr-1 text-[#c084fc]" />
                              <span className="text-gray-700">Feb 15, 2025</span>
                            </span>
                            <span className="flex items-center bg-[#c084fc]/10 px-3 py-1.5 rounded-full border border-[#c084fc]/30">
                              <Clock className="w-4 h-4 mr-1 text-[#c084fc]" />
                              <span className="text-gray-700">8:00 PM</span>
                            </span>
                            <span className="flex items-center bg-[#c084fc]/10 px-3 py-1.5 rounded-full border border-[#c084fc]/30">
                              <MapPin className="w-4 h-4 mr-1 text-[#c084fc]" />
                              <span className="text-gray-700">Los Angeles, CA</span>
                            </span>
                          </div>
                        </div>
                        <Button 
                          className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium px-6 rounded-xl shrink-0"
                          onClick={() => setShowPerformDialog(true)}
                        >
                          Apply to Perform
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Default state - no modal selected */}
            {!activeModal && (
              <div className="bg-white border border-[#c084fc]/20 rounded-2xl p-6 shadow-lg">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#c084fc]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-[#c084fc]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Select a section</h3>
                  <p className="text-gray-600">Choose from Community, Opportunities, Resources, or Events to get started</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Dialogs - Disabled since content is now inline at all sizes */}
          <div className="hidden">
            {/* Community Modal */}
            <Dialog open={isMobile && activeModal === "community"} onOpenChange={(open) => setActiveModal(open ? "community" : null)}>
              <DialogContent className="w-full h-full max-w-none max-h-none overflow-y-auto rounded-none bg-white p-0 m-0 border-0">
                <div className="min-h-full flex flex-col">
                  {/* Header with Back Button */}
                  <div className="sticky top-0 z-10 bg-gradient-to-r from-[#c084fc]/10 to-[#c084fc]/5 px-4 py-4 border-b border-[#c084fc]/20">
                    <button 
                      onClick={() => setActiveModal(null)}
                      className="flex items-center gap-2 text-[#c084fc] font-medium mb-3 active:scale-95 transition-transform"
                      data-testid="button-back-community"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span className="text-sm">Back to Core</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-lg">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-[#c084fc]">Open MiC</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-0.5">
                          Upcoming shows, releases & local events
                        </DialogDescription>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 px-4 py-4">
                    <Button 
                      className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium mb-4 w-full py-3 text-sm rounded-xl"
                      onClick={() => setShowCreatePostDialog(true)}
                      data-testid="button-create-post-mobile"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Post
                    </Button>

                    <div className="space-y-3">
                      {communityPosts.length === 0 ? (
                        <div className="text-center py-10 bg-gradient-to-br from-white to-[#c084fc]/5 rounded-2xl border border-[#c084fc]/20">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">No community posts yet</h3>
                          <p className="text-sm text-gray-500">Be the first to share!</p>
                        </div>
                      ) : (
                        communityPosts.map((post) => (
                          <div key={post.id} className="bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center text-white font-bold shrink-0 text-sm shadow-md">
                                {post.author.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {post.author.usePkaAsMain && post.author.pkaName
                                      ? post.author.pkaName
                                      : `${post.author.firstName} ${post.author.lastName}`}
                                  </h4>
                                  {post.author.verified && (
                                    <div className="bg-blue-500 rounded-full p-0.5">
                                      <Star className="w-2.5 h-2.5 text-white fill-current" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm mb-3 leading-relaxed">{post.content}</p>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-1.5 text-[#c084fc] bg-[#c084fc]/10 border border-[#c084fc]/20 px-3 py-1.5 rounded-lg text-xs hover:bg-[#c084fc]/20 transition-colors"
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${post.likes > 0 ? 'fill-[#c084fc]' : ''}`} />
                                    <span>{post.likes}</span>
                                  </button>
                                  <button 
                                    onClick={() => handleToggleComments(post.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                      expandedComments === post.id 
                                        ? 'bg-[#c084fc] text-white border border-[#c084fc]' 
                                        : 'text-[#c084fc] bg-[#c084fc]/10 border border-[#c084fc]/20 hover:bg-[#c084fc]/20'
                                    }`}
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>{post.comments}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Opportunities Modal - Mobile Only */}
          <Dialog open={isMobile && activeModal === "opportunities"} onOpenChange={(open) => setActiveModal(open ? "opportunities" : null)}>
            <DialogContent className="w-full h-full max-w-none max-h-none overflow-y-auto rounded-none bg-white p-0 m-0 border-0">
              <div className="min-h-full flex flex-col">
                {/* Header with Back Button */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#c084fc]/10 to-[#c084fc]/5 px-4 py-4 border-b border-[#c084fc]/20">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex items-center gap-2 text-[#c084fc] font-medium mb-3 active:scale-95 transition-transform"
                    data-testid="button-back-opportunities"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">Back to Core</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-[#c084fc]">MiC Is Hot</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500 mt-0.5">
                        Find paying opportunities
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-4 py-4">
                  <Button 
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium mb-4 w-full py-3 text-sm rounded-xl"
                    onClick={() => setShowCreateOpportunityDialog(true)}
                    data-testid="button-post-opportunity-mobile"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Opportunity
                  </Button>

                  <div className="space-y-3">
                    {opportunityPosts.length === 0 ? (
                      <div className="text-center py-10 bg-gradient-to-br from-white to-[#c084fc]/5 rounded-2xl border border-[#c084fc]/20">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No opportunities posted yet</h3>
                        <p className="text-sm text-gray-500">Check back soon!</p>
                      </div>
                    ) : (
                      opportunityPosts.map((post) => (
                        <div key={post.id} className="bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${post.isPaid !== false ? 'bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm">{post.isPaid !== false ? 'Paid Opportunity' : 'Unpaid Opportunity'}</h4>
                                  <span className="text-xs text-gray-500">Posted today</span>
                                </div>
                              </div>
                              {post.isPaid !== false ? (
                                <div className="bg-gradient-to-r from-[#c084fc] to-[#c084fc]/80 text-white px-3 py-1.5 rounded-xl font-bold text-base shadow-md">
                                  ${Math.floor(Math.random() * 1000) + 200}
                                </div>
                              ) : (
                                <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md">
                                  Volunteer
                                </div>
                              )}
                            </div>
                            
                            <p className="text-gray-700 text-sm leading-relaxed">{post.content}</p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-[#c084fc]/10">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                                  <MapPin className="w-3 h-3 text-[#c084fc]" />
                                  <span>Remote</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                                  <Clock className="w-3 h-3 text-[#c084fc]" />
                                  <span>7 days</span>
                                </div>
                              </div>
                              <Button 
                                className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium px-4 py-2 text-xs rounded-xl shadow-md"
                                onClick={() => handleApplyClick(post)}
                                data-testid={`button-apply-mobile-${post.id}`}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Resources Modal - Mobile Only */}
          <Dialog open={isMobile && activeModal === "resources"} onOpenChange={(open) => setActiveModal(open ? "resources" : null)}>
            <DialogContent className="w-full h-full max-w-none max-h-none overflow-y-auto rounded-none bg-white p-0 m-0 border-0">
              <div className="min-h-full flex flex-col">
                {/* Header with Back Button */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#c084fc]/10 to-[#c084fc]/5 px-4 py-4 border-b border-[#c084fc]/20">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex items-center gap-2 text-[#c084fc] font-medium mb-3 active:scale-95 transition-transform"
                    data-testid="button-back-resources"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">Back to Core</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-[#c084fc]">MiC Check</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500 mt-0.5">
                        Terminology, articles & resources
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-4 py-4">
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-md">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-base">Music Terminology</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">Essential music industry terms and definitions</p>
                      <Button 
                        className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium w-full py-2.5 text-sm rounded-xl shadow-md"
                        onClick={() => setShowTermsDialog(true)}
                      >
                        Browse Terms
                      </Button>
                    </div>

                    <div className="bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-md">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-base">Industry Articles</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">Latest trends, tips, and insights from experts</p>
                      <Button 
                        className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium w-full py-2.5 text-sm rounded-xl shadow-md"
                        onClick={() => setShowArticlesDialog(true)}
                      >
                        Read Articles
                      </Button>
                    </div>

                    <div className="bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-md">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-base">Music Companies</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">Directory of labels, publishers, and industry contacts</p>
                      <Button 
                        className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium w-full py-2.5 text-sm rounded-xl shadow-md"
                        onClick={() => setShowCompaniesDialog(true)}
                      >
                        View Directory
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Events Modal - Mobile Only */}
          <Dialog open={isMobile && activeModal === "events"} onOpenChange={(open) => setActiveModal(open ? "events" : null)}>
            <DialogContent className="w-full h-full max-w-none max-h-none overflow-y-auto rounded-none bg-white p-0 m-0 border-0">
              <div className="min-h-full flex flex-col">
                {/* Header with Back Button */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#c084fc]/10 to-[#c084fc]/5 px-4 py-4 border-b border-[#c084fc]/20">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex items-center gap-2 text-[#c084fc] font-medium mb-3 active:scale-95 transition-transform"
                    data-testid="button-back-events"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">Back to Core</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-[#c084fc]">MiC Drop</DialogTitle>
                      <DialogDescription className="text-sm text-gray-500 mt-0.5">
                        Events, webinars & showcases
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-4 py-4">
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-md">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 text-base">Music Producer Masterclass</h4>
                        </div>
                        
                        <p className="text-gray-700 text-sm leading-relaxed">Learn advanced production techniques from Grammy-winning producers</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3 h-3 text-[#c084fc]" />
                            <span>Jan 25</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3 h-3 text-[#c084fc]" />
                            <span>7 PM EST</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <MapPin className="w-3 h-3 text-[#c084fc]" />
                            <span>Virtual</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium w-full py-2.5 text-sm rounded-xl shadow-md"
                          onClick={() => setShowRegisterDialog(true)}
                        >
                          Register
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-[#c084fc]/5 border border-[#c084fc]/20 rounded-2xl p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-xl flex items-center justify-center shadow-md">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900 text-base">MiC Showcase Night</h4>
                        </div>
                        
                        <p className="text-gray-700 text-sm leading-relaxed">Perform live and network with industry professionals</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3 h-3 text-[#c084fc]" />
                            <span>Feb 15</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3 h-3 text-[#c084fc]" />
                            <span>8 PM</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <MapPin className="w-3 h-3 text-[#c084fc]" />
                            <span>Los Angeles</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium w-full py-2.5 text-sm rounded-xl shadow-md"
                          onClick={() => setShowPerformDialog(true)}
                        >
                          Apply to Perform
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

      {/* Music Terminology Dialog - Powered by Exploration.io */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#c084fc]" />
              Music Industry Glossary
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Essential terms and definitions powered by Exploration.io Learn Library
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search terms..."
              className="pl-10 border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
            />
          </div>

          {/* Terms List */}
          <div className="mt-6 space-y-4">
            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  360 Deal
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  A contract between a record label and a recording artist where the label obtains a share in all revenue streams related to the artist, including touring, merchandise, name and likeness rights, and music publishing - not just record sales.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Contract Type</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  A&R Department
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  The Artist and Repertoire department is responsible for finding new talent and convincing them to sign with the label. A&R representatives lead negotiations and serve as the primary liaison between the artist and the label.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Industry Role</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  ISRC (International Standard Recording Code)
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  A unique identifier assigned to each sound recording. ISRCs are used to track recordings across streaming platforms, radio play, and other digital services for royalty collection.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Identification</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  ISWC (International Standard Musical Work Code)
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  A unique identifier for musical compositions (the underlying song), separate from recordings. Used to track compositions for publishing royalties and licensing.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Identification</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  Mechanical License
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Permission to reproduce and distribute a copyrighted musical composition. Required for physical copies, digital downloads, and interactive streaming. Rates are set by the Copyright Royalty Board.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Licensing</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  Synchronization License
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Permission to synchronize music with visual media like TV shows, films, commercials, video games, or online content. Both the composition and master recording rights must be licensed.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Licensing</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  PRO (Performing Rights Organization)
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Organizations like ASCAP, BMI, and SESAC that collect public performance royalties on behalf of songwriters and publishers when music is performed publicly (radio, TV, venues, streaming).
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Organization</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  SoundExchange
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  A non-profit organization that collects and distributes digital performance royalties for sound recordings played on non-interactive streaming services like Pandora, SiriusXM, and internet radio.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Organization</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  Recoupment
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  The process by which a record label recoups (recovers) advances and recording costs from an artist's royalties before the artist receives additional payments. Artists don't earn royalties until the advance is paid back.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Business</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#c084fc] rounded-full"></span>
                  Master-Use License
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Permission to use an existing sound recording (the actual recorded performance) in visual media. Must be obtained from the recording rights holder, usually a record label, separately from the sync license.
                </p>
                <Badge className="mt-3 bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Licensing</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Footer with Link */}
          <div className="mt-6 pt-4 border-t border-[#c084fc]/20 flex justify-between items-center">
            <a 
              href="https://exploration.io/a-glossary-of-music-industry-terms/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[#c084fc] hover:underline flex items-center gap-1"
            >
              View full glossary at Exploration.io
              <ExternalLink className="w-3 h-3" />
            </a>
            <Button
              variant="outline"
              onClick={() => setShowTermsDialog(false)}
              className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Industry Articles Dialog - Powered by Exploration.io */}
      <Dialog open={showArticlesDialog} onOpenChange={setShowArticlesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#c084fc]" />
              Music Industry Education
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Essential guides and resources from the Exploration.io Learn Library
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search articles..."
              className="pl-10 border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
            />
          </div>

          {/* Articles List */}
          <div className="mt-6 space-y-4">
            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      How the Music Business Works: A Bird's Eye View
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      A comprehensive overview of how the music industry operates, from creation to consumption and everything in between.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>By Exploration.io</span>
                      <span>•</span>
                      <span>Essential Reading</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Industry Overview</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://exploration.io/how-the-music-business-works-a-birds-eye-view/', '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      What is Synchronization Licensing?
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Learn how to get your music placed in TV shows, films, commercials, and video games. Understand sync licensing and how it can be a major revenue stream.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>By Exploration.io</span>
                      <span>•</span>
                      <span>Licensing Guide</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Revenue Strategies</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://exploration.io/what-is-synchronization-licensing/', '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      What is a Music Publisher?
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Understand the role of music publishers, how they help songwriters monetize their compositions, and what to look for in a publishing deal.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>By Exploration.io</span>
                      <span>•</span>
                      <span>Publishing 101</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Publishing</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://exploration.io/what-is-a-music-publisher/', '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Music Industry Contracts Explained
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Navigate recording contracts, publishing deals, management agreements, and more. Know what you're signing before you sign it.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>By Exploration.io</span>
                      <span>•</span>
                      <span>Legal Guide</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Rights & Legal</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://exploration.io/music-industry-contracts/', '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Major vs. Indie: Understanding Record Labels
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Compare the advantages and disadvantages of signing with a major label versus an independent label. Make informed career decisions.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>By Exploration.io</span>
                      <span>•</span>
                      <span>Career Guide</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Labels</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://exploration.io/major-vs-indie/', '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      A Guide to Copyright Registration
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Protect your music by registering your copyrights. Learn the process, costs, and why it matters for your career.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>By Exploration.io</span>
                      <span>•</span>
                      <span>Legal Guide</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Rights & Legal</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://exploration.io/a-guide-to-copyright-registration/', '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      The YouTube Guide for the Music Business
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Understand how YouTube royalties work, Content ID, and how to monetize your music on the world's largest video platform.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>By Exploration.io</span>
                      <span>•</span>
                      <span>Platform Guide</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Digital Platforms</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://exploration.io/the-youtube-guide-for-the-music-business/', '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      How Does the Music Modernization Act Work?
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Learn about the landmark legislation that changed how streaming royalties are collected and distributed to songwriters.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>By Exploration.io</span>
                      <span>•</span>
                      <span>Legislation</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Rights & Legal</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://exploration.io/how-does-the-music-modernization-act-work/', '_blank')}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer with Link */}
          <div className="mt-6 pt-4 border-t border-[#c084fc]/20 flex justify-between items-center">
            <a 
              href="https://exploration.io/learn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[#c084fc] hover:underline flex items-center gap-1"
            >
              View full library at Exploration.io
              <ExternalLink className="w-3 h-3" />
            </a>
            <Button
              variant="outline"
              onClick={() => setShowArticlesDialog(false)}
              className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Music Companies Directory Dialog - Example Modal */}
      <Dialog open={showCompaniesDialog} onOpenChange={setShowCompaniesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#c084fc]" />
              Music Companies Directory
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Important labels, publishers, and industry contacts
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search companies..."
              className="pl-10 border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
            />
          </div>

          {/* Companies List */}
          <div className="mt-6 space-y-4">
            {/* Company 1 */}
            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Universal Music Group
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      World's largest music company. Home to labels like Interscope, Republic Records, Def Jam, and Capitol Records.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>Santa Monica, CA</span>
                      <span>•</span>
                      <span>Major Label</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Record Label</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.universalmusic.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company 2 */}
            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Sony Music Publishing
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Leading global music publisher representing over 5 million songs. Works with songwriters and composers across all genres.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>Nashville, TN / New York, NY</span>
                      <span>•</span>
                      <span>Major Publisher</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Music Publisher</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.sonymusicpub.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company 3 */}
            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      DistroKid
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Leading music distribution service for independent artists. Get your music on Spotify, Apple Music, and 150+ streaming platforms.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>New York, NY</span>
                      <span>•</span>
                      <span>Independent Distribution</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Distribution</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.distrokid.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company 4 */}
            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      ASCAP
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      American Society of Composers, Authors and Publishers. Protects the rights of over 900,000 members by collecting and distributing royalties.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>New York, NY</span>
                      <span>•</span>
                      <span>Performance Rights</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">PRO</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.ascap.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company 5 */}
            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Warner Chappell Music
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      One of the world's leading music publishers with over one million copyrights. Represents legendary and emerging songwriters globally.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>Los Angeles, CA</span>
                      <span>•</span>
                      <span>Major Publisher</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Music Publisher</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.warnerchappell.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company 6 */}
            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      BMI (Broadcast Music, Inc.)
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Performance rights organization representing over 1.3 million songwriters, composers, and publishers. Collects and distributes royalties worldwide.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>Nashville, TN / New York, NY</span>
                      <span>•</span>
                      <span>Performance Rights</span>
                    </div>
                    <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">PRO</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.bmi.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      The Harry Fox Agency (HFA)
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      The nation's leading provider of rights management, licensing, and royalty services for the music industry. Processes mechanical licenses for reproductions of songs.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>New York, NY</span>
                      <span>•</span>
                      <span>Mechanical Licensing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Licensing</Badge>
                      <a 
                        href="https://exploration.io/what-is-the-harry-fox-agency/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#c084fc] hover:underline flex items-center gap-1"
                      >
                        Learn more <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.harryfox.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      SoundExchange
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Collects and distributes digital performance royalties for sound recordings from non-interactive streaming services like Pandora, SiriusXM, and internet radio stations.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>Washington, DC</span>
                      <span>•</span>
                      <span>Digital Performance Royalties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Royalty Collection</Badge>
                      <a 
                        href="https://exploration.io/what-is-soundexchange/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#c084fc] hover:underline flex items-center gap-1"
                      >
                        Learn more <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.soundexchange.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Music Reports
                    </h3>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      Provides rights administration, data, and royalty processing services for the digital music industry. Helps connect rights holders with their royalties.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span>Woodland Hills, CA</span>
                      <span>•</span>
                      <span>Rights Administration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/30">Rights Admin</Badge>
                      <a 
                        href="https://exploration.io/what-is-music-reports-inc/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#c084fc] hover:underline flex items-center gap-1"
                      >
                        Learn more <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white shrink-0"
                    onClick={() => window.open('https://www.musicreports.com', '_blank')}
                  >
                    Visit Site
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer with Link */}
          <div className="mt-6 pt-4 border-t border-[#c084fc]/20 flex justify-between items-center">
            <a 
              href="https://exploration.io/organizations-and-advocacy-groups-of-the-music-business/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[#c084fc] hover:underline flex items-center gap-1"
            >
              Learn about industry organizations at Exploration.io
              <ExternalLink className="w-3 h-3" />
            </a>
            <Button
              variant="outline"
              onClick={() => setShowCompaniesDialog(false)}
              className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Registration Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#c084fc]" />
              Register for Event
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Music Producer Masterclass - Jan 25, 2025
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name" className="text-gray-700 font-semibold">Full Name *</Label>
              <Input
                id="register-name"
                placeholder="Enter your full name"
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-gray-700 font-semibold">Email Address *</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="your.email@example.com"
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-phone" className="text-gray-700 font-semibold">Phone Number</Label>
              <Input
                id="register-phone"
                type="tel"
                placeholder="(555) 123-4567"
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-profession" className="text-gray-700 font-semibold">Profession *</Label>
              <Input
                id="register-profession"
                placeholder="e.g., Producer, Engineer, Artist"
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-notes" className="text-gray-700 font-semibold">Questions or Comments</Label>
              <Textarea
                id="register-notes"
                placeholder="Any questions or special requests?"
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent min-h-[100px]"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRegisterDialog(false)}
              className="flex-1 border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowRegisterDialog(false);
                // Handle registration logic here
              }}
              className="flex-1 bg-[#c084fc] hover:bg-[#c084fc]/90 text-white"
            >
              Confirm Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply to Perform Dialog */}
      <Dialog open={showPerformDialog} onOpenChange={setShowPerformDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mic className="w-6 h-6 text-[#c084fc]" />
              Apply to Perform
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              MiC Showcase Night - Feb 15, 2025
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="perform-name" className="text-gray-700 font-semibold">Artist/Band Name *</Label>
              <Input
                id="perform-name"
                placeholder="Your stage name or band name"
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perform-email" className="text-gray-700 font-semibold">Email Address *</Label>
              <Input
                id="perform-email"
                type="email"
                placeholder="your.email@example.com"
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perform-genre" className="text-gray-700 font-semibold">Genre *</Label>
              <Input
                id="perform-genre"
                placeholder="e.g., Hip-Hop, R&B, Pop"
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perform-links" className="text-gray-700 font-semibold">Music Links *</Label>
              <Input
                id="perform-links"
                placeholder="Spotify, SoundCloud, YouTube, etc."
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perform-bio" className="text-gray-700 font-semibold">Artist Bio *</Label>
              <Textarea
                id="perform-bio"
                placeholder="Tell us about your music, experience, and why you'd be a great fit for the showcase..."
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent min-h-[120px]"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPerformDialog(false)}
              className="flex-1 border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowPerformDialog(false);
                // Handle application logic here
              }}
              className="flex-1 bg-[#c084fc] hover:bg-[#c084fc]/90 text-white"
            >
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Community Post Dialog */}
      <Dialog open={showCreatePostDialog} onOpenChange={setShowCreatePostDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mic className="w-6 h-6 text-[#c084fc]" />
              Create Post
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Share with the Open MiC community
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-content" className="text-gray-700 font-semibold">What's on your mind?</Label>
              <Textarea
                id="post-content"
                placeholder="Share updates about upcoming shows, releases, collaborations, or local events..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent min-h-[150px]"
                data-testid="input-post-content"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreatePostDialog(false);
                setPostContent("");
              }}
              className="flex-1 border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (postContent.trim() && currentUser) {
                  createPostMutation.mutate({
                    content: postContent.trim(),
                    type: "post",
                    userId: currentUser.id
                  });
                }
              }}
              disabled={!postContent.trim() || createPostMutation.isPending}
              className="flex-1 bg-[#c084fc] hover:bg-[#c084fc]/90 text-white"
              data-testid="button-submit-post"
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Opportunity Post Dialog */}
      <Dialog open={showCreateOpportunityDialog} onOpenChange={setShowCreateOpportunityDialog}>
        <DialogContent className="max-w-md bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-[#c084fc]" />
              Post Opportunity
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Share an opportunity with the community
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Paid/Unpaid Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#c084fc]/10 to-[#c084fc]/5 rounded-xl border border-[#c084fc]/20">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${opportunityIsPaid ? 'bg-green-500' : 'bg-gray-400'}`}>
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="text-gray-900 font-semibold">{opportunityIsPaid ? 'Paid Opportunity' : 'Unpaid Opportunity'}</Label>
                  <p className="text-xs text-gray-500">{opportunityIsPaid ? 'This opportunity includes compensation' : 'This is a volunteer or experience-based opportunity'}</p>
                </div>
              </div>
              <Switch
                checked={opportunityIsPaid}
                onCheckedChange={setOpportunityIsPaid}
                data-testid="switch-opportunity-paid"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunity-content" className="text-gray-700 font-semibold">Opportunity Details</Label>
              <Textarea
                id="opportunity-content"
                placeholder={opportunityIsPaid 
                  ? "Describe the opportunity, requirements, compensation, and how to apply..." 
                  : "Describe the opportunity, what applicants will gain, and requirements..."}
                value={opportunityContent}
                onChange={(e) => setOpportunityContent(e.target.value)}
                className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent min-h-[120px]"
                data-testid="input-opportunity-content"
              />
            </div>

            {/* Dynamic Questions for Applicants */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-semibold">Questions for Applicants</Label>
              <p className="text-xs text-gray-500 -mt-1">Add custom questions that applicants must answer</p>
              
              {opportunityQuestions.length > 0 && (
                <div className="space-y-2">
                  {opportunityQuestions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="flex-1 text-sm text-gray-700">{question}</span>
                      <button
                        onClick={() => setOpportunityQuestions(prev => prev.filter((_, i) => i !== index))}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        data-testid={`button-remove-question-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., What's your availability?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newQuestion.trim()) {
                      e.preventDefault();
                      setOpportunityQuestions(prev => [...prev, newQuestion.trim()]);
                      setNewQuestion("");
                    }
                  }}
                  className="flex-1 border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
                  data-testid="input-new-question"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newQuestion.trim()) {
                      setOpportunityQuestions(prev => [...prev, newQuestion.trim()]);
                      setNewQuestion("");
                    }
                  }}
                  disabled={!newQuestion.trim()}
                  className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white px-3"
                  data-testid="button-add-question"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateOpportunityDialog(false);
                setOpportunityContent("");
                setOpportunityIsPaid(true);
                setOpportunityQuestions([]);
                setNewQuestion("");
              }}
              className="flex-1 border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (opportunityContent.trim() && currentUser) {
                  createOpportunityMutation.mutate({
                    content: opportunityContent.trim(),
                    type: "opportunity",
                    userId: currentUser.id,
                    isPaid: opportunityIsPaid,
                    applicationQuestions: JSON.stringify(opportunityQuestions)
                  });
                }
              }}
              disabled={!opportunityContent.trim() || createOpportunityMutation.isPending}
              className="flex-1 bg-[#c084fc] hover:bg-[#c084fc]/90 text-white"
              data-testid="button-submit-opportunity"
            >
              {createOpportunityMutation.isPending ? "Posting..." : "Post Opportunity"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-md bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#c084fc]" />
              Apply for Opportunity
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete your application below
            </DialogDescription>
          </DialogHeader>

          {selectedOpportunity && (
            <div className="mt-4 space-y-5">
              {/* Opportunity Summary */}
              <div className="p-4 bg-gradient-to-r from-[#c084fc]/10 to-[#c084fc]/5 rounded-xl border border-[#c084fc]/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedOpportunity.isPaid !== false ? 'bg-[#c084fc]' : 'bg-gray-400'}`}>
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${selectedOpportunity.isPaid !== false ? 'text-[#c084fc]' : 'text-gray-600'}`}>
                    {selectedOpportunity.isPaid !== false ? 'Paid Opportunity' : 'Volunteer Opportunity'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{selectedOpportunity.content}</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#c084fc]" />
                  Contact Information
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="application-email" className="text-gray-700 font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="application-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={applicationEmail}
                    onChange={(e) => setApplicationEmail(e.target.value)}
                    className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
                    data-testid="input-application-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="application-phone" className="text-gray-700 font-medium">
                    Phone Number <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="application-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={applicationPhone}
                    onChange={(e) => setApplicationPhone(e.target.value)}
                    className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent"
                    data-testid="input-application-phone"
                  />
                </div>
              </div>

              {/* Application Questions */}
              {getOpportunityQuestions(selectedOpportunity).length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#c084fc]" />
                    Application Questions
                  </h4>
                  
                  {getOpportunityQuestions(selectedOpportunity).map((question, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`question-${index}`} className="text-gray-700 font-medium text-sm">
                        {question}
                      </Label>
                      <Textarea
                        id={`question-${index}`}
                        placeholder="Your answer..."
                        value={applicationAnswers[index] || ""}
                        onChange={(e) => setApplicationAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                        className="border-[#c084fc]/30 focus:border-[#c084fc] focus:ring-[#c084fc]/20 text-gray-900 bg-transparent min-h-[80px]"
                        data-testid={`input-answer-${index}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowApplicationDialog(false);
                setSelectedOpportunity(null);
                setApplicationEmail("");
                setApplicationPhone("");
                setApplicationAnswers({});
              }}
              className="flex-1 border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={!applicationEmail.trim() || isSubmittingApplication}
              className="flex-1 bg-[#c084fc] hover:bg-[#c084fc]/90 text-white"
              data-testid="button-submit-application"
            >
              {isSubmittingApplication ? "Sending..." : "Submit Application"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}