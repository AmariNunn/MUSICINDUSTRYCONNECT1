import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Music, Eye, Heart, Plus, CheckCircle } from "lucide-react";
import type { User } from "@shared/schema";

interface ProfileCardProps {
  user: User;
  onViewProfile: () => void;
}

export default function ProfileCard({ user, onViewProfile }: ProfileCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const getAvailabilityColor = (availability: string) => {
    return availability === "Available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  return (
    <Card className="hover-lift cursor-pointer" onClick={onViewProfile}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="gradient-primary text-white font-bold">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg flex items-center">
                {user.firstName} {user.lastName}
                {user.verified && <CheckCircle className="w-4 h-4 text-blue-500 ml-2" />}
              </h3>
              <p className="text-gray-600">{user.profession}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className={`${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {user.location || "Location not specified"}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Music className="w-4 h-4 mr-2" />
            {user.genre}
          </div>
          <div className="flex items-center text-sm">
            <Badge className={`text-xs ${getAvailabilityColor(user.availability)}`}>
              {user.availability}
            </Badge>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {user.bio || "No bio available"}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span><strong>{user.followers.toLocaleString()}</strong> followers</span>
          <span><strong>{user.projects}</strong> projects</span>
        </div>

        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-[hsl(271,91%,35%)] hover:bg-[hsl(271,100%,30%)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect
          </Button>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
