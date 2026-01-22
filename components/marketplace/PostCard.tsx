"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import type { PostWithMaskedContact } from "@/lib/types";
import { maskContact } from "@/lib/utils";

interface PostCardProps {
  post: PostWithMaskedContact;
}

export function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  const contactVisible = post.contact !== null;
  const maskedContact = post.contact ? maskContact(post.contact) : "****";
  const isHiring = post.post_type === "employer";

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col transform hover:-translate-y-1">
      {/* Header: Badge and Time */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
            isHiring
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
              : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {isHiring ? "HIRING" : "LOOKING FOR WORK"}
        </span>
        <span className="text-xs text-muted-foreground font-medium">{post.time}</span>
      </div>

      {/* Photo or Placeholder */}
      <div className="relative w-full mb-4 rounded-lg overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
        {isHiring ? (
          // Employer posts: Always show briefcase icon (never show photos)
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <svg
              className="w-12 h-12 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs mt-2 opacity-75">No photo</p>
          </div>
        ) : post.photo_url && !imageError ? (
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
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <svg
              className="w-12 h-12 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-xs mt-2 opacity-75">No photo available</p>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg mb-4 text-foreground line-clamp-2">{post.work}</h3>

      {/* Details */}
      <div className="space-y-2.5 mb-4 flex-1">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-muted-foreground">{post.place}</span>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold text-foreground">{post.salary}</span>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 text-sm pt-1 border-t">
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {contactVisible ? (
            <span className="text-foreground font-medium">{post.contact}</span>
          ) : (
            <span className="font-mono text-muted-foreground">{maskedContact}</span>
          )}
        </div>
      </div>

      {/* CTA Button */}
      {!contactVisible && (
        <div className="mt-auto space-y-2">
          <Link href={`${appConfig.routes.unlock}/${post.id}`} className="block">
            <Button className="w-full" size="lg">
              🔓 Unlock Contact
            </Button>
          </Link>
          <p className="text-xs text-center text-muted-foreground">
            Unlock contact after payment
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Secure contact</span>
          </div>
        </div>
      )}
    </div>
  );
}
