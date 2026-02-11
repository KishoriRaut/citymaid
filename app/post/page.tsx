"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize form - always called in same order
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      post_type: "employer",
      work: "",
      workOther: "",
      time: "",
      timeOther: "",
      place: "",
      salary: "",
      contact: "",
      details: "",
      photo: undefined,
    },
  });

  // Watch post_type to show/hide photo upload - always called in same order
  const postType = form.watch("post_type");
  const workValue = form.watch("work");
  const timeValue = form.watch("time");

  // Prevent SSR issues with react-hook-form
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
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
      console.log("📸 Photo value:", values.photo);
      console.log("📸 Photo type:", typeof values.photo);
      console.log("📸 Photo is File:", values.photo instanceof File);
      
      // Handle photo upload for both employer and employee posts
      let photoUrl: string | null = null;
      let employeePhotoUrl: string | null = null;
      
      if (values.photo) {
        console.log("📸 Uploading photo:", values.photo.name, values.photo.size);
        console.log("📸 Photo type:", values.photo.type);
        console.log("📸 Photo last modified:", values.photo.lastModified);
        
        const { url, error: uploadError } = await uploadPhoto(values.photo);
        if (uploadError) {
          console.error("❌ Photo upload error:", uploadError);
          throw new Error(uploadError);
        }
        
        // For employee posts, this is the employee profile photo
        if (values.post_type === "employee") {
          employeePhotoUrl = url;
          console.log("✅ Employee photo uploaded successfully:", employeePhotoUrl);
        } else {
          // For employer posts, this is the post photo
          photoUrl = url;
          console.log("✅ Post photo uploaded successfully:", photoUrl);
        }
        
        // Verify the uploaded URL format
        const uploadedUrl = values.post_type === "employee" ? employeePhotoUrl : photoUrl;
        if (uploadedUrl) {
          console.log("🔍 Uploaded URL analysis:");
          console.log("  - Contains 'receipt-':", uploadedUrl.includes('receipt-'));
          console.log("  - Contains 'post-photos':", uploadedUrl.includes('post-photos'));
          console.log("  - URL format:", uploadedUrl);
        }
      } else {
        console.log("📷 No photo to upload");
        console.log("📷 Post type:", values.post_type);
        console.log("📷 Photo exists:", !!values.photo);
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
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Dynamic Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {postType === "employer" ? (
              <>
                <span className="text-primary">💼</span> Post a Job Requirement
              </>
            ) : (
              <>
                <span className="text-primary">👤</span> Create Your Work Profile
              </>
            )}
          </h1>
          <p className="text-lg text-muted-foreground">
            {postType === "employer" 
              ? "Find the perfect worker for your needs"
              : "Showcase your skills and find opportunities"
            }
          </p>
        </div>

        {/* Role Toggle Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Form {...form}>
              <FormField
                control={form.control}
                name="post_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-center block mb-4">
                      I want to
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div className="relative">
                          <RadioGroupItem
                            value="employer"
                            id="employer"
                            className="peer sr-only"
                          />
                          <label
                            htmlFor="employer"
                            className={`flex items-center justify-center rounded-xl border-2 p-6 text-center font-medium transition-all duration-300 cursor-pointer ${
                              field.value === "employer"
                                ? "border-primary bg-primary/5 shadow-lg scale-105"
                                : "border-border bg-background hover:bg-primary/5 hover:border-primary/50 hover:scale-102"
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="text-4xl">💼</div>
                              <div className="text-lg font-semibold">Hire a Worker</div>
                              <div className="text-sm text-muted-foreground">Post a job requirement and find talent</div>
                            </div>
                          </label>
                        </div>
                        <div className="relative">
                          <RadioGroupItem
                            value="employee"
                            id="employee"
                            className="peer sr-only"
                          />
                          <label
                            htmlFor="employee"
                            className={`flex items-center justify-center rounded-xl border-2 p-6 text-center font-medium transition-all duration-300 cursor-pointer ${
                              field.value === "employee"
                                ? "border-primary bg-primary/5 shadow-lg scale-105"
                                : "border-border bg-background hover:bg-primary/5 hover:border-primary/50 hover:scale-102"
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="text-4xl">👤</div>
                              <div className="text-lg font-semibold">Find a Job</div>
                              <div className="text-sm text-muted-foreground">Create your professional work profile</div>
                            </div>
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </CardContent>
        </Card>

        {/* Marketing Banner - Platform Features Promotion */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
              
              {/* Content */}
              <div className="relative px-8 py-6 text-white">
                {/* Banner removed */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                {postType === "employer" ? (
                  <span className="text-2xl">�</span>
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {postType === "employer" ? "Job Details" : "Profile Information"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {postType === "employer" 
                    ? "Provide details about the job you're offering"
                    : "Tell us about your skills and what you're looking for"
                  }
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Work Type Dropdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <FormField
                control={form.control}
                name="work"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        {postType === "employer" ? (
                          <span className="text-primary">🔧</span>
                        ) : (
                          <span className="text-primary">💪</span>
                        )}
                      </div>
                      {postType === "employer" ? "Job Category" : "Skills & Services"}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary">
                          <SelectValue placeholder={
                            postType === "employer" 
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
            </div>

            {/* Other Work Type Input */}
            {isOtherWorkType(workValue) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <FormField
                  control={form.control}
                  name="workOther"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary">📝</span>
                        </div>
                        {postType === "employer" ? "Specify Job Type" : "Describe Your Skills"}
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            postType === "employer" 
                              ? "e.g., Custom work, Specialized service" 
                              : "e.g., Design, Writing, Plumbing"
                          } 
                          className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Time Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
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
            </div>

            {/* Other Time Input */}
            {isOtherTimeOption(timeValue) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <FormField
                  control={form.control}
                  name="timeOther"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary">📅</span>
                        </div>
                        {postType === "employer" ? "Specify Schedule Details" : "Describe Your Availability"}
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            postType === "employer" 
                              ? "e.g., Weekends, Evenings, Flexible" 
                              : "e.g., Weekdays 9-5, Weekends preferred"
                          } 
                          className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Separator />

            {/* Place Input */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                        placeholder={
                          postType === "employer" 
                            ? "e.g., Kathmandu, Lalitpur, Remote" 
                            : "e.g., Kathmandu, Lalitpur, Remote"
                        } 
                        className="h-12 text-base border-gray-300 focus:border-primary focus:ring-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Salary Input */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
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
            </div>

            {/* Contact Input */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
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
            </div>

            {/* Details Input */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
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
            </div>

            <Separator />

            {/* Photo Upload - Mandatory for Employee, Optional for Employer */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
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
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200 bg-gray-50/50 -mx-8 px-8 rounded-b-2xl">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
