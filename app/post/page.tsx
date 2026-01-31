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

  // Prevent SSR issues with react-hook-form
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize form only on client side
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
      photo: undefined,
    },
  });

  // Watch post_type to show/hide photo upload
  const postType = form.watch("post_type");
  const workValue = form.watch("work");
  const timeValue = form.watch("time");

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

      // Create post data
      const postData = {
        post_type: values.post_type,
        work: values.work === "Other" ? values.workOther || "" : values.work,
        time: values.time === "Other" ? values.timeOther || "" : values.time,
        place: values.place,
        salary: values.salary,
        contact: values.contact,
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
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {postType === "employer" ? (
                <>
                  <span className="text-2xl">📋</span>
                  Job Details
                </>
              ) : (
                <>
                  <span className="text-2xl">📝</span>
                  Profile Information
                </>
              )}
            </CardTitle>
            <CardDescription>
              {postType === "employer" 
                ? "Provide details about the job you're offering"
                : "Tell us about your skills and what you're looking for"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Work Type Dropdown */}
            <FormField
              control={form.control}
              name="work"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    {postType === "employer" ? (
                      <>
                        <span className="text-primary">🔧</span> Job Category
                      </>
                    ) : (
                      <>
                        <span className="text-primary">💪</span> Skills & Services
                      </>
                    )}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormDescription>
                    {postType === "employer" 
                      ? "Choose the category that best describes the work needed"
                      : "Select the services you can provide"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Other Work Type Input */}
            {isOtherWorkType(workValue) && (
              <FormField
                control={form.control}
                name="workOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {postType === "employer" ? (
                        <>
                          <span className="text-primary">📝</span> Specify Job Type
                        </>
                      ) : (
                        <>
                          <span className="text-primary">📝</span> Describe Your Skills
                        </>
                      )}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          postType === "employer" 
                            ? "e.g., Custom furniture making, Event planning" 
                            : "e.g., Graphic design, Content writing, Plumbing"
                        } 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {postType === "employer" 
                        ? "Provide a clear description of the specific work needed"
                        : "Describe your specialized skills and services"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Time Options */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    {postType === "employer" ? (
                      <>
                        <span className="text-primary">⏰</span> Work Schedule
                      </>
                    ) : (
                      <>
                        <span className="text-primary">⏰</span> Availability
                      </>
                    )}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                  <FormDescription>
                    {postType === "employer" 
                      ? "Specify when the work needs to be done"
                      : "Let employers know when you're available to work"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Other Time Input */}
            {isOtherTimeOption(timeValue) && (
              <FormField
                control={form.control}
                name="timeOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {postType === "employer" ? (
                        <>
                          <span className="text-primary">📅</span> Specify Schedule Details
                        </>
                      ) : (
                        <>
                          <span className="text-primary">📅</span> Describe Your Availability
                        </>
                      )}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          postType === "employer" 
                            ? "e.g., Weekends only, Evenings after 6 PM, Flexible hours" 
                            : "e.g., Available weekdays 9-5, Weekend work preferred"
                        } 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {postType === "employer" 
                        ? "Provide specific timing requirements for the work"
                        : "Describe your preferred working hours and flexibility"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator />

            {/* Place Input */}
            <FormField
              control={form.control}
              name="place"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    {postType === "employer" ? (
                      <>
                        <span className="text-primary">📍</span> Job Location
                      </>
                    ) : (
                      <>
                        <span className="text-primary">📍</span> Work Location
                      </>
                    )}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={
                        postType === "employer" 
                          ? "e.g., Kathmandu, Lalitpur, Remote work available" 
                          : "e.g., Kathmandu, Lalitpur, Can work remotely"
                      } 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {postType === "employer" 
                      ? "Where will the work be performed?"
                      : "Where are you located or willing to work?"
                    }
                  </FormDescription>
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
                  <FormLabel className="text-base font-medium">
                    {postType === "employer" ? (
                      <>
                        <span className="text-primary">💰</span> Compensation
                      </>
                    ) : (
                      <>
                        <span className="text-primary">💰</span> Expected Salary
                      </>
                    )}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={
                        postType === "employer" 
                          ? "e.g., NPR 15,000 per month, Negotiable, Based on experience" 
                          : "e.g., NPR 15,000-20,000 per month, Negotiable, Market rate"
                      } 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {postType === "employer" 
                      ? "Specify the salary range or compensation details"
                      : "Indicate your salary expectations"
                    }
                  </FormDescription>
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
                  <FormLabel className="text-base font-medium">
                    {postType === "employer" ? (
                      <>
                        <span className="text-primary">📞</span> Contact Information
                      </>
                    ) : (
                      <>
                        <span className="text-primary">📞</span> Contact Details
                      </>
                    )}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={
                        postType === "employer" 
                          ? "Phone number, email, and best time to contact you" 
                          : "Phone number, email, LinkedIn profile, portfolio link"
                      } 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {postType === "employer" 
                      ? "Provide multiple ways for interested workers to reach you"
                      : "Share your professional contact information for employers"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Photo Upload - Mandatory for Employee, Optional for Employer */}
            <FormField
              control={form.control}
              name="photo"
              render={({ field: { onChange, ref } }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    {postType === "employer" ? (
                      <>
                        <span className="text-primary">📷</span> Job Photo
                      </>
                    ) : (
                      <>
                        <span className="text-primary">📷</span> Professional Photo
                      </>
                    )}
                    <span className="text-muted-foreground">
                      {postType === "employee" ? " (Required)" : " (Optional)"}
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
                    />
                  </FormControl>
                  <FormDescription>
                    {postType === "employee" 
                      ? "Upload a professional photo - this helps employers get to know you (required)"
                      : "Add a relevant photo for your job posting (optional but recommended)"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                size="lg"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
