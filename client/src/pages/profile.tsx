import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  User as UserIcon, 
  MapPin, 
  Globe, 
  Music, 
  Users, 
  Heart, 
  Briefcase, 
  Calendar,
  MessageCircle,
  Settings,
  Star,
  Trophy,
  Headphones,
  Mic,
  Instagram,
  Twitter,
  ExternalLink,
  Share,
  ArrowLeft,
  UserPlus,
  Handshake,
  X,
  Plus,
  Trash2,
  Save,
  Camera,
  Image,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { getGenreBadge, getProfessionBadge } from "@/lib/badges";
import goldBadge from "@assets/Gold_Level-removebg-preview_1762468528106.png";
import platinumBadge from "@assets/Platinum Level_1762468203581.png";

export default function ProfilePage() {
  const { userSlug } = useParams();
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Redirect to login if not logged in (for /home route without userSlug)
  const loggedInUserId = localStorage.getItem('currentUserId');
  useEffect(() => {
    if (!userSlug && !loggedInUserId) {
      setLocation('/login');
    }
  }, [userSlug, loggedInUserId, setLocation]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch all users for various lookups
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch user by slug if viewing another profile
  const { data: slugUser } = useQuery<User>({
    queryKey: ["/api/users/slug", userSlug],
    queryFn: async () => {
      const response = await fetch(`/api/users/slug/${userSlug}`);
      if (!response.ok) throw new Error("User not found");
      return response.json();
    },
    enabled: !!userSlug,
  });

  // Edit form state
  const [editBio, setEditBio] = useState("");
  const [editPortfolio, setEditPortfolio] = useState<{title: string; name: string; subtitle: string; image?: string}[]>([]);
  const [editSocialLinks, setEditSocialLinks] = useState<{platform: string; url: string}[]>([]);
  const [editMusicLinks, setEditMusicLinks] = useState<{platform: string; url: string}[]>([]);
  const [editProfessions, setEditProfessions] = useState<string[]>([]);
  const [editGenres, setEditGenres] = useState<string[]>([]);
  const [editProfileImage, setEditProfileImage] = useState<string | null>(null);
  
  // Posts state
  const [posts, setPosts] = useState<{id: number; content: string; image: string | null; timestamp: Date}[]>([
    { id: 1, content: "Just finished a new track! Can't wait to share it with everyone. The vibe is incredible 🎵", image: null, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 2, content: "Studio session was fire today. Grateful for the amazing collaborators I get to work with!", image: null, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  ]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);

  const allProfessions = [
    "Artist", "Administration", "Audio", "Consultant", "Dancer", "DJ", "Educator", "Fashion", 
    "Glam", "Legal", "Management", "Marketing", "Music Executive", "Musician", 
    "Photographer/Videographer", "Producer", "Publishing", "Radio/Podcast", "Record Label", 
    "Recording Studio", "Songwriter", "Synch", "Touring", "Venue"
  ];
  
  const allGenres = [
    "Pop", "Hip-Hop", "R&B", "Rock", "Country", "Electronic", "Dance", "Reggae", 
    "Latin", "Afrobeats", "Classical", "Jazz", "Blues", "Gospel"
  ];

  // If userSlug is provided in route, use the slugUser; otherwise use logged-in user's profile - no fallback to prevent user bleed
  const currentUser = userSlug 
    ? slugUser
    : (loggedInUserId ? users.find(user => user.id.toString() === loggedInUserId) : undefined);

  // Initialize form when edit mode opens
  useEffect(() => {
    if (isEditMode && currentUser) {
      setEditBio(currentUser.bio || "");
      setEditProfessions(currentUser.profession || []);
      setEditGenres(currentUser.genre || []);
      setEditProfileImage(currentUser.avatar?.startsWith('data:') ? currentUser.avatar : null);
      try {
        const portfolio = currentUser.portfolio ? JSON.parse(currentUser.portfolio) : [];
        setEditPortfolio(portfolio);
      } catch {
        setEditPortfolio([]);
      }
      setEditSocialLinks([
        { platform: "Instagram", url: currentUser.socialInstagram || "" },
        { platform: "Twitter", url: currentUser.socialTwitter || "" },
        { platform: "Website", url: currentUser.website || "" }
      ]);
      setEditMusicLinks([
        { platform: "Spotify", url: currentUser.musicSpotify || "" },
        { platform: "SoundCloud", url: currentUser.musicSoundcloud || "" },
        { platform: "Apple Music", url: currentUser.musicAppleMusic || "" },
        { platform: "Bandcamp", url: currentUser.musicBandcamp || "" }
      ]);
    }
  }, [isEditMode, currentUser]);
  
  const loggedInUser = loggedInUserId ? users.find(user => user.id.toString() === loggedInUserId) : undefined;
  const isOwnProfile = !userSlug || currentUser?.id === loggedInUser?.id;

  // Fetch connections to check existing connection status
  const { data: myConnections = [] } = useQuery<{ id: number; userId: number; connectedUserId: number; status: string }[]>({
    queryKey: ["/api/connections", loggedInUser?.id],
    queryFn: async () => {
      if (!loggedInUser?.id) return [];
      const res = await fetch(`/api/connections/${loggedInUser.id}`);
      return res.json();
    },
    enabled: !!loggedInUser?.id && !isOwnProfile,
  });

  const existingConnection = currentUser && myConnections.find(
    c => (c.userId === loggedInUser?.id && c.connectedUserId === currentUser.id) ||
         (c.connectedUserId === loggedInUser?.id && c.userId === currentUser.id)
  );

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!loggedInUser?.id || !currentUser?.id) throw new Error("Missing user IDs");
      const res = await apiRequest("POST", "/api/connections", {
        userId: loggedInUser.id,
        connectedUserId: currentUser.id,
      });
      return res.json();
    },
    onSuccess: () => {
      console.log("✅ Connected! Email notification dispatched to", currentUser?.email);
      // Optimistically update the displayed count immediately
      if (userSlug) {
        queryClient.setQueryData(["/api/users/slug", userSlug], (old: any) =>
          old ? { ...old, connections: (old.connections ?? 0) + 1 } : old
        );
      }
      queryClient.invalidateQueries({ queryKey: ["/api/connections", loggedInUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/slug", userSlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Connected!", description: "They'll be notified by email." });
    },
    onError: (err: any) => {
      console.error("❌ Connection failed:", err);
      toast({ title: "Error", description: "Failed to connect.", variant: "destructive" });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!loggedInUser?.id || !currentUser?.id) throw new Error("Missing user IDs");
      const res = await apiRequest("DELETE", `/api/connections/${loggedInUser.id}/${currentUser.id}`);
      return res.json();
    },
    onSuccess: () => {
      console.log("✅ Disconnected from", currentUser?.email);
      // Optimistically update the displayed count immediately
      if (userSlug) {
        queryClient.setQueryData(["/api/users/slug", userSlug], (old: any) =>
          old ? { ...old, connections: Math.max((old.connections ?? 1) - 1, 0) } : old
        );
      }
      queryClient.invalidateQueries({ queryKey: ["/api/connections", loggedInUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/slug", userSlug] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Disconnected", description: "Connection removed." });
    },
    onError: (err: any) => {
      console.error("❌ Disconnect failed:", err);
      toast({ title: "Error", description: "Failed to disconnect.", variant: "destructive" });
    },
  });

  // Save changes mutation - must be before any early returns
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const userId = currentUser?.id;
      if (!userId) throw new Error("User ID not found");
      console.log("Making PATCH request to /api/users/" + userId, data);
      const response = await apiRequest("PATCH", `/api/users/${userId}`, data);
      const json = await response.json();
      console.log("PATCH response:", json);
      return json;
    },
    onSuccess: (response) => {
      console.log("Mutation successful:", response);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
      setIsEditMode(false);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({ title: "Error", description: "Failed to save changes. Please try again.", variant: "destructive" });
    }
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c084fc] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayName = currentUser.usePkaAsMain && currentUser.pkaName 
    ? currentUser.pkaName 
    : `${currentUser.firstName} ${currentUser.lastName}`;

  const stats = [
    { label: "Connections", value: currentUser.connections, icon: Users },
    { label: "Favorites", value: currentUser.favorites, icon: Heart },
    { label: "Collaborations", value: currentUser.collaborations, icon: Handshake },
    { label: "Gigs", value: currentUser.gigs, icon: Calendar },
    { label: "Posts", value: currentUser.posts, icon: MessageCircle },
    { label: "Events", value: currentUser.eventsAttended, icon: Trophy },
  ];

  const socialLinks = [
    { platform: "Instagram", url: currentUser.socialInstagram, icon: Instagram },
    { platform: "Twitter", url: currentUser.socialTwitter, icon: Twitter },
    { platform: "Website", url: currentUser.website, icon: Globe },
  ].filter(link => link.url);

  const musicLinks = [
    { platform: "Spotify", url: currentUser.musicSpotify },
    { platform: "SoundCloud", url: currentUser.musicSoundcloud },
    { platform: "Apple Music", url: currentUser.musicAppleMusic },
    { platform: "Bandcamp", url: currentUser.musicBandcamp },
  ].filter(link => link.url);


  const handleSave = () => {
    if (!currentUser?.id) {
      toast({ title: "Error", description: "User not found. Please refresh and try again.", variant: "destructive" });
      return;
    }
    
    const updates: Partial<User> = {
      bio: editBio || "",
      profession: editProfessions,
      genre: editGenres,
      avatar: editProfileImage || currentUser.avatar,
      socialInstagram: editSocialLinks.find(l => l.platform === "Instagram")?.url || "",
      socialTwitter: editSocialLinks.find(l => l.platform === "Twitter")?.url || "",
      website: editSocialLinks.find(l => l.platform === "Website")?.url || "",
      musicSpotify: editMusicLinks.find(l => l.platform === "Spotify")?.url || "",
      musicSoundcloud: editMusicLinks.find(l => l.platform === "SoundCloud")?.url || "",
      musicAppleMusic: editMusicLinks.find(l => l.platform === "Apple Music")?.url || "",
      musicBandcamp: editMusicLinks.find(l => l.platform === "Bandcamp")?.url || "",
      portfolio: JSON.stringify(editPortfolio),
    };
    
    console.log("Saving profile updates for user", currentUser.id, updates);
    updateProfileMutation.mutate(updates);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProfession = (profession: string) => {
    if (editProfessions.includes(profession)) {
      setEditProfessions(editProfessions.filter(p => p !== profession));
    } else {
      setEditProfessions([...editProfessions, profession]);
    }
  };

  const toggleGenre = (genre: string) => {
    if (editGenres.includes(genre)) {
      setEditGenres(editGenres.filter(g => g !== genre));
    } else {
      setEditGenres([...editGenres, genre]);
    }
  };

  const addSocialLink = () => {
    const availablePlatforms = ["Instagram", "Twitter", "Website", "TikTok", "YouTube"];
    const usedPlatforms = editSocialLinks.map(l => l.platform);
    const nextPlatform = availablePlatforms.find(p => !usedPlatforms.includes(p)) || "Other";
    setEditSocialLinks([...editSocialLinks, { platform: nextPlatform, url: "" }]);
  };

  const addMusicLink = () => {
    const availablePlatforms = ["Spotify", "SoundCloud", "Apple Music", "Bandcamp", "YouTube Music"];
    const usedPlatforms = editMusicLinks.map(l => l.platform);
    const nextPlatform = availablePlatforms.find(p => !usedPlatforms.includes(p)) || "Other";
    setEditMusicLinks([...editMusicLinks, { platform: nextPlatform, url: "" }]);
  };

  const addPortfolioItem = () => {
    setEditPortfolio([...editPortfolio, { title: "New Track", name: "", subtitle: "", image: "" }]);
  };

  const handlePortfolioImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updated = [...editPortfolio];
        updated[index].image = event.target?.result as string;
        setEditPortfolio(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPostImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostImage) return;
    
    // Check if user is Platinum member - post to Core page
    if (currentUser?.memberLevel === "Platinum") {
      try {
        await apiRequest("POST", "/api/posts", { 
          userId: currentUser.id,
          content: newPostContent.trim() + (newPostImage ? `\n[Image attached]` : ""),
          type: "post"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        setNewPostContent("");
        setNewPostImage(null);
        toast({ 
          title: "Posted to Core!", 
          description: "Your post has been shared with the community." 
        });
      } catch (error) {
        toast({ 
          title: "Failed to post", 
          description: "Please try again later.",
          variant: "destructive" 
        });
      }
    } else {
      // Regular members - only local profile posts
      const newPost = {
        id: Date.now(),
        content: newPostContent.trim(),
        image: newPostImage,
        timestamp: new Date()
      };
      
      setPosts([newPost, ...posts]);
      setNewPostContent("");
      setNewPostImage(null);
      toast({ title: "Posted!", description: "Your note has been shared." });
    }
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

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="hero-card" style={{
            background: 'linear-gradient(135deg, color-mix(in oklab, #c084fc 18%, transparent), transparent 70%)',
            border: '1px solid rgba(192,132,252,0.25)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 15px 45px -18px rgba(192,132,252,0.45)'
          }}>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-[#c084fc] to-[#c084fc] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                  {currentUser.avatar?.startsWith('data:') ? (
                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.avatar
                  )}
                </div>
                {currentUser.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-[#c084fc] rounded-full p-2 shadow-lg">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900" style={{fontWeight: 800, letterSpacing: '-0.02em'}}>{displayName}</h1>
                    <img 
                      src={currentUser.memberLevel === "Platinum" ? platinumBadge : goldBadge}
                      alt={`${currentUser.memberLevel} Level`}
                      className="w-8 h-8 object-contain rounded-full"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    {currentUser.profession.map((prof, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {getProfessionBadge(prof) ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/80 rounded-full flex items-center justify-center p-1 shadow-md">
                            <img 
                              src={getProfessionBadge(prof)!} 
                              alt={`${prof} badge`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <Briefcase className="w-4 h-4 text-[#c084fc]" />
                        )}
                        <span className="capitalize font-medium">{prof}</span>
                      </div>
                    ))}
                    <span className="text-gray-400">|</span>
                    {currentUser.genre
                      .filter((genre) => genre.toLowerCase() !== "trap" && getGenreBadge(genre))
                      .map((genre, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-[#c084fc]/80 rounded-full flex items-center justify-center p-1 shadow-md">
                            <img 
                              src={getGenreBadge(genre)!} 
                              alt={`${genre} badge`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="capitalize font-medium">{genre}</span>
                        </div>
                      ))}
                    {currentUser.location && (
                      <>
                        <span className="text-gray-400">|</span>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-[#c084fc]" />
                          <span className="font-medium">{currentUser.location}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-[#c084fc]" />
                      <span><strong className="text-gray-900">{currentUser.connections}</strong> connections</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4 text-[#c084fc]" />
                      <span><strong className="text-gray-900">{currentUser.connections}</strong> connected</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {!isOwnProfile && (
                    <>
                      <Button className="bg-white text-[#c084fc] hover:bg-gray-50 font-medium border border-[#c084fc]">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      {existingConnection ? (
                        <Button
                          className="bg-green-500 hover:bg-red-500 text-white font-medium shadow-lg transition-colors group"
                          onClick={() => { if (!disconnectMutation.isPending) disconnectMutation.mutate(); }}
                          disabled={disconnectMutation.isPending}
                          data-testid="button-connected"
                        >
                          {disconnectMutation.isPending ? (
                            <><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />Removing...</>
                          ) : (
                            <><Handshake className="w-4 h-4 mr-2 group-hover:hidden" /><X className="w-4 h-4 mr-2 hidden group-hover:block" /><span className="group-hover:hidden">Connected</span><span className="hidden group-hover:inline">Disconnect</span></>
                          )}
                        </Button>
                      ) : (
                        <Button
                          className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium shadow-lg"
                          onClick={() => { if (!connectMutation.isPending) connectMutation.mutate(); }}
                          disabled={connectMutation.isPending}
                          data-testid="button-connect"
                        >
                          {connectMutation.isPending ? (
                            <><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />Connecting...</>
                          ) : (
                            <><UserPlus className="w-4 h-4 mr-2" />Connect</>
                          )}
                        </Button>
                      )}
                      <Link href="/directory">
                        <Button className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium shadow-lg">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Directory
                        </Button>
                      </Link>
                    </>
                  )}
                  {isOwnProfile && (
                    <>
                      <Button className="bg-white text-[#c084fc] hover:bg-gray-50 font-medium border border-[#c084fc]">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Messages
                      </Button>
                      <Button 
                        className="bg-white text-[#c084fc] hover:bg-gray-50 font-medium border border-[#c084fc]"
                        onClick={() => setIsEditMode(true)}
                        data-testid="button-edit-profile"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Link href="/account-settings">
                        <Button 
                          className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white font-medium shadow-lg"
                          data-testid="button-account-settings"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Account Settings
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section - Full Width at Top */}
        {currentUser.bio && (
          <div className="px-4 md:px-6 lg:px-0 mb-6">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 group">
              <CardHeader className="bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] text-white rounded-t-lg relative overflow-hidden p-4 md:p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <CardTitle className="text-white text-lg md:text-xl relative z-10 flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <p className="text-gray-700 leading-relaxed text-base md:text-lg">{currentUser.bio}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 px-4 md:px-6 lg:px-0 items-start">
          {/* Left Column - Bio & Stats */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Music Portfolio - Moved from center */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] group">
              <CardHeader className="bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] text-white rounded-t-lg relative overflow-hidden p-4 md:p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <CardTitle className="text-white text-lg md:text-xl relative z-10 flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 gap-3">
                  {(() => {
                    try {
                      const portfolio = currentUser.portfolio ? JSON.parse(currentUser.portfolio) : [];
                      return portfolio.length > 0 ? portfolio.map((item: {title: string; name: string; subtitle: string; image?: string}, index: number) => (
                        <div key={index} className="p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:scale-105 transform hover:shadow-lg border border-[#c084fc]/30 hover:border-[#c084fc]/50 group/track cursor-pointer">
                          <div className="flex gap-4 items-start">
                            {item.image && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[#c084fc]/20">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-[#c084fc] group-hover/track:text-[#c084fc] transition-colors duration-300">{item.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 ${index === 0 ? 'bg-red-400' : 'bg-yellow-400'} rounded-full animate-pulse`}></div>
                                  <ExternalLink className="w-4 h-4 text-[#c084fc] group-hover/track:scale-125 group-hover/track:rotate-12 transition-all duration-300" />
                                </div>
                              </div>
                              <p className="text-gray-900 font-bold text-sm group-hover/track:text-[#c084fc] transition-colors duration-300">"{item.name}"</p>
                              <p className="text-xs text-[#c084fc] font-semibold">{item.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-gray-500">No portfolio items yet</div>
                      );
                    } catch (e) {
                      return <div className="p-4 text-center text-gray-500">Portfolio data unavailable</div>;
                    }
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Stats - Hidden */}
            <Card className="hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] group">
              <CardHeader className="bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] text-white rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <CardTitle className="text-white relative z-10 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="text-center p-3 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 transform hover:scale-110 hover:shadow-lg cursor-pointer border border-[#c084fc]/30 hover:border-[#c084fc]/50">
                        <Icon className="w-5 h-5 mx-auto mb-1 text-[#c084fc] transition-transform duration-300 hover:rotate-12" />
                        <div className="text-xl font-bold text-gray-800 transition-colors duration-300">{stat.value}</div>
                        <div className="text-xs text-[#c084fc] font-medium">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Platforms - Combined Connect and Listen */}
            {(socialLinks.length > 0 || musicLinks.length > 0) && (
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] group">
                <CardHeader className="bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] text-white rounded-t-lg relative overflow-hidden p-4 md:p-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                  <CardTitle className="text-white text-lg md:text-xl relative z-10 flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                    Platforms
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3">
                    {socialLinks.map((link, index) => {
                      const Icon = link.icon;
                      return (
                        <a 
                          key={`social-${index}`}
                          href={link.url || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-[#c084fc]/10 hover:to-[#c084fc]/20 transition-all duration-300 border border-[#c084fc]/40 hover:border-[#c084fc]/60 hover:shadow-md transform hover:scale-105 group/link"
                        >
                          <Icon className="w-5 h-5 text-[#c084fc] transition-all duration-300 group-hover/link:scale-110 group-hover/link:rotate-12" />
                          <span className="text-gray-700 font-medium">{link.platform}</span>
                          <ExternalLink className="w-3 h-3 text-[#c084fc] ml-auto transition-transform duration-300 group-hover/link:translate-x-1" />
                        </a>
                      );
                    })}
                    {musicLinks.map((link, index) => (
                      <a 
                        key={`music-${index}`}
                        href={link.url || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:scale-110 transform hover:shadow-lg border border-[#c084fc]/30 hover:border-[#c084fc]/50 group/music"
                      >
                        <span className="font-bold text-gray-800">{link.platform}</span>
                        <ExternalLink className="w-4 h-4 text-[#c084fc] transition-all duration-300 group-hover/music:scale-125 group-hover/music:rotate-12" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center Column - Activity Feed */}
          <div className="hidden md:col-span-1 lg:col-span-1 space-y-4 md:space-y-6">
            <Card className="hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.01] group">
              <CardHeader className="bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] text-white rounded-t-lg relative overflow-hidden p-4 md:p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <CardTitle className="text-white text-lg md:text-xl relative z-10 flex items-center">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-400 rounded-full mr-2 md:mr-3 animate-pulse"></div>
                  Recent Activity
                  <div className="ml-auto flex space-x-1">
                    <div className="w-1 h-1 bg-white/50 rounded-full animate-ping"></div>
                    <div className="w-1 h-1 bg-white/50 rounded-full animate-ping animation-delay-100"></div>
                    <div className="w-1 h-1 bg-white/50 rounded-full animate-ping animation-delay-200"></div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:shadow-md transform hover:scale-105 border border-[#c084fc]/30 hover:border-[#c084fc]/50 group/activity">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c084fc] via-[#c084fc] to-[#c084fc] rounded-full flex items-center justify-center shadow-lg group-hover/activity:scale-110 transition-transform duration-300 relative">
                      <Mic className="w-5 h-5 text-white group-hover/activity:rotate-12 transition-transform duration-300" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold group-hover/activity:text-[#c084fc] transition-colors duration-300">Posted a new track preview</p>
                      <p className="text-sm text-[#c084fc] font-medium">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:shadow-md transform hover:scale-105 border border-[#c084fc]/30 hover:border-[#c084fc]/50 group/activity">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg group-hover/activity:scale-110 transition-transform duration-300 relative">
                      <Users className="w-5 h-5 text-white group-hover/activity:rotate-12 transition-transform duration-300" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold group-hover/activity:text-blue-700 transition-colors duration-300">Connected with Maya Keys</p>
                      <p className="text-sm text-[#c084fc] font-medium">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:shadow-md transform hover:scale-105 border border-[#c084fc]/30 hover:border-[#c084fc]/50 group/activity">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg group-hover/activity:scale-110 transition-transform duration-300 relative">
                      <Handshake className="w-5 h-5 text-white group-hover/activity:rotate-12 transition-transform duration-300" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold group-hover/activity:text-green-700 transition-colors duration-300">Completed a collaboration with J.Beats</p>
                      <p className="text-sm text-[#c084fc] font-medium">3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:shadow-md transform hover:scale-105 border border-[#c084fc]/30 hover:border-[#c084fc]/50 group/activity">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-full flex items-center justify-center shadow-lg group-hover/activity:scale-110 transition-transform duration-300 relative">
                      <Heart className="w-5 h-5 text-white group-hover/activity:rotate-12 transition-transform duration-300" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold group-hover/activity:text-pink-700 transition-colors duration-300">Released new single "Midnight Vibes"</p>
                      <p className="text-sm text-[#c084fc] font-medium">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Professional Network */}
          <div className="flex flex-col gap-4 md:gap-6">
            <Card className="hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] group">
              <CardHeader className="bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] text-white rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <CardTitle className="flex items-center text-white relative z-10">
                  <Users className="w-5 h-5 mr-2 text-white animate-pulse" />
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Network
                  <div className="ml-auto flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:shadow-lg transform hover:scale-105 border border-[#c084fc]/30 hover:border-[#c084fc]/50 cursor-pointer group/network">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#c084fc] via-[#c084fc] to-[#c084fc] rounded-full relative shadow-md group-hover/network:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                      <div className="absolute top-1 left-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-bold text-sm group-hover/network:text-[#c084fc] transition-colors duration-300">Maya Keys</p>
                      <p className="text-xs text-[#c084fc] font-semibold">Producer</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:shadow-lg transform hover:scale-105 border border-[#c084fc]/30 hover:border-[#c084fc]/50 cursor-pointer group/network">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full relative shadow-md group-hover/network:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                      <div className="absolute top-1 left-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-bold text-sm group-hover/network:text-blue-700 transition-colors duration-300">J.Beats</p>
                      <p className="text-xs text-[#c084fc] font-semibold">Sound Engineer</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-[#c084fc]/10 via-white to-[#c084fc]/20 rounded-xl hover:from-[#c084fc]/20 hover:to-[#c084fc]/30 transition-all duration-300 hover:shadow-lg transform hover:scale-105 border border-[#c084fc]/30 hover:border-[#c084fc]/50 cursor-pointer group/network">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 rounded-full relative shadow-md group-hover/network:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                      <div className="absolute top-1 left-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-bold text-sm group-hover/network:text-pink-700 transition-colors duration-300">Luna Sky</p>
                      <p className="text-xs text-[#c084fc] font-semibold">Vocalist</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-[#c084fc] to-[#c084fc] hover:from-[#c084fc] hover:to-[#c084fc] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  View All Connections
                </Button>
              </CardContent>
            </Card>

            {/* Posts */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 group">
              <CardHeader className="bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] text-white rounded-t-lg relative overflow-hidden p-4 md:p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <CardTitle className="text-white text-lg md:text-xl relative z-10 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {/* Create Post */}
                <div className="mb-4 p-3 bg-gradient-to-br from-[#c084fc]/5 to-[#c084fc]/10 rounded-xl border border-[#c084fc]/20">
                  <Textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share what's on your mind..."
                    className="w-full min-h-[60px] text-sm border-0 bg-transparent resize-none focus:ring-0 text-gray-800 placeholder:text-gray-500"
                    data-testid="input-new-post"
                  />
                  {newPostImage && (
                    <div className="relative mt-2 inline-block">
                      <img src={newPostImage} alt="Preview" className="max-h-32 rounded-lg object-cover" />
                      <button 
                        onClick={() => setNewPostImage(null)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#c084fc]/20">
                    <label className="cursor-pointer flex items-center gap-1 text-[#c084fc] hover:text-[#a855f7] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePostImageUpload}
                        className="hidden"
                        data-testid="input-post-image"
                      />
                      <Image className="w-4 h-4" />
                      <span className="text-xs font-medium">Photo</span>
                    </label>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() && !newPostImage}
                      size="sm"
                      className="bg-[#c084fc] hover:bg-[#a855f7] text-white rounded-full px-4 py-1 text-xs font-semibold disabled:opacity-50"
                      data-testid="button-create-post"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Post
                    </Button>
                  </div>
                </div>
                
                {/* Posts List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {posts.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">No posts yet. Share something!</p>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="p-3 bg-white rounded-xl border border-[#c084fc]/20 hover:border-[#c084fc]/40 transition-all">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                            {currentUser?.avatar?.startsWith('data:') ? (
                              <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              currentUser?.avatar || "?"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-sm">{currentUser?.pkaName || `${currentUser?.firstName} ${currentUser?.lastName}`}</span>
                              <span className="text-xs text-gray-500">{formatTimeAgo(post.timestamp)}</span>
                            </div>
                            <p className="text-gray-700 text-sm mt-1">{post.content}</p>
                            {post.image && (
                              <img src={post.image} alt="Post" className="mt-2 rounded-lg max-h-40 object-cover" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Hidden */}
            <Card className="hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] group">
              <CardHeader className="bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] text-white rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                <CardTitle className="text-white relative z-10 flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  Quick Actions
                  <div className="ml-auto">
                    <div className="w-6 h-1 bg-white/40 rounded-full animate-pulse"></div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-[#c084fc] via-[#c084fc] to-[#c084fc] hover:from-[#c084fc] hover:via-[#c084fc] hover:to-[#c084fc] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold py-3 relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></div>
                    <MessageCircle className="w-4 h-4 mr-3 transition-transform duration-300 group-hover/btn:rotate-12" />
                    New Message
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold py-3 relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></div>
                    <Share className="w-4 h-4 mr-3 transition-transform duration-300 group-hover/btn:rotate-12" />
                    Share Profile
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold py-3 relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></div>
                    <Settings className="w-4 h-4 mr-3 transition-transform duration-300 group-hover/btn:rotate-12" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hidden Tabs for Future Use */}
          <div className="lg:col-span-4 hidden">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="discography">Music</TabsTrigger>
                <TabsTrigger value="connections">Network</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <p className="text-gray-700">Posted a new track preview</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                      <div className="border-b pb-4">
                        <p className="text-gray-700">Connected with Maya Keys</p>
                        <p className="text-sm text-gray-500">1 day ago</p>
                      </div>
                      <div className="border-b pb-4">
                        <p className="text-gray-700">Completed a collaboration with J.Beats</p>
                        <p className="text-sm text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discography" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Discography</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Discography coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Network</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Network view coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Messages coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Edit Profile Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className={isMobile 
          ? "w-[100vw] h-[100vh] max-w-none max-h-none overflow-hidden rounded-none bg-white p-0 m-0 border-0 flex flex-col"
          : "max-w-2xl max-h-[90vh] overflow-y-auto bg-white"
        }>
          {isMobile ? (
            <div className="flex flex-col h-full">
              {/* Mobile Header - Fixed */}
              <div className="bg-gradient-to-r from-[#c084fc] to-[#c084fc]/90 px-[5vw] py-[4vw] flex items-center justify-between shrink-0">
                <button 
                  onClick={() => setIsEditMode(false)}
                  className="bg-[#c084fc] hover:bg-[#c084fc]/90 rounded-[2vw] p-[2vw] flex items-center justify-center"
                  data-testid="button-back-mobile"
                >
                  <ArrowLeft className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-white" />
                </button>
                <DialogTitle className="text-white font-bold text-[4.5vw]">Edit Profile</DialogTitle>
                <button 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="text-white font-semibold text-[3.8vw] bg-white/20 px-[4vw] py-[2vw] rounded-[2vw]"
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
              <DialogDescription className="sr-only">Edit your profile information</DialogDescription>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-[5vw] py-[4vw] space-y-[5vw]">
                
                {/* About Section */}
                <div className="bg-white border border-[#c084fc]/20 rounded-[4vw] p-[4vw]">
                  <div className="flex items-center gap-[3vw] mb-[3vw]">
                    <div className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-[2.5vw] flex items-center justify-center shadow-md">
                      <UserIcon className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-white" />
                    </div>
                    <h4 className="font-semibold text-black text-[4vw]">About</h4>
                  </div>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full min-h-[25vw] text-[3.8vw] p-[3vw] border-2 border-[#c084fc]/30 rounded-[3vw] focus:border-[#c084fc] focus:ring-[#c084fc]/20 resize-none bg-white text-black"
                    data-testid="input-bio"
                  />
                  <p className="text-[3vw] text-black/60 mt-[2vw] text-right">{editBio.length}/500</p>
                </div>

                {/* Profile Picture Section */}
                <div className="bg-white border border-[#c084fc]/20 rounded-[4vw] p-[4vw]">
                  <div className="flex items-center gap-[3vw] mb-[3vw]">
                    <div className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-[2.5vw] flex items-center justify-center shadow-md">
                      <Camera className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-white" />
                    </div>
                    <h4 className="font-semibold text-black text-[4vw]">Profile Picture</h4>
                  </div>
                  <div className="flex items-center gap-[4vw]">
                    <div className="w-[20vw] h-[20vw] max-w-[80px] max-h-[80px] rounded-full overflow-hidden border-2 border-[#c084fc]/30 flex items-center justify-center bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70">
                      {editProfileImage ? (
                        <img src={editProfileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : currentUser?.avatar?.startsWith('data:') ? (
                        <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-[6vw]">{currentUser?.avatar || "?"}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          data-testid="input-profile-image"
                        />
                        <div className="bg-[#c084fc] text-white px-[4vw] py-[2vw] rounded-[2vw] text-[3.5vw] font-medium text-center">
                          Upload Photo
                        </div>
                      </label>
                      {editProfileImage && (
                        <button 
                          onClick={() => setEditProfileImage(null)}
                          className="text-red-400 text-[3vw] mt-[2vw]"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profession Section */}
                <div className="bg-white border border-[#c084fc]/20 rounded-[4vw] p-[4vw]">
                  <div className="flex items-center gap-[3vw] mb-[3vw]">
                    <div className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-[2.5vw] flex items-center justify-center shadow-md">
                      <Briefcase className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-white" />
                    </div>
                    <h4 className="font-semibold text-black text-[4vw]">Profession</h4>
                  </div>
                  <div className="flex flex-wrap gap-[2vw]">
                    {allProfessions.map((profession) => (
                      <button
                        key={profession}
                        onClick={() => toggleProfession(profession)}
                        className={`px-[3vw] py-[1.5vw] rounded-full text-[3vw] font-medium transition-all ${
                          editProfessions.includes(profession)
                            ? "bg-[#c084fc] text-white"
                            : "bg-gray-100 text-black/70 hover:bg-[#c084fc]/20"
                        }`}
                        data-testid={`profession-${profession.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        {profession}
                      </button>
                    ))}
                  </div>
                  {editProfessions.length > 0 && (
                    <p className="text-[3vw] text-[#c084fc] mt-[2vw]">Selected: {editProfessions.join(", ")}</p>
                  )}
                </div>

                {/* Genre Section */}
                <div className="bg-white border border-[#c084fc]/20 rounded-[4vw] p-[4vw]">
                  <div className="flex items-center gap-[3vw] mb-[3vw]">
                    <div className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-[2.5vw] flex items-center justify-center shadow-md">
                      <Music className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-white" />
                    </div>
                    <h4 className="font-semibold text-black text-[4vw]">Genre</h4>
                  </div>
                  <div className="flex flex-wrap gap-[2vw]">
                    {allGenres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-[3vw] py-[1.5vw] rounded-full text-[3vw] font-medium transition-all ${
                          editGenres.includes(genre)
                            ? "bg-[#c084fc] text-white"
                            : "bg-gray-100 text-black/70 hover:bg-[#c084fc]/20"
                        }`}
                        data-testid={`genre-${genre.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  {editGenres.length > 0 && (
                    <p className="text-[3vw] text-[#c084fc] mt-[2vw]">Selected: {editGenres.join(", ")}</p>
                  )}
                </div>

                {/* Portfolio Section */}
                <div className="bg-white border border-[#c084fc]/20 rounded-[4vw] p-[4vw]">
                  <div className="flex items-center justify-between mb-[3vw]">
                    <div className="flex items-center gap-[3vw]">
                      <div className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-[2.5vw] flex items-center justify-center shadow-md">
                        <Music className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-white" />
                      </div>
                      <h4 className="font-semibold text-black text-[4vw]">Portfolio</h4>
                    </div>
                    <button 
                      onClick={addPortfolioItem}
                      className="text-[#c084fc] font-medium text-[3.5vw] flex items-center gap-[1vw]"
                      data-testid="button-add-portfolio"
                    >
                      <Plus className="w-[4vw] h-[4vw]" />
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-[3vw]">
                    {editPortfolio.map((item, index) => (
                      <div key={index} className="bg-white border border-[#c084fc]/20 rounded-[3vw] p-[3vw]">
                        <div className="flex items-center justify-between mb-[2vw]">
                          <Input
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...editPortfolio];
                              updated[index].title = e.target.value;
                              setEditPortfolio(updated);
                            }}
                            placeholder="Track Type (e.g., Latest Single)"
                            className="flex-1 text-[3.5vw] h-[10vw] border-0 bg-transparent font-semibold text-[#c084fc]"
                            data-testid={`input-portfolio-title-${index}`}
                          />
                          <button 
                            onClick={() => setEditPortfolio(editPortfolio.filter((_, i) => i !== index))}
                            className="text-red-400 p-[2vw]"
                            data-testid={`button-remove-portfolio-${index}`}
                          >
                            <Trash2 className="w-[4vw] h-[4vw]" />
                          </button>
                        </div>
                        {/* Track Image Upload */}
                        <div className="flex items-center gap-[3vw] mb-[2vw]">
                          <div className="w-[16vw] h-[16vw] max-w-[60px] max-h-[60px] rounded-[2vw] overflow-hidden border-2 border-[#c084fc]/30 flex items-center justify-center bg-gradient-to-br from-[#c084fc]/20 to-[#c084fc]/10">
                            {item.image ? (
                              <img src={item.image} alt="Track" className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-[6vw] h-[6vw] max-w-[24px] max-h-[24px] text-[#c084fc]/50" />
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePortfolioImageUpload(index, e)}
                                className="hidden"
                                data-testid={`input-portfolio-image-${index}`}
                              />
                              <div className="bg-[#c084fc]/10 text-[#c084fc] px-[3vw] py-[1.5vw] rounded-[2vw] text-[3vw] font-medium text-center inline-block">
                                {item.image ? "Change Image" : "Add Image"}
                              </div>
                            </label>
                            {item.image && (
                              <button 
                                onClick={() => {
                                  const updated = [...editPortfolio];
                                  updated[index].image = "";
                                  setEditPortfolio(updated);
                                }}
                                className="text-red-400 text-[2.5vw] ml-[2vw]"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...editPortfolio];
                            updated[index].name = e.target.value;
                            setEditPortfolio(updated);
                          }}
                          placeholder="Track Name"
                          className="w-full text-[3.5vw] h-[10vw] mb-[2vw] border-[#c084fc]/20 bg-white text-black"
                          data-testid={`input-portfolio-name-${index}`}
                        />
                        <Input
                          value={item.subtitle}
                          onChange={(e) => {
                            const updated = [...editPortfolio];
                            updated[index].subtitle = e.target.value;
                            setEditPortfolio(updated);
                          }}
                          placeholder="Release Info (e.g., Released Jan 2025)"
                          className="w-full text-[3.2vw] h-[10vw] border-[#c084fc]/20 bg-white text-black"
                          data-testid={`input-portfolio-subtitle-${index}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-white border border-[#c084fc]/20 rounded-[4vw] p-[4vw]">
                  <div className="flex items-center justify-between mb-[3vw]">
                    <div className="flex items-center gap-[3vw]">
                      <div className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-[2.5vw] flex items-center justify-center shadow-md">
                        <Globe className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-white" />
                      </div>
                      <h4 className="font-semibold text-black text-[4vw]">Social Links</h4>
                    </div>
                    <button 
                      onClick={addSocialLink}
                      className="text-[#c084fc] font-medium text-[3.5vw] flex items-center gap-[1vw]"
                      data-testid="button-add-social"
                    >
                      <Plus className="w-[4vw] h-[4vw]" />
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-[3vw]">
                    {editSocialLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-[2vw]">
                        <div className="w-[20vw] text-[3.5vw] font-medium text-black">{link.platform}</div>
                        <Input
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...editSocialLinks];
                            updated[index].url = e.target.value;
                            setEditSocialLinks(updated);
                          }}
                          placeholder={`Your ${link.platform} URL`}
                          className="flex-1 text-[3.5vw] h-[10vw] border-[#c084fc]/20 bg-white text-black"
                          data-testid={`input-social-${index}`}
                        />
                        <button 
                          onClick={() => setEditSocialLinks(editSocialLinks.filter((_, i) => i !== index))}
                          className="text-red-400 p-[2vw]"
                          data-testid={`button-remove-social-${index}`}
                        >
                          <Trash2 className="w-[4vw] h-[4vw]" />
                        </button>
                      </div>
                    ))}
                    {editSocialLinks.length === 0 && (
                      <p className="text-black/50 text-[3.5vw] text-center py-[4vw]">No social links added yet</p>
                    )}
                  </div>
                </div>

                {/* Music Platform Links Section */}
                <div className="bg-white border border-[#c084fc]/20 rounded-[4vw] p-[4vw]">
                  <div className="flex items-center justify-between mb-[3vw]">
                    <div className="flex items-center gap-[3vw]">
                      <div className="w-[10vw] h-[10vw] max-w-[40px] max-h-[40px] bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70 rounded-[2.5vw] flex items-center justify-center shadow-md">
                        <Headphones className="w-[5vw] h-[5vw] max-w-[20px] max-h-[20px] text-white" />
                      </div>
                      <h4 className="font-semibold text-black text-[4vw]">Music Platforms</h4>
                    </div>
                    <button 
                      onClick={addMusicLink}
                      className="text-[#c084fc] font-medium text-[3.5vw] flex items-center gap-[1vw]"
                      data-testid="button-add-music"
                    >
                      <Plus className="w-[4vw] h-[4vw]" />
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-[3vw]">
                    {editMusicLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-[2vw]">
                        <div className="w-[25vw] text-[3.5vw] font-medium text-black">{link.platform}</div>
                        <Input
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...editMusicLinks];
                            updated[index].url = e.target.value;
                            setEditMusicLinks(updated);
                          }}
                          placeholder={`Your ${link.platform} URL`}
                          className="flex-1 text-[3.5vw] h-[10vw] border-[#c084fc]/20 bg-white text-black"
                          data-testid={`input-music-${index}`}
                        />
                        <button 
                          onClick={() => setEditMusicLinks(editMusicLinks.filter((_, i) => i !== index))}
                          className="text-red-400 p-[2vw]"
                          data-testid={`button-remove-music-${index}`}
                        >
                          <Trash2 className="w-[4vw] h-[4vw]" />
                        </button>
                      </div>
                    ))}
                    {editMusicLinks.length === 0 && (
                      <p className="text-black/50 text-[3.5vw] text-center py-[4vw]">No music platforms added yet</p>
                    )}
                  </div>
                </div>


                {/* Bottom spacing for safe area */}
                <div className="h-[10vw]"></div>
              </div>

              {/* Mobile Footer - Fixed at bottom for thumb access */}
              <div className="bg-white border-t border-[#c084fc]/20 px-[5vw] py-[4vw] flex gap-[3vw] shrink-0 pb-[max(4vw,env(safe-area-inset-bottom))]">
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="flex-1 h-[12vw] text-[3.8vw] border-2 border-[#c084fc] text-[#c084fc] rounded-[3vw] font-semibold"
                  data-testid="button-cancel-bottom"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 h-[12vw] text-[3.8vw] bg-[#c084fc] hover:bg-[#c084fc]/90 text-white rounded-[3vw] font-semibold shadow-lg"
                  data-testid="button-save-bottom"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="flex items-center gap-[2vw]">
                      <div className="w-[4vw] h-[4vw] border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-[4vw] h-[4vw] mr-[2vw]" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Desktop Edit Dialog */
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <DialogTitle className="text-2xl font-bold text-black">Edit Profile</DialogTitle>
                <button 
                  onClick={() => setIsEditMode(false)}
                  className="text-black/40 hover:text-black/60"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <DialogDescription className="sr-only">Edit your profile information</DialogDescription>

              <div className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <Label className="text-sm font-semibold text-black mb-2 block">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#c084fc]/30 flex items-center justify-center bg-gradient-to-br from-[#c084fc] to-[#c084fc]/70">
                      {editProfileImage ? (
                        <img src={editProfileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : currentUser?.avatar?.startsWith('data:') ? (
                        <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-2xl">{currentUser?.avatar || "?"}</span>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="bg-[#c084fc] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c084fc]/90 transition-colors">
                          Upload Photo
                        </div>
                      </label>
                      {editProfileImage && (
                        <button 
                          onClick={() => setEditProfileImage(null)}
                          className="text-red-400 text-xs mt-2 block"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* About */}
                <div>
                  <Label className="text-sm font-semibold text-black mb-2 block">About</Label>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full min-h-[120px] border-2 border-[#c084fc]/30 rounded-xl focus:border-[#c084fc] focus:ring-[#c084fc]/20 resize-none bg-white text-black"
                  />
                  <p className="text-xs text-black/60 mt-1 text-right">{editBio.length}/500</p>
                </div>

                {/* Profession */}
                <div>
                  <Label className="text-sm font-semibold text-black mb-2 block">Profession</Label>
                  <div className="flex flex-wrap gap-2">
                    {allProfessions.map((profession) => (
                      <button
                        key={profession}
                        onClick={() => toggleProfession(profession)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          editProfessions.includes(profession)
                            ? "bg-[#c084fc] text-white"
                            : "bg-gray-100 text-black/70 hover:bg-[#c084fc]/20"
                        }`}
                      >
                        {profession}
                      </button>
                    ))}
                  </div>
                  {editProfessions.length > 0 && (
                    <p className="text-xs text-[#c084fc] mt-2">Selected: {editProfessions.join(", ")}</p>
                  )}
                </div>

                {/* Genre */}
                <div>
                  <Label className="text-sm font-semibold text-black mb-2 block">Genre</Label>
                  <div className="flex flex-wrap gap-2">
                    {allGenres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          editGenres.includes(genre)
                            ? "bg-[#c084fc] text-white"
                            : "bg-gray-100 text-black/70 hover:bg-[#c084fc]/20"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  {editGenres.length > 0 && (
                    <p className="text-xs text-[#c084fc] mt-2">Selected: {editGenres.join(", ")}</p>
                  )}
                </div>

                {/* Portfolio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold text-black">Portfolio</Label>
                    <button onClick={addPortfolioItem} className="text-[#c084fc] text-sm font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Track
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editPortfolio.map((item, index) => (
                      <div key={index} className="border border-[#c084fc]/20 rounded-xl p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <Input
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...editPortfolio];
                              updated[index].title = e.target.value;
                              setEditPortfolio(updated);
                            }}
                            placeholder="Track Type"
                            className="flex-1 border-0 bg-transparent font-semibold text-[#c084fc] text-sm"
                          />
                          <button onClick={() => setEditPortfolio(editPortfolio.filter((_, i) => i !== index))} className="text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Track Image Upload */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-[#c084fc]/30 flex items-center justify-center bg-gradient-to-br from-[#c084fc]/20 to-[#c084fc]/10">
                            {item.image ? (
                              <img src={item.image} alt="Track" className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-6 h-6 text-[#c084fc]/50" />
                            )}
                          </div>
                          <div>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePortfolioImageUpload(index, e)}
                                className="hidden"
                              />
                              <div className="bg-[#c084fc]/10 text-[#c084fc] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#c084fc]/20 transition-colors">
                                {item.image ? "Change Image" : "Add Image"}
                              </div>
                            </label>
                            {item.image && (
                              <button 
                                onClick={() => {
                                  const updated = [...editPortfolio];
                                  updated[index].image = "";
                                  setEditPortfolio(updated);
                                }}
                                className="text-red-400 text-xs mt-1 block"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...editPortfolio];
                              updated[index].name = e.target.value;
                              setEditPortfolio(updated);
                            }}
                            placeholder="Track Name"
                            className="border-[#c084fc]/20 bg-white text-black"
                          />
                          <Input
                            value={item.subtitle}
                            onChange={(e) => {
                              const updated = [...editPortfolio];
                              updated[index].subtitle = e.target.value;
                              setEditPortfolio(updated);
                            }}
                            placeholder="Release Info"
                            className="border-[#c084fc]/20 bg-white text-black"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold text-black">Social Links</Label>
                    <button onClick={addSocialLink} className="text-[#c084fc] text-sm font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Link
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editSocialLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-24 text-sm font-medium text-black">{link.platform}</span>
                        <Input
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...editSocialLinks];
                            updated[index].url = e.target.value;
                            setEditSocialLinks(updated);
                          }}
                          placeholder={`Your ${link.platform} URL`}
                          className="flex-1 border-[#c084fc]/20 bg-white text-black"
                        />
                        <button onClick={() => setEditSocialLinks(editSocialLinks.filter((_, i) => i !== index))} className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Music Platforms */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold text-black">Music Platforms</Label>
                    <button onClick={addMusicLink} className="text-[#c084fc] text-sm font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Platform
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editMusicLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-28 text-sm font-medium text-black">{link.platform}</span>
                        <Input
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...editMusicLinks];
                            updated[index].url = e.target.value;
                            setEditMusicLinks(updated);
                          }}
                          placeholder={`Your ${link.platform} URL`}
                          className="flex-1 border-[#c084fc]/20 bg-white text-black"
                        />
                        <button onClick={() => setEditMusicLinks(editMusicLinks.filter((_, i) => i !== index))} className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Desktop Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#c084fc]/20">
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-[#c084fc] hover:bg-[#c084fc]/90 text-white"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}