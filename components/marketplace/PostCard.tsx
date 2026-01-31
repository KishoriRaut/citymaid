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

export function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Use the new can_view_contact flag from the database
  const contactVisible = post.can_view_contact && post.contact !== null;
  const isHiring = post.post_type === "employer";
  
  // Use the correct photo field based on post type
  const displayPhoto = post.post_type === "employee" ? post.employee_photo : post.photo_url;
  
  // CRITICAL DEBUG: Log exact image source
  console.log("🖼️ POSTCARD IMAGE SRC:", post.photo_url);
  console.log("👤 EMPLOYEE PHOTO:", post.employee_photo);
  console.log("🖼️ POSTCARD DISPLAY PHOTO:", displayPhoto);
  console.log("🖼️ POSTCARD CONDITION:", { 
    postType: post.post_type, 
    displayPhoto: !!displayPhoto, 
    imageError,
    hasPhotoUrl: !!post.photo_url,
    hasEmployeePhoto: !!post.employee_photo
  });
  
  // Test URL accessibility
  if (displayPhoto) {
    fetch(displayPhoto, { method: 'HEAD' })
      .then(response => {
        console.log("🔥 IMAGE ACCESSIBILITY TEST:", {
          url: displayPhoto,
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
      })
      .catch(error => {
        console.log("� IMAGE ACCESSIBILITY ERROR:", error);
      });
  }
  
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
              onError={() => {
                console.log(`❌ Photo failed to load: ${displayPhoto}`);
                console.log(`❌ Photo details:`, {
                  postId: post.id,
                  postType: post.post_type,
                  photoUrl: displayPhoto,
                  urlType: typeof displayPhoto,
                  urlLength: displayPhoto?.length
                });
                setImageError(true);
              }}
              onLoad={() => {
                console.log(`✅ Photo loaded successfully: ${displayPhoto}`);
                console.log(`✅ Photo details:`, {
                  postId: post.id,
                  postType: post.post_type,
                  photoUrl: displayPhoto
                });
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
