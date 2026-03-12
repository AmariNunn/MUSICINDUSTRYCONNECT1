import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Users, Clock, Zap, Music2, Loader2 } from "lucide-react";
import { getGenreBadge, getProfessionBadge } from "@/lib/badges";
import goldBadge from "@assets/Gold_Level-removebg-preview_1762468528106.png";
import platinumBadge from "@assets/Platinum Level_1762468203581.png";
import type { User } from "@shared/schema";

// Helper to generate slug from user
const getUserSlug = (user: User) => {
  return `${user.firstName}-${user.lastName}`.toLowerCase().replace(/\s+/g, '-');
};

export default function DirectoryPage() {
  const [city, setCity] = useState("all");
  const [profession, setProfession] = useState("all");
  const [genre, setGenre] = useState("all");
  const [activeFilter, setActiveFilter] = useState("search");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch real users from the database
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const cities = [
    { value: "all", label: "All Cities" },
    { value: "los-angeles", label: "Los Angeles" },
    { value: "new-york", label: "New York" },
    { value: "chicago", label: "Chicago" },
    { value: "miami", label: "Miami" },
    { value: "seattle", label: "Seattle" },
    { value: "sacramento", label: "Sacramento" },
    { value: "nashville", label: "Nashville" },
    { value: "atlanta", label: "Atlanta" }
  ];

  const professions = [
    { value: "all", label: "All Professions" },
    { value: "artist", label: "Artist" },
    { value: "producer", label: "Producer" },
    { value: "dj", label: "DJ" },
    { value: "songwriter", label: "Songwriter" },
    { value: "engineer", label: "Engineer" }
  ];

  const genres = [
    { value: "all", label: "All Genres" },
    { value: "hip-hop", label: "Hip-Hop" },
    { value: "pop", label: "Pop" },
    { value: "rock", label: "Rock" },
    { value: "rnb", label: "R&B" },
    { value: "electronic", label: "Electronic" }
  ];

  const toggleFavorite = (userId: number) => {
    setFavorites(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filterUsers = () => {
    return users.filter(user => {
      const userLocation = user.location || "";
      const cityMatch = city === "all" || userLocation.toLowerCase().replace(/\s+/g, '-') === city;
      const professionMatch = profession === "all" || user.profession.some(p => p.toLowerCase() === profession);
      const genreMatch = genre === "all" || user.genre.some(g => g.toLowerCase().includes(genre));
      
      return cityMatch && professionMatch && genreMatch;
    });
  };

  const filteredUsers = filterUsers();

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="hero-card" style={{
            background: 'linear-gradient(135deg, color-mix(in oklab, #c084fc 18%, transparent), transparent 55%)',
            border: '1px solid rgba(192,132,252,0.25)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 15px 45px -18px rgba(192,132,252,0.45)'
          }}>
            <div className="eyebrow" style={{display: 'inline-flex', gap: '8px', alignItems: 'center', color: '#c084fc', fontSize: '14px', marginBottom: '6px'}}>
              Music Industry Directory
            </div>
            <h1 className="title" style={{fontWeight: 800, letterSpacing: '-0.02em', margin: '6px 0 8px', fontSize: '2.5rem', color: '#1f2937'}}>
              MiC · The Playlist
            </h1>
            <p className="subtitle" style={{color: 'rgba(17,17,17,0.6)', maxWidth: '720px', margin: 0}}>
              Discover and connect with vetted music industry professionals across roles, genres, and cities.
            </p>
          </div>
        </div>

        {/* Search Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 rounded-2xl mb-6 transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            {/* Filter Navigation - Hidden */}
            <div className="hidden">
              <Button
                variant={activeFilter === "trending" ? "default" : "outline"}
                size="sm"
                className={`${
                  activeFilter === "trending" 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "border-purple-500 text-purple-300 hover:bg-purple-800"
                } font-medium rounded-full px-3 sm:px-6 text-sm sm:text-base`}
                onClick={() => setActiveFilter("trending")}
              >
                🌟 Trending
              </Button>
              <Button
                variant={activeFilter === "favorites" ? "default" : "outline"}
                size="sm"
                className={`${
                  activeFilter === "favorites" 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "border-purple-500 text-purple-300 hover:bg-purple-800"
                } font-medium rounded-full px-3 sm:px-6 text-sm sm:text-base`}
                onClick={() => setActiveFilter("favorites")}
              >
                ⭐ Favorites
              </Button>
            </div>

            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="bg-white border-purple-300 text-gray-700 rounded-full h-10 sm:h-11 text-sm sm:text-base shadow-sm hover:border-purple-400 transition-all">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200 shadow-lg">
                    {cities.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-gray-700 hover:bg-purple-50 focus:bg-purple-100">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={profession} onValueChange={setProfession}>
                  <SelectTrigger className="bg-white border-purple-300 text-gray-700 rounded-full h-10 sm:h-11 text-sm sm:text-base shadow-sm hover:border-purple-400 transition-all">
                    <SelectValue placeholder="All Professions" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200 shadow-lg">
                    {professions.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="text-gray-700 hover:bg-purple-50 focus:bg-purple-100">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-white border-purple-300 text-gray-700 rounded-full h-10 sm:h-11 text-sm sm:text-base shadow-sm hover:border-purple-400 transition-all">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200 shadow-lg">
                    {genres.map((g) => (
                      <SelectItem key={g.value} value={g.value} className="text-gray-700 hover:bg-purple-50 focus:bg-purple-100">
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 py-2 from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-full px-6 sm:px-8 h-10 sm:h-11 text-sm sm:text-base w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-[#c084fc]">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#c084fc]" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No professionals found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredUsers.map((user) => {
              const displayName = user.usePkaAsMain && user.pkaName 
                ? user.pkaName 
                : `${user.firstName} ${user.lastName}`;
              const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
              const primaryProfession = user.profession[0] || "Professional";
              const primaryGenre = user.genre[0] || "Various";
              
              return (
                <Link key={user.id} href={`/profile/${getUserSlug(user)}`}>
                  <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white border border-purple-200/40 hover:border-purple-400 transition-all duration-300 cursor-pointer rounded-2xl hover:scale-[1.02] transform" style={{boxShadow: '0 15px 45px -18px rgba(192,132,252,0.25)', background: 'linear-gradient(135deg, color-mix(in oklab, #c084fc 18%, transparent), transparent 55%)'}}>
                    <CardContent className="p-4 relative bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
                    {/* Header with Name, Profession, and Verification */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-200">
                          <span className="text-white font-bold text-sm">
                            {initials}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-800 font-bold text-lg">{displayName}</h3>
                            {user.memberLevel === "Platinum" && (
                              <img src={platinumBadge} alt="Platinum Member" className="w-5 h-5 object-contain" />
                            )}
                            {user.memberLevel === "Gold" && (
                              <img src={goldBadge} alt="Gold Member" className="w-5 h-5 object-contain" />
                            )}
                          </div>
                          <p className="text-purple-600 font-semibold text-sm">{primaryProfession}</p>
                        </div>
                      </div>
                      
                      {/* Favorite Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-10 h-10 rounded-full border-2 shadow-lg transition-all duration-300 hover:scale-110 ${
                          favorites.includes(user.id)
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-400 text-white hover:from-yellow-500 hover:to-yellow-600 shadow-yellow-500/30"
                            : "border-purple-300 text-purple-400 hover:border-yellow-400 hover:text-yellow-500 bg-white/70 backdrop-blur-sm hover:bg-yellow-50"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(user.id);
                        }}
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(user.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    {/* Skills Row */}
                    {user.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {user.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs px-3 py-1 rounded-full shadow-lg shadow-purple-500/30 border border-purple-400/20">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Location, Genre and Connections */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 uppercase tracking-wide font-semibold">Location</p>
                          <p className="text-gray-800 text-sm font-bold">{user.location || "Not specified"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-purple-700 rounded-full flex items-center justify-center p-1 shadow-lg">
                          {getGenreBadge(primaryGenre) ? (
                            <img 
                              src={getGenreBadge(primaryGenre)!} 
                              alt={`${primaryGenre} badge`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Music2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-[#c084fc] uppercase tracking-wide font-semibold">Genre</p>
                          <p className="text-gray-800 text-sm font-bold">{primaryGenre}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 uppercase tracking-wide font-semibold">Connections</p>
                          <p className="text-gray-800 text-sm font-bold">{user.connections || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bio/Recent Work */}
                    {(user.bio || user.recentWork) && (
                      <div className="pt-4 mt-4 border-t border-purple-200">
                        <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-3">
                          <p className="text-xs text-purple-600 uppercase tracking-wide mb-2 font-semibold">About</p>
                          <p className="text-gray-700 text-sm font-medium line-clamp-2">{user.bio || user.recentWork}</p>
                        </div>
                      </div>
                    )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${users.length > 0 ? Math.min((filteredUsers.length / users.length) * 100, 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex justify-center gap-6 text-purple-400">
            <a href="#" className="hover:underline font-medium">Privacy</a>
            <a href="#" className="hover:underline font-medium">Terms</a>
            <a href="#" className="hover:underline font-medium">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}