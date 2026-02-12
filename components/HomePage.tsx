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
  salary: z.string().min(1, "Please enter salary information"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Please enter a phone number"),
  bestWayToContact: z.enum(["phone", "email", "whatsapp", "both"]),
  age: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  companyName: z.string().optional(),
  businessType: z.string().optional(),
  isIndividual: z.enum(["true", "false"]).optional(),
  requirements: z.string().optional(),
  contact: z.string().min(1, "Please enter contact person name"),
  details: z.string().min(1, "Please provide details about the post"),
  photo: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

function PostCreation({ onClose, postType = "employee" }: { onClose: () => void; postType?: "employee" | "employer" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize form - always called in same order
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      post_type: postType,
      work: "",
      workOther: "",
      time: "",
      timeOther: "",
      place: "",
      salary: "",
      email: "",
      phone: "",
      bestWayToContact: "both",
      age: "",
      gender: undefined,
      education: "",
      experience: "",
      skills: "",
      companyName: "",
      businessType: "",
      isIndividual: undefined,
      requirements: "",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle form submission
  const onSubmit = async (values: FormData) => {
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
        
        // New fields
        email: values.email,
        phone: values.phone,
        bestWayToContact: values.bestWayToContact,
        
        // Type-specific fields
        ...(values.post_type === "employee" ? {
          age: values.age,
          gender: values.gender,
          education: values.education,
          experience: values.experience,
          skills: values.skills,
        } : {
          companyName: values.companyName,
          businessType: values.businessType,
          isIndividual: values.isIndividual,
          requirements: values.requirements,
        }),
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
    <div className="w-full bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {postType === "employer" ? (
                    <>
                      <span className="text-primary">Job</span> EMPLOYER - Post a Job Requirement
                    </>
                  ) : (
                    <>
                      <span className="text-primary">Profile</span> EMPLOYEE - Create Your Work Profile
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
    </div>
  );
}

// Other components (FAQ, Contact, HowItWorks, etc.) would go here...

function HomePageContent({ activeTab, isTabChanging }: { activeTab: "all" | "employer" | "employee"; isTabChanging: boolean }) {
  // Simplified content for now
  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold mb-4">CityMaid</h1>
      <p className="text-gray-600">Connecting trusted domestic workers with families across Nepal</p>
    </div>
  );
}

export function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "employer" | "employee">("all");
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [currentView, setCurrentView] = useState<string>("home");
  const [showCreatePost, setShowCreatePost] = useState(false);

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

  // Register handlers with ConditionalHeader
  useEffect(() => {
    if (!mounted) return;
    
    registerCreatePostHandler(handleCreatePost);
    registerCreateProfileHandler(() => setCurrentView("createProfile"));
    registerPostJobHandler(() => setCurrentView("postJob"));
    registerFAQHandler(() => setCurrentView("faq"));
    registerContactHandler(() => setCurrentView("contact"));
    registerHowItWorksHandler(() => setCurrentView("howItWorks"));
  }, [handleCreatePost, mounted]);
  
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
      <div className="w-full main-page-content">
        {renderContent()}
      </div>
    </div>
  );
}
