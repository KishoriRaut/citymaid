"use client";

import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from "react";
import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { PostWithMaskedContact } from "@/lib/types";
import { EnvironmentCheck } from "@/components/EnvironmentCheck";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { PostCard } from "@/components/marketplace/PostCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination, LoadMoreButton } from "@/components/ui/pagination";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { registerCreatePostHandler, registerCreateProfileHandler, registerPostJobHandler, registerFAQHandler, registerContactHandler, registerHowItWorksHandler } from "@/components/layout/ConditionalHeader";
import { useToast } from "@/hooks/use-toast";

// Libs
import { createPost } from "@/lib/posts";
import { getGroupedWorkTypes, isOtherWorkType } from "@/lib/work-types";
import { getGroupedTimeOptions, isOtherTimeOption } from "@/lib/work-time";
import { uploadPhoto } from "@/lib/storage";

// Form Schema
const formSchema = z.object({
  post_type: z.enum(["employer", "employee"]),
  work: z.string().min(1, "Please select a work type"),
  workOther: z.string().optional(),
  time: z.string().min(1, "Please select a time option"),
  timeOther: z.string().optional(),
  place: z.string().min(1, "Please enter a location"),
  salary: z.string().min(1, "Please enter a salary"),
  contact: z.string().min(1, "Please enter contact information"),
  details: z.string().min(10, "Please provide at least 10 characters").max(500, "Details must be less than 500 characters"),
  photo: z.any().refine((data) => {
    // If employee post, photo is required
    if (data?.post_type === "employee") {
      return data && data instanceof File && data.size > 0;
    }
    // If employer post, photo is optional
    return true;
  }, {
    message: "Photo is required for employee posts"
  }),
});

// Static Marketing Banner Component - Won't re-render on tab changes
function MarketingBanner() {
  const router = useRouter();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      {/* Banner removed completely */}
    </div>
  );
}

// FAQ Component - Placeholder
function FAQContent() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
          <p className="text-gray-600 mb-2">Frequently Asked Questions</p>
          <p className="text-sm text-gray-500">No content available for now</p>
          <p className="text-xs text-gray-400 mt-4">FAQ section coming soon...</p>
        </div>
      </div>
    </div>
  );
}

// Contact Component - Placeholder
function ContactContent() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
          <p className="text-gray-600 mb-2">Contact Information</p>
          <p className="text-sm text-gray-500">No content available for now</p>
          <p className="text-xs text-gray-400 mt-4">Contact section coming soon...</p>
        </div>
      </div>
    </div>
  );
}

