import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share } from "lucide-react";
import type { Post, User } from "@shared/schema";

interface PostCardProps {
  post: Post & { author: User };
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

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

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return "bg-green-100 text-green-800";
      case "tip":
        return "bg-blue-100 text-blue-800";
      case "milestone":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="gradient-light-accent text-white font-bold">
              {post.author.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold">{post.author.firstName} {post.author.lastName}</h3>
                {post.type !== "post" && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                    {post.type}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">{formatTimeAgo(new Date(post.createdAt))}</span>
            </div>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                className={`p-0 h-auto font-normal transition-colors ${
                  liked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                {likeCount} likes
              </Button>
              <Button variant="ghost" size="sm" className="p-0 h-auto font-normal text-gray-500 hover:text-blue-500">
                <MessageCircle className="w-4 h-4 mr-1" />
                {post.comments} comments
              </Button>
              <Button variant="ghost" size="sm" className="p-0 h-auto font-normal text-gray-500 hover:text-green-500">
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
