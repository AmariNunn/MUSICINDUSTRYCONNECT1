
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PostCard from "@/components/post-card";
import type { Post, User } from "@shared/schema";
import { Image, Music, Briefcase, Users, TrendingUp, Calendar, Send, Stars, Sparkles, MessageCircle, Lightbulb } from "lucide-react";

export default function CorePage() {
  const [newPost, setNewPost] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<(Post & { author: User })[]>({
    queryKey: ["/api/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      // In a real app, we'd get the current user ID from auth context
      return apiRequest("POST", "/api/posts", { 
        userId: 1, // Mock user ID
        content,
        type: "post"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPost("");
      toast({
        title: "Post shared!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to post",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitPost = () => {
    if (!newPost.trim()) return;
    createPostMutation.mutate(newPost);
  };

  const trendingTopics = [
    { tag: "#BeatChallenge2025", posts: "1.2k" },
    { tag: "#LAMusicScene", posts: "856" },
    { tag: "#Collaboration", posts: "654" },
    { tag: "#NewRelease", posts: "432" },
  ];

  const suggestedConnections = [
    { name: "Maya Keys", profession: "Pianist", avatar: "MK" },
    { name: "Rick Drums", profession: "Drummer", avatar: "RD" },
    { name: "Luna Vibe", profession: "DJ", avatar: "LV" },
  ];

  const upcomingEvents = [
    { title: "Beat Making Workshop", date: "July 20, 2025", location: "Online", color: "border-l-purple-500" },
    { title: "LA Music Meetup", date: "July 25, 2025", location: "Los Angeles", color: "border-l-blue-500" },
    { title: "Industry Mixer", date: "Aug 1, 2025", location: "Nashville", color: "border-l-green-500" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-purple-200 rounded-3xl opacity-30 blur-3xl"></div>
          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Stars className="w-3 h-3 text-yellow-800" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Community Core
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect, collaborate, and <span className="font-semibold text-purple-600">grow with the music community</span>
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-700 mx-auto mt-4 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-purple-200">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold">
                          YU
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <Textarea
                      placeholder="Share something inspiring with the community..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="flex-1 min-h-[80px] resize-none border-purple-200 focus:border-purple-400 focus:ring-purple-200 bg-white/70 backdrop-blur-sm rounded-xl"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-xl">
                        <Image className="w-4 h-4 mr-2" />
                        Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-xl">
                        <Music className="w-4 h-4 mr-2" />
                        Audio
                      </Button>
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-xl">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Opportunity
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSubmitPost}
                      disabled={!newPost.trim() || createPostMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed Posts */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-purple-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-purple-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-purple-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-xl">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">No posts yet</h3>
                    <p className="text-gray-600 text-lg">Be the first to share something inspiring with the community!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="transform hover:scale-105 transition-all duration-300">
                    <PostCard post={post} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center py-3 hover:bg-purple-50 rounded-xl px-4 cursor-pointer transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="font-semibold text-purple-600">{topic.tag}</span>
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs font-medium">
                        {topic.posts} posts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Connections */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2" />
                  Suggested Connections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {suggestedConnections.map((connection, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-xl transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10 ring-2 ring-purple-200">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold text-sm">
                              {connection.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{connection.name}</h4>
                          <p className="text-sm text-purple-600">{connection.profession}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className={`border-l-4 ${event.color} pl-4 py-3 bg-gradient-to-r from-purple-50 to-white rounded-r-xl hover:shadow-lg transition-all duration-300 cursor-pointer`}>
                      <h4 className="font-semibold text-gray-800">{event.title}</h4>
                      <p className="text-sm text-purple-600 font-medium">{event.date} • {event.location}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-purple-50 to-purple-100 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-purple-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-3 h-3 text-white" />
                  </div>
                  Community Tips
                </h3>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-lg mb-3">💡 Engage daily for better connections!</p>
                  <p className="text-purple-600 font-medium">Click to see more tips</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">Ready to grow your network?</h3>
            <p className="opacity-90 text-lg">Connect with music professionals and discover new opportunities!</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
