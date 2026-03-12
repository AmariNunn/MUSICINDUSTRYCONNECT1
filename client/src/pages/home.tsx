import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { CalendarDays, Users, Handshake, Briefcase, GraduationCap, Heart, MessageCircle, Share, Eye, Mic, DollarSign, BookOpen, Calendar, TrendingUp, Star, ArrowRight, Play, MapPin, User as UserIcon } from "lucide-react";
import type { Post, User } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();
  
  const { data: posts = [], isLoading: postsLoading } = useQuery<(Post & { author: User })[]>({
    queryKey: ["/api/posts"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get logged-in user from localStorage
  const currentUserId = localStorage.getItem('currentUserId');
  
  // Fetch the specific logged-in user by their ID
  const { data: currentUser } = useQuery<User>({
    queryKey: [`/api/users/${currentUserId}`],
    enabled: !!currentUserId,
  });
  
  const isLoggedIn = !!currentUserId && !!currentUser;

  // Redirect logged-in users to their profile page
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setLocation(`/profile/${currentUser.id}`);
    }
  }, [isLoggedIn, currentUser, setLocation]);

  // Platform stats with purple theme
  const stats = [
    { icon: Users, label: "Active Members", value: "12,543", color: "text-purple-400", bgColor: "bg-purple-900/50" },
    { icon: Handshake, label: "Connections Made", value: "8,291", color: "text-purple-300", bgColor: "bg-purple-800/50" },
    { icon: Briefcase, label: "Open Opportunities", value: "2,156", color: "text-purple-200", bgColor: "bg-purple-700/50" },
    { icon: GraduationCap, label: "Learning Resources", value: "456", color: "text-purple-100", bgColor: "bg-purple-600/50" },
  ];

  // Featured sections for dynamic content
  const featuredSections = [
    {
      id: "open-mic",
      title: "Open MiC",
      subtitle: "Community Showcase",
      description: "Post and discover upcoming shows, releases, and local events",
      icon: Mic,
      color: "from-purple-600 to-purple-800",
      badge: "Free",
      badgeColor: "bg-green-500"
    },
    {
      id: "mic-is-hot",
      title: "MiC Is Hot",
      subtitle: "Paid Opportunities",
      description: "Find and post paying gigs in the music industry",
      icon: DollarSign,
      color: "from-purple-700 to-purple-900",
      badge: "Gold",
      badgeColor: "bg-yellow-500"
    },
    {
      id: "mic-check",
      title: "MiC Check",
      subtitle: "Industry Resources",
      description: "Access terminology, articles, and educational content",
      icon: BookOpen,
      color: "from-purple-800 to-black",
      badge: "Premium",
      badgeColor: "bg-blue-500"
    }
  ];

  // Trending content
  const trendingContent = [
    { type: "workshop", title: "Beat Making Masterclass", participants: 234, time: "2h ago" },
    { type: "opportunity", title: "Session Musician Needed", budget: "$500", location: "Nashville" },
    { type: "collaboration", title: "Producer Seeking Vocalist", genre: "R&B", status: "Open" },
    { type: "event", title: "Music Industry Mixer", date: "Jan 25", attendees: 89 }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <main className="min-h-screen gradient-dark-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dynamic Hero Section */}
        <section className="relative overflow-hidden rounded-3xl gradient-deep-purple p-8 lg:p-12 text-white mb-8 shadow-2xl purple-glow-strong animate-pulse-glow">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent transform -skew-y-1 animate-pulse"></div>
          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className="bg-yellow-500 text-black px-3 py-1 font-bold">Live Now</Badge>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping delay-100"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping delay-200"></div>
                  </div>
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  {isLoggedIn ? (
                    <>
                      Welcome back,
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white">
                        {currentUser.pkaName || currentUser.firstName}!
                      </span>
                    </>
                  ) : (
                    <>
                      Music Industry 
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white">
                        Connect
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                  {isLoggedIn 
                    ? "Your music community awaits. Connect, collaborate, and create the future of sound."
                    : "Where music professionals connect, collaborate, and create the future of sound together."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isLoggedIn ? (
                    <>
                      <Link href={`/profile/${currentUser.id}`}>
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-100 hover:scale-105 transition-all font-bold text-lg px-8 py-4 shadow-lg">
                          <UserIcon className="w-5 h-5 mr-2" />
                          My Profile
                        </Button>
                      </Link>
                      <Link href="/core">
                        <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium text-lg px-8 py-4 backdrop-blur-sm">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Community Feed
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/join">
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-100 hover:scale-105 transition-all font-bold text-lg px-8 py-4 shadow-lg">
                          Join the Community
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                      <Link href="/core">
                        <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium text-lg px-8 py-4 backdrop-blur-sm">
                          <Play className="w-5 h-5 mr-2" />
                          Explore Platform
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="relative animate-float">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                  <div className="relative dark-purple-card rounded-2xl p-6 purple-glow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Platform Activity</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>New Connections</span>
                        <span className="text-green-400 font-bold">+127</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Active Opportunities</span>
                        <span className="text-yellow-400 font-bold">2,156</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Online Now</span>
                        <span className="text-purple-400 font-bold">3,421</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Platform Sections */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Explore the Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.id} href="/core">
                  <Card className="group relative overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer dark-purple-card purple-glow hover:purple-glow-strong">
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-70 group-hover:opacity-90 transition-opacity`}></div>
                    <CardContent className="relative z-10 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <Badge className={`${section.badgeColor} text-white font-bold px-3 py-1`}>
                          {section.badge}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                      <p className="text-purple-100 text-sm mb-4 opacity-90">{section.subtitle}</p>
                      <p className="text-white/80 text-sm leading-relaxed">{section.description}</p>
                      <div className="mt-4 flex items-center text-sm text-white/90 group-hover:text-white">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Dynamic Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className={`relative overflow-hidden hover:transform hover:scale-105 transition-all duration-300 dark-purple-card purple-glow hover:purple-glow-strong animate-pulse-glow`} style={{animationDelay: `${index * 0.2}s`}}>
                <div className="absolute inset-0 gradient-purple-medium opacity-30"></div>
                <CardContent className="relative z-10 p-6 text-center">
                  <div className="relative animate-float" style={{animationDelay: `${index * 0.3}s`}}>
                    <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl animate-pulse"></div>
                    <Icon className={`relative w-10 h-10 ${stat.color} mx-auto mb-4 drop-shadow-lg`} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2 font-mono">{stat.value}</h3>
                  <p className="text-purple-200 text-sm font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Trending Activity Section */}
        <section className="grid lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-purple-400" />
              Trending Now
            </h3>
            <div className="space-y-4">
              {trendingContent.map((item, index) => (
                <Card key={index} className="dark-purple-card hover:purple-glow transition-all cursor-pointer transform hover:scale-102">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-purple-300 border-purple-400 text-xs">
                            {item.type}
                          </Badge>
                          {item.time && <span className="text-xs text-purple-400">{item.time}</span>}
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                        <div className="flex items-center space-x-4 text-xs text-purple-300">
                          {item.participants && <span>👥 {item.participants} joined</span>}
                          {item.budget && <span>💰 {item.budget}</span>}
                          {item.location && <span><MapPin className="w-3 h-3 inline mr-1" />{item.location}</span>}
                          {item.genre && <span>🎵 {item.genre}</span>}
                          {item.date && <span>📅 {item.date}</span>}
                          {item.attendees && <span>👥 {item.attendees} attending</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Community Activity */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Heart className="w-6 h-6 mr-3 text-purple-400" />
              Community Feed
            </h3>
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse dark-purple-card">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-purple-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 gradient-purple-medium rounded w-1/4 mb-2"></div>
                          <div className="h-3 gradient-purple-light rounded w-3/4 mb-2"></div>
                          <div className="h-3 gradient-purple-medium rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.slice(0, 3).map((post) => (
                  <Card key={post.id} className="dark-purple-card hover:purple-glow transition-all cursor-pointer transform hover:scale-102">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-purple-600 text-white font-bold text-sm">
                            {post.author.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white text-sm">{post.author.firstName} {post.author.lastName}</h4>
                            <span className="text-xs text-purple-400">{formatTimeAgo(new Date(post.createdAt))}</span>
                          </div>
                          <p className="text-purple-100 mb-3 text-sm leading-relaxed">{post.content}</p>
                          <div className="flex items-center space-x-4 text-xs">
                            <button className="flex items-center text-purple-300 hover:text-red-400 transition-colors">
                              <Heart className="w-3 h-3 mr-1" />
                              {post.likes}
                            </button>
                            <button className="flex items-center text-purple-300 hover:text-blue-400 transition-colors">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {post.comments}
                            </button>
                            <button className="flex items-center text-purple-300 hover:text-green-400 transition-colors">
                              <Share className="w-3 h-3 mr-1" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {posts.length > 3 && (
              <div className="text-center mt-6">
                <Link href="/core">
                  <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-800 bg-[#b084ca] font-medium">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Activity
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action Footer */}
        <section className="text-center py-12">
          <div className="gradient-deep-purple rounded-2xl p-8 purple-glow-strong animate-pulse-glow">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Connect?
            </h3>
            <p className="text-purple-200 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of music professionals building their careers and creating amazing music together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-100 font-bold text-lg px-8 py-4">
                  <Star className="w-5 h-5 mr-2" />
                  Join Free Today
                </Button>
              </Link>
              <Link href="/directory">
                <Button size="lg" variant="outline" className="border-purple-300 text-purple-200 hover:bg-purple-800 bg-[#b084ca] font-medium text-lg px-8 py-4">
                  <Users className="w-5 h-5 mr-2" />
                  Browse Directory
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
