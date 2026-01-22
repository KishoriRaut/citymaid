"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { createPost } from "@/lib/posts";
import { uploadPhoto } from "@/lib/storage";
import { getGroupedWorkTypes, isOtherWorkType } from "@/lib/work-types";
import { getGroupedTimeOptions, isOtherTimeOption } from "@/lib/work-time";

export default function PostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Redirect to homepage
      router.push(appConfig.routes.home);
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">{pageTitle}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Toggle */}
          <div>
            <label className="block text-sm font-medium mb-2">I want to</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handlePostTypeChange("employer")}
                className={`flex-1 px-4 py-3 rounded-md border-2 transition-colors ${
                  formData.post_type === "employer"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                }`}
              >
                Hire a Worker
              </button>
              <button
                type="button"
                onClick={() => handlePostTypeChange("employee")}
                className={`flex-1 px-4 py-3 rounded-md border-2 transition-colors ${
                  formData.post_type === "employee"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                }`}
              >
                Find a Job
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Select your purpose to continue</p>
          </div>

          {/* Work Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Work <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.work}
              onChange={(e) => setFormData({ ...formData, work: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
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
                className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                required
              />
            )}
          </div>

          {/* Time Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Time <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
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
                className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                required
              />
            )}
          </div>

          {/* Place */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Place <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              placeholder="e.g., Kathmandu, Lalitpur"
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Salary <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="e.g., 5000, Negotiable"
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Phone number or contact info"
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>

          {/* Photo Upload - Only for Employee Posts */}
          {formData.post_type === "employee" && (
            <div>
              <label className="block text-sm font-medium mb-2">Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, photo: file });
                }}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              {formData.photo && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {formData.photo.name}
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(appConfig.routes.home)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
