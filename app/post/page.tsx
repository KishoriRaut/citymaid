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
  photo: z.any().optional(),
});

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize form
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
    },
  });

  // Watch post_type to show/hide photo upload
  const postType = form.watch("post_type");
  const workValue = form.watch("work");
  const timeValue = form.watch("time");

  // Check admin status - this is optional and won't block the form
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(!!data.isAdmin);
        }
        // Silently handle 401 (not logged in) or other errors
      } catch (error) {
        console.debug("Not logged in or error checking admin status:", error);
      }
    };
    
    // Only check if we're in a browser environment
    if (typeof window !== 'undefined') {
      checkAdminStatus();
    }
  }, []);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Handle photo upload for employee posts
      let photoUrl: string | null = null;
      if (values.post_type === "employee" && values.photo?.[0]) {
        const { url, error: uploadError } = await uploadPhoto(values.photo[0]);
        if (uploadError) throw new Error(uploadError);
        photoUrl = url;
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
      };

      // Submit post
      const { post, error } = await createPost(postData);
      if (error) throw new Error(error);

      // Show success message
      toast({
        title: "Success",
        description: isAdmin 
          ? "Your post has been created and published!" 
          : "Post submitted successfully! Redirecting to payment page...",
      });

      // Redirect based on user type
      setTimeout(() => {
        router.push(isAdmin ? "/admin/posts" : `/post-payment/${post?.id}`);
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
          {form.watch("post_type") === "employer" ? "Post a Job Requirement" : "Create Your Work Profile"}
        </h1>

        {isAdmin && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.586-4L12 3l-4.586 4.414M3 7h6l4-4 4 4h6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">🎉 Admin Mode Active</p>
                <p className="text-sm text-green-700 dark:text-green-300">Your posts will be published instantly and featured on homepage.</p>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Post Type Toggle */}
            <FormField
              control={form.control}
              name="post_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-semibold mb-3">I want to</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-3"
                    >
                      <div className="flex-1">
                        <RadioGroupItem
                          value="employer"
                          id="employer"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="employer"
                          className={`flex flex-1 items-center justify-center rounded-lg border-2 p-3 text-center font-medium transition-all duration-200 cursor-pointer ${
                            field.value === "employer"
                              ? "border-primary bg-primary text-primary-foreground shadow-sm hover:shadow"
                              : "border-border bg-background hover:bg-primary/10 hover:border-primary/30 text-foreground"
                          }`}
                        >
                          Hire a Worker
                        </label>
                      </div>
                      <div className="flex-1">
                        <RadioGroupItem
                          value="employee"
                          id="employee"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="employee"
                          className={`flex flex-1 items-center justify-center rounded-lg border-2 p-3 text-center font-medium transition-all duration-200 cursor-pointer ${
                            field.value === "employee"
                              ? "border-primary bg-primary text-primary-foreground shadow-sm hover:shadow"
                              : "border-border bg-background hover:bg-primary/10 hover:border-primary/30 text-foreground"
                          }`}
                        >
                          Find a Job
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription className="mt-2.5 text-sm">
                    Select your purpose to continue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Work Type Dropdown */}
            <FormField
              control={form.control}
              name="work"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
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

            {/* Other Work Type Input */}
            {isOtherWorkType(workValue) && (
              <FormField
                control={form.control}
                name="workOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Work Type <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter work type" {...field} />
                    </FormControl>
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
                  <FormLabel>Time <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
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

            {/* Other Time Input */}
            {isOtherTimeOption(timeValue) && (
              <FormField
                control={form.control}
                name="timeOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Schedule <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter schedule details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Place Input */}
            <FormField
              control={form.control}
              name="place"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kathmandu, Lalitpur" {...field} />
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
                  <FormLabel>Contact <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number or contact info" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload - Only for Employee Posts */}
            {postType === "employee" && (
              <FormField
                control={form.control}
                name="photo"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Photo (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a photo of your work (only for employee profiles)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Post'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
