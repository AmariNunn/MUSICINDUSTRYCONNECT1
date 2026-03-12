import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Music, Users, Briefcase, Loader2 } from "lucide-react";
import ProfileCard from "@/components/profile-card";
import ProfileModal from "@/components/profile-modal";
import type { User } from "@shared/schema";

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [profession, setProfession] = useState("all");
  const [genre, setGenre] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", { query: searchQuery, profession: profession === "all" ? "" : profession, genre: genre === "all" ? "" : genre }],
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const professions = [
    { value: "Artist", label: "Artist - Singer, Rapper, Performer" },
    { value: "Administration", label: "Administration - Registrations, Royalties, Licensing, Copyrights" },
    { value: "Audio", label: "Audio - Engineering, Mixing, Recording, Live Sound, Mastering" },
    { value: "Consultant", label: "Consultant - Coaching, Development, Promotions, Marketing, Strategy" },
    { value: "Dancer", label: "Dancer - Dancers, Choreographers" },
    { value: "DJ", label: "DJ - Clubs, Parties, Radio" },
    { value: "Educator", label: "Educator - Teachers, Professors, Educators" },
    { value: "Fashion", label: "Fashion - Designers, Stylists" },
    { value: "Glam", label: "Glam - Hair Stylists, Makeup Artists" },
    { value: "Legal", label: "Legal - Lawyers, Attorneys, Legal Affairs, Negotiations" },
    { value: "Management", label: "Management - Artist, Business, Financial, Touring" },
    { value: "Marketing", label: "Marketing - Digital Marketing, Social Media, PR, Branding" },
    { value: "Music Executive", label: "Music Executive - A&R, Label Reps, GMs, Presidents, VPs" },
    { value: "Musician", label: "Musician - Sessions, Background, Touring" },
    { value: "Photographer/Videographer", label: "Photographer/Videographer - Photos, Videos, Editing" },
    { value: "Producer", label: "Producer - Beat Maker, Executive Producer" },
    { value: "Publishing", label: "Publishing - Music Publishing" },
    { value: "Radio/Podcast", label: "Radio/Podcast - Host, Producers, Personalities" },
    { value: "Record Label", label: "Record Label - Runs or Works at a Label" },
    { value: "Recording Studio", label: "Recording Studio - Owns or Works at Recording Space" },
    { value: "Songwriter", label: "Songwriter - Writes and Composes Music/Lyrics" },
    { value: "Synch", label: "Synch - Music Supervisors, Synch Reps, Licensors" },
    { value: "Touring", label: "Touring - Agents, Roadies, Stage Managers, Crew" },
    { value: "Venue", label: "Venue - Bars, Clubs, Creative Spaces" },
  ];

  const genres = [
    { value: "Pop", label: "Pop" },
    { value: "Hip-Hop", label: "Hip-Hop / Rap" },
    { value: "R&B", label: "R&B / Soul" },
    { value: "Rock", label: "Rock" },
    { value: "Country", label: "Country / Folk / Americana" },
    { value: "Electronic", label: "Electronic / EDM / Techno" },
    { value: "Dance", label: "Dance / House" },
    { value: "Reggae", label: "Reggae / Dancehall" },
    { value: "Latin", label: "Latin (Reggaetón, Bachata, Salsa)" },
    { value: "Afrobeats", label: "Afrobeats / Afro-Fusion" },
    { value: "Classical", label: "Classical / Opera" },
    { value: "Jazz", label: "Jazz" },
    { value: "Blues", label: "Blues" },
    { value: "Gospel", label: "Gospel / Christian / Inspirational" },
  ];

  const quickFilters = [
    "Los Angeles", "New York", "Nashville", "Available Now"
  ];

  const totalMembers = users.length;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-white">Music Industry Directory</h1>
            <p className="text-gray-300">Discover and connect with music industry professionals</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{totalMembers}</div>
            <div className="text-sm text-gray-400">Total Members</div>
          </div>
        </div>

      {/* The Playlist Section */}
      <div className="mb-8">
        <div className="bg-purple-600 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">The Playlist</h2>
          <p className="text-purple-100">The complete list of all MiC members</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search Professionals</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, skills, or location..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Profession</label>
              <Select value={profession} onValueChange={setProfession}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Professions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Professions</SelectItem>
                  {professions.map((prof) => (
                    <SelectItem key={prof.value} value={prof.value}>
                      {prof.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Genre</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {quickFilters.map((filter) => (
              <Badge 
                key={filter}
                variant="secondary" 
                className="cursor-pointer hover:bg-[hsl(271,91%,35%)] hover:text-white transition-colors"
                onClick={() => handleSearch(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-300">
          <span className="font-semibold text-purple-400">{users.length}</span> professionals found
        </p>
        <Select defaultValue="relevance">
          <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="recent">Recent Activity</SelectItem>
            <SelectItem value="connections">Most Connected</SelectItem>
            <SelectItem value="newest">Newest Members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(271,91%,35%)]" />
        </div>
      ) : users.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No professionals found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={() => {
              setSearchQuery("");
              setProfession("");
              setGenre("");
            }} className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-900 border-gray-700 border rounded-lg p-6 hover:border-purple-500 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {user.usePkaAsMain && user.pkaName ? user.pkaName : `${user.firstName} ${user.lastName}`}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      {user.profession.slice(0, 2).map((prof, index) => (
                        <span key={index} className="flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {prof}
                          {index < user.profession.length - 1 && index < 1 && <span className="mx-1">|</span>}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                      {user.genre.slice(0, 2).map((genre, index) => (
                        <span key={index} className="flex items-center">
                          <Music className="w-3 h-3 mr-1" />
                          {genre}
                          {index < user.genre.length - 1 && index < 1 && <span className="mx-1">|</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {user.bio && (
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">{user.bio}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{user.location}</span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {user.followers} followers
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More (placeholder for future pagination) */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" disabled className="border-gray-600 text-gray-400 font-medium">
              All results loaded
            </Button>
          </div>
        </>
      )}

        {/* Profile Modal */}
        {selectedUser && (
          <ProfileModal
            user={selectedUser}
            open={!!selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </main>
    </div>
  );
}
