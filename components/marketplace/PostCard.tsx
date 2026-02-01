"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PostWithMaskedContact } from "@/lib/types";
import { formatSalary } from "@/lib/utils";
import { formatTimeWithDetails, isFreshPost } from "@/lib/time-ago";
import UnlockContactButton from "./UnlockContactButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, MapPin, DollarSign, Shield, Star, Briefcase } from "lucide-react";

interface PostCardProps {
  post: PostWithMaskedContact;
}

export function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  
  // Use the new can_view_contact flag from the database
  const contactVisible = post.can_view_contact && post.contact !== null;
  const isHiring = post.post_type === "employer";
  
  // Use the correct photo field based on post type
  const displayPhoto = post.post_type === "employee" ? post.employee_photo : post.photo_url;
  
  // Format posting time
  const timeInfo = formatTimeWithDetails(post.created_at);
  const isFresh = isFreshPost(post.created_at);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
      {/* Header with Image */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {displayPhoto && !imageError ? (
            <img
              src={displayPhoto}
              alt={post.work}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              onLoad={() => {
                // Image loaded successfully
              }}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {isHiring ? (
                  <User className="w-16 h-16 text-muted-foreground/50 mx-auto mb-2" />
                ) : (
                  <MapPin className="w-16 h-16 text-muted-foreground/50 mx-auto mb-2" />
                )}
                <p className="text-xs text-muted-foreground/50">
                  {isHiring ? "No Photo" : "No Photo"}
                </p>
              </div>
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

        {/* Details */}
        {post.details && (
          <div className="mb-4">
            {/* Debug: Show details length */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-red-500 mb-1">
                Debug: details length = {post.details?.length || 0} | 
                Read more condition: {post.details?.length > 80 ? 'TRUE' : 'FALSE'} |
                Preview: "{post.details?.substring(0, 50)}..."
              </div>
            )}
            <div className="text-sm text-muted-foreground mb-2">
              {isHiring ? (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Job Details</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">About Me</span>
                </div>
              )}
            </div>
            <div className="relative">
              <p className="text-sm text-foreground leading-relaxed text-gray-700 dark:text-gray-300">
                {post.details.length > 80 ? `${post.details.substring(0, 80)}...` : post.details}
              </p>
              {post.details.length > 80 && (
                <span 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer ml-1 underline"
                  onClick={() => router.push(`/post/${post.id}`)}
                >
                  Read more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Debug: Show if details is missing */}
        {process.env.NODE_ENV === 'development' && !post.details && (
          <div className="text-xs text-red-500 mb-4">
            Debug: No details field found for post {post.id}
          </div>
        )}

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
