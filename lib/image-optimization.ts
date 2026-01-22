/**
 * Image optimization utilities
 * Resizes and compresses images before upload to reduce file size and improve performance
 */

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

const DEFAULT_OPTIONS: Required<OptimizeImageOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: "webp",
};

/**
 * Optimize image file before upload
 * - Resizes to max dimensions while maintaining aspect ratio
 * - Compresses to reduce file size
 * - Converts to WebP format for better compression
 */
export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > opts.maxWidth || height > opts.maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
              width = Math.min(width, opts.maxWidth);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, opts.maxHeight);
              width = height * aspectRatio;
            }
          }

          // Create canvas for resizing and compression
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create optimized image"));
                return;
              }

              // Create new File object with optimized image
              const fileName = file.name.replace(/\.[^/.]+$/, "");
              const fileExtension = opts.format === "webp" ? "webp" : file.name.split(".").pop() || "jpg";
              const mimeType = opts.format === "webp" ? "image/webp" : file.type || "image/jpeg";

              const optimizedFile = new File(
                [blob],
                `${fileName}_optimized.${fileExtension}`,
                {
                  type: mimeType,
                  lastModified: Date.now(),
                }
              );

              resolve(optimizedFile);
            },
            opts.format === "webp" ? "image/webp" : file.type || "image/jpeg",
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * - Checks file type
 * - Checks file size (max 10MB before optimization)
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a valid image file (JPEG, PNG, WebP, or GIF)",
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "Image size must be less than 10MB",
    };
  }

  return { valid: true };
}
