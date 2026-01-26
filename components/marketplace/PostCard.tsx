"use client";

import { useState } from "react";
import type { PostWithMaskedContact } from "@/lib/types";
import { formatSalary } from "@/lib/utils";
import { formatTimeWithDetails, isFreshPost } from "@/lib/time-ago";
import { User, Clock, MapPin, DollarSign, Phone } from "lucide-react";
import UnlockContactButton from "./UnlockContactButton";

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
    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col transform hover:-translate-y-0.5 h-full">
      {/* Role Badge at Top */}
      <div className="mb-3">
        <span
          className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide ${
            isHiring
              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
              : "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent"
          }`}
        >
          {isHiring ? "HIRE A WORKER" : "FIND A JOB"}
        </span>
      </div>

      {/* Photo or Placeholder - Only for Employee Posts */}
      {!isHiring && (
        <div className="relative w-full mb-4 rounded-lg overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
          {post.photo_url && !imageError ? (
            // Employee posts: Show photo if available
            <img
              src={post.photo_url}
              alt={post.work}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            // Employee posts: Show user icon if no photo
            <div className="flex items-center justify-center text-muted-foreground">
              <User className="w-12 h-12 opacity-40" />
            </div>
          )}
        </div>
      )}

      {/* Work Type (Bold) */}
      <h3 className="font-semibold text-lg mb-3 text-foreground line-clamp-2 leading-snug">{post.work}</h3>

      {/* Posting Time with Fresh Indicator */}
      <div className="mb-4 flex items-center gap-2">
        <span 
          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md ${
            isFresh 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-muted/60 text-muted-foreground'
          }`}
          title={timeInfo.title}
        >
          🕐 {timeInfo.relative}
        </span>
        {isFresh && (
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            🔥 New
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3 mb-5 flex-1">
        {/* Work Schedule (Time) */}
        <div className="flex items-center gap-2.5 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
          <span className="text-muted-foreground leading-relaxed">{post.time}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2.5 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
          <span className="text-muted-foreground leading-relaxed">{post.place}</span>
        </div>

        {/* Salary (Formatted) */}
        <div className="flex items-center gap-2.5 text-sm">
          <DollarSign className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
          <span className="font-semibold text-foreground leading-relaxed">{formatSalary(post.salary)}</span>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2.5 text-sm pt-3 border-t border-border/50">
          <Phone className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
          {contactVisible ? (
            <span className="text-foreground font-medium">{post.contact}</span>
          ) : (
            <span className="font-mono text-muted-foreground">{post.contact || "****"}</span>
          )}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="mt-auto space-y-2.5 pt-2">
        {/* Contact Unlock Button */}
        {!contactVisible && (
          <>
            <UnlockContactButton 
              postId={post.id}
              canViewContact={contactVisible}
              className="font-medium shadow-sm hover:shadow transition-shadow duration-200"
            >
              🔓 Unlock Contact — Rs. 50
            </UnlockContactButton>
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Small verification fee to protect workers from spam and misuse.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
