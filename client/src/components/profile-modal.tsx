import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, CheckCircle, Heart, Plus, Mail, Users, Briefcase } from "lucide-react";
import type { User } from "@shared/schema";

interface ProfileModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ user, open, onClose }: ProfileModalProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const getAvailabilityColor = (availability: string) => {
    return availability === "Available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="gradient-primary text-white font-bold text-2xl">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                {user.usePkaAsMain && user.pkaName ? user.pkaName : `${user.firstName} ${user.lastName}`}
                {user.verified && <CheckCircle className="w-5 h-5 text-blue-500 ml-2" />}
              </h2>
              <p className="text-gray-600 text-lg">
                {user.profession.slice(0, 2).join(", ")}
              </p>
              <p className="text-gray-500">{user.location || "Location not specified"}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6 text-center">
          <div>
            <div className="text-2xl font-bold text-[hsl(271,91%,35%)]">
              {user.followers.toLocaleString()}
            </div>
            <div className="text-gray-600">Connections</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[hsl(271,91%,35%)]">
              {user.following.toLocaleString()}
            </div>
            <div className="text-gray-600">Connected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[hsl(271,91%,35%)]">
              {user.projects}
            </div>
            <div className="text-gray-600">Projects</div>
          </div>
        </div>

        {/* About */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">About</h3>
          <p className="text-gray-700">{user.bio || "No bio available"}</p>
        </div>

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge 
                  key={index}
                  className="bg-[hsl(271,91%,35%)]/10 text-[hsl(271,91%,35%)] hover:bg-[hsl(271,91%,35%)]/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Work */}
        {user.recentWork && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Recent Work</h3>
            <p className="text-gray-700">{user.recentWork}</p>
          </div>
        )}

        {/* Genre and Availability */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Primary Genre:</span>
            <Badge variant="outline">{user.genre.slice(0, 2).join(", ")}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Availability:</span>
            <Badge className={getAvailabilityColor(user.availability)}>
              {user.availability}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4 border-t">
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Connect
          </Button>
          <Button variant="outline" className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium">
            <Mail className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button 
            variant="outline" 
            onClick={handleFavorite}
            className={isFavorited ? 'text-red-500 border-red-500 font-medium' : 'border-purple-600 text-purple-600 hover:bg-purple-50 font-medium'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