// How It Works Component - Based on About page content
function HowItWorksContent() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn how CityMaid connects trusted domestic workers with families across Nepal
          </p>
        </div>

        <div className="space-y-8">
          {/* For Families Section */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-xl mb-4 text-gray-900 flex items-center gap-2">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              For Families
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Browse Available Candidates</p>
                  <p className="text-gray-600 text-sm">Find background-checked domestic workers for cooking, cleaning, childcare, and elderly care</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Post Your Requirements</p>
                  <p className="text-gray-600 text-sm">Create a job post with your specific needs and requirements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Connect & Hire</p>
                  <p className="text-gray-600 text-sm">Contact workers directly and arrange interviews</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-gray-600 text-sm">Pay securely through our platform with escrow protection</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Workers Section */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-xl mb-4 text-gray-900 flex items-center gap-2">
              <span className="text-2xl">💼</span>
              For Workers
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Create Your Profile</p>
                  <p className="text-gray-600 text-sm">Register for free and showcase your skills and experience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Get Verified</p>
                  <p className="text-gray-600 text-sm">Complete background verification to build trust with families</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Find Available Jobs</p>
                  <p className="text-gray-600 text-sm">Browse job postings and apply to positions that match your skills</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <div>
                  <p className="font-medium">Get Paid Securely</p>
                  <p className="text-gray-600 text-sm">Receive timely payments through our secure payment system</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Features */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold text-xl mb-4 text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              Platform Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">🔍 Background Checks</h4>
                <p className="text-blue-700 text-sm">All workers undergo thorough verification for your safety</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">💳 Secure Payments</h4>
                <p className="text-green-700 text-sm">Escrow protection ensures safe transactions</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">⭐ Rating System</h4>
                <p className="text-purple-700 text-sm">Build reputation through honest reviews</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">📞 Direct Communication</h4>
                <p className="text-orange-700 text-sm">Chat directly with workers or families</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="text-center bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Trusted by Thousands</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Families Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
                <div className="text-gray-600">Verified Workers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">7</div>
                <div className="text-gray-600">Major Cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function PostCreation({ onClose, postType = "employee" }: { onClose: () => void; postType?: "employee" | "employer" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize form - always called in same order
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      post_type: postType,
      work: "",
      workOther: "",
      workTime: "",
      timeOther: "",
      place: "",
      salary: "",
      contact: "",
      details: "",
      photo: undefined,
    },
  });

  // Watch post_type to show/hide photo upload - always called in same order
  const currentPostType = form.watch("post_type");
  const workValue = form.watch("work");
  const timeValue = form.watch("time");

  // Prevent SSR issues with react-hook-form
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      console.log("📝 Form values submitted:", values);
      
      // Handle photo upload for both employer and employee posts
      let photoUrl: string | null = null;
      let employeePhotoUrl: string | null = null;
      
      if (values.photo) {
        const { url, error: uploadError } = await uploadPhoto(values.photo);
        if (uploadError) {
          console.error("❌ Photo upload error:", uploadError);
          throw new Error(uploadError);
        }
        
        // For employee posts, this is the employee profile photo
        if (values.post_type === "employee") {
          employeePhotoUrl = url;
        } else {
          // For employer posts, this is the post photo
          photoUrl = url;
        }
      }

      // Prepare post data
      const postData = {
        post_type: values.post_type,
        work: values.work === "Other" ? values.workOther || "" : values.work,
        time: values.time === "Other" ? values.timeOther || "" : values.time,
        place: values.place,
        salary: values.salary,
        contact: values.contact,
        details: values.details,
        photo_url: photoUrl,
        employee_photo: employeePhotoUrl,
      };

      // Submit post
      const { post, error } = await createPost(postData);
      if (error) throw new Error(error);

      // Show success message
      toast({
        title: "Success",
        description: "Post submitted successfully! Redirecting to payment page...",
      });

      // Redirect to payment page
      setTimeout(() => {
        router.push(`/post-payment/${post?.id}`);
      }, 1000);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while creating your post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {postType === "employer" ? (
                  <>
                    <span className="text-primary">💼</span> Post a Job Requirement
                  </>
                ) : (
                  <>
                    <span className="text-primary">👤</span> Create Your Work Profile
                  </>
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                {postType === "employer" 
                  ? "Find the perfect worker for your needs"
                  : "Showcase your skills and find opportunities"
                }
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Hidden post_type field */}
              <FormField
                control={form.control}
                name="post_type"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <input {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Work Type */}
              <FormField
                control={form.control}
                name="work"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        {currentPostType === "employer" ? (
                          <span className="text-primary">🔧</span>
                        ) : (
                          <span className="text-primary">💪</span>
                        )}
                      </div>
                      {currentPostType === "employer" ? "Job Category" : "Skills & Services"}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary">
                          <SelectValue placeholder={
                            currentPostType === "employer" 
                              ? "Select job category" 
                              : "Select your skills/services"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getGroupedWorkTypes().map((group) => (
                          <div key={group.label}>
                            <div className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                              {group.label}
                            </div>
                            {group.types.map((workType) => (
                              <SelectItem key={workType} value={workType}>
                                {workType}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Options */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary">⏰</span>
                      </div>
                      {postType === "employer" ? "Work Schedule" : "Availability"}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary">
                          <SelectValue placeholder={
                            postType === "employer" 
                              ? "Select work schedule" 
                              : "Select your availability"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getGroupedTimeOptions().map((group) => (
                          <div key={group.label}>
                            <div className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                              {group.label}
                            </div>
                            {group.types.map((timeOption) => (
                              <SelectItem key={timeOption} value={timeOption}>
                                {timeOption}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Place Input */}
              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary">📍</span>
                      </div>
                      {postType === "employer" ? "Job Location" : "Work Location"}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Kathmandu, Lalitpur, Remote" 
                        className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary Input */}
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary">💰</span>
                      </div>
                      {postType === "employer" ? "Compensation" : "Expected Salary"}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          postType === "employer" 
                            ? "e.g., NPR 15,000/month, Negotiable" 
                            : "e.g., NPR 15,000-20,000/month"
                        } 
                        className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Input */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary">📞</span>
                      </div>
                      {postType === "employer" ? "Contact Information" : "Contact Details"}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={
                          postType === "employer" 
                            ? "Phone, email, best time to contact" 
                            : "Phone, email, LinkedIn, portfolio"
                        } 
                        className="min-h-[120px] text-base border-gray-300 focus:border-primary focus:ring-primary resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Details Input */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        {postType === "employer" ? (
                          <span className="text-primary">📋</span>
                        ) : (
                          <span className="text-primary">👤</span>
                        )}
                      </div>
                      {postType === "employer" ? "Job Details" : "Personal Details"}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={
                          postType === "employer" 
                            ? "Job responsibilities, requirements, work environment..." 
                            : "Your skills, experience, qualifications, achievements..."
                        } 
                        className="min-h-[150px] text-base border-gray-300 focus:border-primary focus:ring-primary resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Upload */}
              <FormField
                control={form.control}
                name="photo"
                render={({ field: { onChange, ref } }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary">📷</span>
                      </div>
                      {postType === "employer" ? "Job Photo" : "Professional Photo"}
                      <span className="text-muted-foreground ml-2">
                        {postType === "employee" ? "(Required)" : "(Optional)"}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                        }}
                        ref={ref}
                        required={postType === "employee"}
                        className="text-base border-gray-300 focus:border-primary focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  size="lg"
                  className="h-12 px-8 text-base font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  size="lg"
                  className="h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {postType === "employer" ? "Posting Job..." : "Creating Profile..."}
                    </>
                  ) : (
                    postType === "employer" ? "Post Job" : "Create Profile"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
function JobTypeTabs({ activeTab, onTabChange }: { 
  activeTab: "all" | "employer" | "employee";
  onTabChange: (tab: "all" | "employer" | "employee") => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 mb-6 sm:mb-8 bg-gray-100 p-2 sm:p-1 rounded-lg">
      <button
        className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all ${
          activeTab === "employee" 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => onTabChange("employee")}
      >
        <span className="text-xs sm:text-sm">Available Jobs</span>
      </button>
      <button
        className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all ${
          activeTab === "employer" 
            ? "bg-white text-gray-900 shadow-sm" 
            : "text-gray-600 hover:text-gray-900"
        }`}
        onClick={() => onTabChange("employer")}
      >
        <span className="text-xs sm:text-sm">Available Candidates</span>
      </button>
    </div>
  );
}
function PostsGrid({ 
  posts, 
  isLoading, 
  isTabChanging 
}: { 
  posts: PostWithMaskedContact[];
  isLoading: boolean;
  isTabChanging: boolean;
}) {
  if (isTabChanging) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading posts...</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mb-8 w-full opacity-30">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No posts found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// Static FilterBar Component - Memoized to prevent re-renders
const StaticFilterBar = React.memo(function StaticFilterBar({ 
  filters, 
  onFilterChange 
}: { 
  filters: {
    work: string;
    time: string;
    postedTime: string;
    place: string;
    salary: string;
  };
  onFilterChange: (filters: any) => void;
}) {
  return (
    <FilterBar 
      workFilter={filters.work}
      timeFilter={filters.time}
      postedTimeFilter={filters.postedTime}
      placeFilter={filters.place}
      salaryFilter={filters.salary}
      onWorkChange={(value) => onFilterChange({ ...filters, work: value })}
      onTimeChange={(value) => onFilterChange({ ...filters, time: value })}
      onPostedTimeChange={(value) => onFilterChange({ ...filters, postedTime: value })}
      onPlaceChange={(value) => onFilterChange({ ...filters, place: value })}
      onSalaryChange={(value) => onFilterChange({ ...filters, salary: value })}
      onReset={() => onFilterChange({ work: "All", time: "All", postedTime: "all", place: "", salary: "" })}
    />
  );
});
function PageHeader() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl">Opportunities</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Stable Section Component - Completely separate from tab logic
function StableSection() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <MarketingBanner />
    </div>
  );
}

function HomePageContent({ activeTab, isTabChanging }: { activeTab: "all" | "employer" | "employee"; isTabChanging: boolean }) {
  // State management
  const [posts, setPosts] = useState<PostWithMaskedContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Ref to store the latest loadPosts function
  const loadPostsRef = useRef<typeof loadPosts | null>(null);
  
  // Filters - simplified since we're not using them right now
  const [filters] = useState({
    work: "All",
    time: "All",
    postedTime: "all",
    place: "",
    salary: "",
  });

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle create post
  const handleCreatePost = useCallback(() => {
    console.log('handleCreatePost called, setting showCreatePost to true');
    setShowCreatePost(true);
  }, []);

  const handleCloseCreatePost = useCallback(() => {
    console.log('handleCloseCreatePost called, setting showCreatePost to false');
    setShowCreatePost(false);
  }, []);

  // Load posts - enabled to fetch posts from database
  const loadPosts = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      setIsLoading(true);
      if (reset) {
        setPosts([]);
        setError(null);
      }

      // Use API endpoint instead of client-side function
      // Note: We swap the postType parameter to match the tab names
      // "Available Jobs" tab (activeTab="employee") should show employer posts
      // "Available Candidates" tab (activeTab="employer") should show employee posts
      const postTypeToFetch = activeTab === "employee" ? "employer" : "employee";
      const response = await fetch(`/api/public-posts?page=${page}&limit=12&postType=${postTypeToFetch}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      const result = {
        posts: data.posts || [],
        total: data.pagination?.totalItems || 0,
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        hasNextPage: data.pagination?.hasNextPage || false,
        hasPrevPage: data.pagination?.hasPrevPage || false,
        error: null
      };

      setPosts(prev => {
        const newPosts = reset ? result.posts : [...prev, ...result.posts];
        return newPosts;
      });
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalPosts(result.total);
      setHasNextPage(result.hasNextPage);
      setHasPrevPage(result.hasPrevPage);
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsPageChanging(false);
    }
  }, [activeTab]);

  // Store the latest loadPosts function in ref
  loadPostsRef.current = loadPosts;

  // Set initial state to load posts on component mount
  useEffect(() => {
    setPosts([]);
    setIsLoading(true);
    setError(null);
    // Load posts on component mount
    loadPosts(1, true);
  }, []);

  // Initialize page state
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Load posts when component mounts or tab changes
  useEffect(() => {
    if (!mounted) return;
    
    console.log('Loading posts for tab:', activeTab);
    loadPosts(1, true);
  }, [activeTab, loadPosts, mounted]);

  // Use posts from state
  const filteredPosts: PostWithMaskedContact[] = posts;

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: any) => {
    // Reload posts with new filters
    loadPosts(1, true);
  }, [loadPosts]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setIsPageChanging(true);
    loadPosts(page, false);
  }, [loadPosts]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    loadPosts(currentPage + 1, false);
  }, [currentPage, loadPosts]);

  // Single return statement - no duplicates
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
      {showCreatePost ? (
        <>
          {console.log('Rendering PostCreation component')}
          <PostCreation onClose={handleCloseCreatePost} />
        </>
      ) : (
        <>
          {console.log('Rendering normal content')}
          {/* Job Type Tabs */}
          <JobTypeTabs 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              // This will be handled by the parent component
              const event = new CustomEvent('jobTabChange', { detail: { tab } });
              window.dispatchEvent(event);
            }}
          />
          
          <StaticFilterBar filters={filters} onFilterChange={handleFilterChange} />
          
          {/* Posts Grid - handles all states internally */}
          <PostsGrid 
            posts={filteredPosts} 
            isLoading={isLoading} 
            isTabChanging={isTabChanging}
          />
          
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Main HomePage Component - Simplified for immediate loading
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "employer" | "employee">("employee");
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "faq" | "contact" | "createPost" | "howItWorks" | "createProfile" | "postJob">("home");
  const [selectedPostType, setSelectedPostType] = useState<"employee" | "employer">("employee");
  
  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleTabChange = useCallback((tab: "all" | "employer" | "employee") => {
    setActiveTab(tab);
    setIsTabChanging(true);
    // Reset tab changing after a short delay
    setTimeout(() => setIsTabChanging(false), 500);
  }, []);

  // Handle view changes
  const handleFAQ = useCallback(() => {
    setCurrentView("faq");
  }, []);

  const handleContact = useCallback(() => {
    setCurrentView("contact");
  }, []);

  const handleHowItWorks = useCallback(() => {
    setCurrentView("howItWorks");
  }, []);

  const handleCreateProfile = useCallback(() => {
    setCurrentView("createProfile");
    setSelectedPostType("employee"); // Pre-select employee type for profile
  }, []);

  const handlePostJob = useCallback(() => {
    setCurrentView("postJob");
    setSelectedPostType("employer"); // Pre-select employer type for job posting
  }, []);

  const handleCreatePost = useCallback(() => {
    setCurrentView("createPost");
  }, []);

  const handleCloseCreatePost = useCallback(() => {
    setCurrentView("home");
  }, []);

  // Listen for tab changes from main content area
  useEffect(() => {
    if (!mounted) return;
    
    const handleJobTabChange = (event: CustomEvent) => {
      handleTabChange(event.detail.tab);
    };

    window.addEventListener('jobTabChange', handleJobTabChange as EventListener);
    
    return () => {
      window.removeEventListener('jobTabChange', handleJobTabChange as EventListener);
    };
  }, [handleTabChange, mounted]);

  // Register handlers with ConditionalHeader
  useEffect(() => {
    if (!mounted) return;
    
    registerCreatePostHandler(handleCreatePost);
    registerCreateProfileHandler(handleCreateProfile);
    registerPostJobHandler(handlePostJob);
    registerFAQHandler(handleFAQ);
    registerContactHandler(handleContact);
    registerHowItWorksHandler(handleHowItWorks);
  }, [handleCreatePost, handleCreateProfile, handlePostJob, handleFAQ, handleContact, handleHowItWorks, mounted]);
  
  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render different content based on current view
  const renderContent = () => {
    switch (currentView) {
      case "faq":
        return <FAQContent />;
      case "contact":
        return <ContactContent />;
      case "howItWorks":
        return <HowItWorksContent />;
      case "createProfile":
        return <PostCreation onClose={handleCloseCreatePost} postType="employee" />;
      case "postJob":
        return <PostCreation onClose={handleCloseCreatePost} postType="employer" />;
      case "createPost":
        return <PostCreation onClose={handleCloseCreatePost} />;
      default:
        return <HomePageContent activeTab={activeTab} isTabChanging={isTabChanging} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}
