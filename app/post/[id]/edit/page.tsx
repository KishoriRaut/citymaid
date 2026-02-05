"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";

// Form Schema
const formSchema = z.object({
  post_type: z.enum(["employer", "employee"]),
  work: z.string().min(1, "Please select a work type"),
  time: z.string().min(1, "Please select a time option"),
  place: z.string().min(1, "Please enter a location"),
  salary: z.string().min(1, "Please enter a salary"),
  contact: z.string().min(1, "Please enter contact information"),
  details: z.string().min(10, "Please provide at least 10 characters").max(500, "Details must be less than 500 characters"),
});

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      post_type: "employer",
      work: "",
      time: "",
      place: "",
      salary: "",
      contact: "",
      details: "",
    },
  });

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load post");
        }

        const post = result.post;
        form.reset({
          post_type: post.post_type,
          work: post.work,
          time: post.time,
          place: post.place,
          salary: post.salary,
          contact: post.contact,
          details: post.details || "",
        });
      } catch (error) {
        console.error("Error loading post:", error);
        setError(error instanceof Error ? error.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response not OK:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to update post'}`);
      }

      // Try to parse JSON
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("❌ JSON parse error:", jsonError);
        throw new Error("Invalid response from server");
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to update post");
      }

      toast({
        title: "Success",
        description: "Post updated successfully",
      });

      // Close window if it was opened from admin
      if (window.opener) {
        window.close();
      } else {
        router.push("/admin/requests");
      }
    } catch (error) {
      console.error("❌ Update post error:", error);
      setError(error instanceof Error ? error.message : "Failed to update post");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !form.getValues().work) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button 
              onClick={() => router.back()} 
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">Update the post information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Post Details</CardTitle>
            <CardDescription>
              Make changes to the post information and save your updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="post_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-6"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="employer" />
                            </FormControl>
                            <FormLabel className="font-normal">Looking for Employee</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="employee" />
                            </FormControl>
                            <FormLabel className="font-normal">Looking for Work</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="work"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Software Development" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Commitment</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Full-time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kathmandu, Nepal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., NPR 50,000 - 70,000 per month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input placeholder="Email, phone, or other contact details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide more details about the position or requirements..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide at least 10 characters with relevant details.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Post"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={submitting}
                  >
                    Cancel
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
