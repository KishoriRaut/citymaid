"use client";

import { useState } from "react";
import type { PostWithMaskedContact } from "@/lib/types";
import { formatSalary } from "@/lib/utils";
import { formatTimeWithDetails, isFreshPost } from "@/lib/time-ago";
import UnlockContactButton from "./UnlockContactButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, MapPin, DollarSign, Shield, Star } from "lucide-react";

interface PostCardProps {
  post: PostWithMaskedContact;
}

export function PostCardFixed({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Debug: Log photo URL when component renders
  console.log(`🖼️ PostCardFixed rendering - photo_url:`, post.photo_url);
  console.log(`🖼️ PostCardFixed rendering - post_type:`, post.post_type);
  console.log(`🖼️ PostCardFixed rendering - work:`, post.work);
  
  // Use the new can_view_contact flag from the database
  const contactVisible = post.can_view_contact && post.contact !== null;
  const isHiring = post.post_type === "employer";
  
  // Format posting time
  const timeInfo = formatTimeWithDetails(post.created_at);
  const isFresh = isFreshPost(post.created_at);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
      {/* Header with Image */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {post.photo_url && !imageError ? (
            <div className="relative w-full h-full">
              <img
                src={post.photo_url}
                alt={post.work}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => {
                  console.log(`❌ Image failed to load: ${post.photo_url}`);
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log(`✅ Image loaded successfully: ${post.photo_url}`);
                  setImageLoaded(true);
                }}
                crossOrigin="anonymous"
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              {isHiring ? (
                <div className="text-center">
                  <User className="w-16 h-16 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/50">No Photo</p>
                </div>
              ) : (
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/50">No Photo</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={isHiring ? "default" : "secondary"}
            className="text-xs font-semibold px-2 py-1"
          >
            {isHiring ? "🏢 Hiring" : "👤 Job Seeker"}
          </Badge>
        </div>
        
        {/* Fresh Badge */}
        {isFresh && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-green-500 text-white text-xs font-semibold px-2 py-1">
              🔥 New
            </Badge>
          </div>
        )}
        
        {/* Photo Status Badge */}
        {post.photo_url && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="outline" className="text-xs bg-white/90">
              {imageLoaded ? "📷 Photo" : "⏳ Loading"}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-5">
        {/* Title */}
        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.work}
        </h3>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{timeInfo.relative}</span>
          </div>
          {post.salary && (
            <div className="flex items-center gap-1 font-medium text-foreground">
              <DollarSign className="w-4 h-4" />
              <span>{formatSalary(post.salary)}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{post.place || "Location not specified"}</span>
        </div>

        {/* Work Schedule */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{post.time}</span>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-muted-foreground mb-2 p-2 bg-gray-50 rounded">
          <div>Photo URL: {post.photo_url ? "✅ Present" : "❌ Missing"}</div>
          <div>Image Status: {imageLoaded ? "✅ Loaded" : imageError ? "❌ Error" : "⏳ Loading"}</div>
        </div>

        {/* Unlock Contact Button */}
        {!contactVisible && (
          <div className="mb-4">
            <UnlockContactButton 
              postId={post.id}
              canViewContact={contactVisible}
              className="w-full"
            />
          </div>
        )}

        {/* Divider */}
        <div className="border-t my-4"></div>

        {/* Trust Indicators */}
        <div className="border-t mt-4 pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Verified Posting</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>Trusted Platform</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
