"use client";

import { useState } from "react";
import type { PostWithMaskedContact } from "@/lib/types";
import { formatSalary } from "@/lib/utils";
import { formatTimeWithDetails, isFreshPost } from "@/lib/time-ago";
import UnlockContactButton from "./UnlockContactButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, MapPin } from "lucide-react";

interface PostCardProps {
  post: PostWithMaskedContact;
}

export function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Use the new can_view_contact flag from the database
  const contactVisible = post.can_view_contact && post.contact !== null;
  const isHiring = post.post_type === "employer";
  
  // Format posting time
  const timeInfo = formatTimeWithDetails(post.created_at);
  const isFresh = isFreshPost(post.created_at);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Image Section */}
        <div className="relative aspect-video mb-4 bg-muted rounded-lg overflow-hidden">
          {post.photo_url && !imageError ? (
            <img
              src={post.photo_url}
              alt={post.work}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {isHiring ? (
                <User className="w-12 h-12 text-muted-foreground" />
              ) : (
                <MapPin className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Work Type (Bold) */}
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 leading-snug">{post.work}</h3>

          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={isHiring ? "default" : "secondary"}
              className="text-xs"
            >
              {isHiring ? "Hiring" : "Looking for Work"}
            </Badge>
            
            {/* Posting Time with Fresh Indicator */}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground/70" />
              <span 
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${
                  isFresh 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-muted/60 text-muted-foreground'
                }`}
                title={timeInfo.title}
              >
                🕐 {timeInfo.relative}
              </span>
              {isFresh && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                  🔥 New
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 flex-1">
            {/* Work Schedule (Time) */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
              <span className="text-muted-foreground">
                {post.time}
              </span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
              <span className="text-muted-foreground">
                {post.place || "Location not specified"}
              </span>
            </div>
            
            {/* Salary (if applicable) */}
            {post.salary && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">💰</span>
                <span className="font-medium text-foreground">{formatSalary(post.salary)}</span>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Contact Information</p>
                {contactVisible ? (
                  <p className="text-sm text-green-600 font-medium">
                    {post.contact}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Contact hidden until payment
                  </p>
                )}
              </div>
              
              {!contactVisible && (
                <UnlockContactButton 
                  postId={post.id}
                  canViewContact={contactVisible}
                  className="shrink-0"
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
