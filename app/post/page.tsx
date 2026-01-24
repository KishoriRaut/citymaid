"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/button";
import { appConfig } from "@/lib/config";
import { createPost } from "@/lib/posts";
import { getOrCreateVisitorId } from "@/lib/visitor-id";
import { useToast } from "@/components/shared/toast";
import { getGroupedWorkTypes, isOtherWorkType } from "@/lib/work-types";
import { getGroupedTimeOptions, isOtherTimeOption } from "@/lib/work-time";
import { uploadPhoto } from "@/lib/storage";

export default function PostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    post_type: "employer" as "employer" | "employee",
    work: "",
    workOther: "",
    time: "",
    timeOther: "",
    place: "",
    salary: "",
    contact: "",
    photo: null as File | null,
  });

  // Clear photo when switching to employer
  const handlePostTypeChange = (newType: "employer" | "employee") => {
    setFormData({
      ...formData,
      post_type: newType,
      photo: newType === "employer" ? null : formData.photo, // Clear photo for employer
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Upload photo only for employee posts
      let photoUrl: string | null = null;
      if (formData.post_type === "employee" && formData.photo) {
        const { url, error: uploadError } = await uploadPhoto(formData.photo);
        if (uploadError) {
          setError(uploadError);
          setIsSubmitting(false);
          return;
        }
        photoUrl = url;
      }
      // Employer posts: photo_url will be set to NULL on server-side

      // Determine work and time values
      const work = formData.work === "Other" ? formData.workOther : formData.work;
      const time = formData.time === "Other" ? formData.timeOther : formData.time;

      // Validate required fields
      if (!work || !time || !formData.place || !formData.salary || !formData.contact) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Create post
      const { post, error: createError } = await createPost({
        post_type: formData.post_type,
        work,
        time,
        place: formData.place,
        salary: formData.salary,
        contact: formData.contact,
        photo_url: photoUrl,
      });

      if (createError || !post) {
        setError(createError || "Failed to create post");
        setIsSubmitting(false);
        return;
      }

      // Show success toast and redirect immediately
      setIsSubmitting(false);
      
      // Show success toast
      addToast(
        "Post submitted successfully! Redirecting to payment page...",
        "success",
        2000
      );
      
      // Immediate redirect to payment page
      router.push(`/post-payment/${post.id}`);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  const pageTitle = formData.post_type === "employer" 
    ? "Post a Job Requirement" 
    : "Create Your Work Profile";

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">Fill in the details to create your post</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Toggle */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground">I want to</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handlePostTypeChange("employer")}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                  formData.post_type === "employer"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm hover:shadow"
                    : "border-border bg-background hover:bg-primary/10 hover:border-primary/30 text-foreground"
                }`}
              >
                Hire a Worker
              </button>
              <button
                type="button"
                onClick={() => handlePostTypeChange("employee")}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                  formData.post_type === "employee"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm hover:shadow"
                    : "border-border bg-background hover:bg-primary/10 hover:border-primary/30 text-foreground"
                }`}
              >
                Find a Job
              </button>
            </div>
            <p className="mt-2.5 text-sm text-muted-foreground">Select your purpose to continue</p>
          </div>

          {/* Work Dropdown */}
          <div>
            <label className="block text-sm font-semibold mb-2.5 text-foreground">
              Work <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.work}
              onChange={(e) => setFormData({ ...formData, work: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200"
              required
            >
              <option value="">Select work type</option>
              {getGroupedWorkTypes().map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.types.map((workType) => (
                    <option key={workType} value={workType}>
                      {workType}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {isOtherWorkType(formData.work) && (
              <input
                type="text"
                placeholder="Specify work type"
                value={formData.workOther}
                onChange={(e) => setFormData({ ...formData, workOther: e.target.value })}
                className="w-full mt-2.5 px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                required
              />
            )}
          </div>

          {/* Time Dropdown */}
          <div>
            <label className="block text-sm font-semibold mb-2.5 text-foreground">
              Time <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200"
              required
            >
              <option value="">Select time</option>
              {getGroupedTimeOptions().map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.types.map((timeOption) => (
                    <option key={timeOption} value={timeOption}>
                      {timeOption}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {isOtherTimeOption(formData.time) && (
              <input
                type="text"
                placeholder="Specify schedule"
                value={formData.timeOther}
                onChange={(e) => setFormData({ ...formData, timeOther: e.target.value })}
                className="w-full mt-2.5 px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                required
              />
            )}
          </div>

          {/* Place */}
          <div>
            <label className="block text-sm font-semibold mb-2.5 text-foreground">
              Place <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              placeholder="e.g., Kathmandu, Lalitpur"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
              required
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-semibold mb-2.5 text-foreground">
              Salary <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="e.g., 5000, Negotiable"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
              required
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold mb-2.5 text-foreground">
              Contact <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Phone number or contact info"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
              required
            />
          </div>

          {/* Photo Upload - Only for Employee Posts */}
          {formData.post_type === "employee" && (
            <div>
              <label className="block text-sm font-semibold mb-2.5 text-foreground">Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, photo: file });
                }}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary transition-all duration-200 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {formData.photo && (
                <p className="mt-2.5 text-sm text-muted-foreground">
                  Selected: {formData.photo.name}
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-destructive">
              <p className="font-semibold mb-1.5">Error</p>
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(appConfig.routes.home)}
              className="flex-1 border-border hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} size="lg" className="flex-1 shadow-sm hover:shadow transition-shadow duration-200">
              {isSubmitting ? "Submitting..." : "Submit Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
