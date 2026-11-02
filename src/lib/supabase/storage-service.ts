import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_PROJECT_ASSET_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_PROJECT_ASSET_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates an avatar image file for acceptable MIME type and size.
 */
export function validateAvatarFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format (${file.type || "unknown"}). Only JPEG, PNG, WebP, and GIF are permitted.`,
    };
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum permitted size of 2 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validates a project screenshot or asset file.
 */
export function validateProjectAssetFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (!ALLOWED_PROJECT_ASSET_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format (${file.type || "unknown"}). Only JPEG, PNG, WebP, GIF, and PDF documents are permitted.`,
    };
  }

  if (file.size > MAX_PROJECT_ASSET_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum permitted size of 5 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads an avatar image to Supabase Storage in the 'avatars' bucket.
 * Bucket path structure: avatars/{userId}/{timestamp}-{filename}
 */
export async function uploadAvatarImage(
  userId: string,
  file: File
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: "Supabase storage is not configured in this environment.",
    };
  }

  try {
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      // Check for missing bucket error
      if (
        uploadError.message.includes("Bucket not found") ||
        uploadError.message.includes("does not exist")
      ) {
        return {
          success: false,
          error:
            "Storage bucket 'avatars' has not been created yet in the Supabase project. Please refer to the storage migration instructions.",
        };
      }
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (err: any) {
    console.error("[StorageService] Error uploading avatar:", err);
    return {
      success: false,
      error: err.message || "Failed to upload avatar image.",
    };
  }
}

/**
 * Uploads a project screenshot or asset to Supabase Storage in the 'project-assets' bucket.
 * Bucket path structure: project-assets/{projectId}/{timestamp}-{filename}
 */
export async function uploadProjectAsset(
  projectId: string,
  userId: string,
  file: File
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const validation = validateProjectAssetFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: "Supabase storage is not configured in this environment.",
    };
  }

  try {
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("project-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      if (
        uploadError.message.includes("Bucket not found") ||
        uploadError.message.includes("does not exist")
      ) {
        return {
          success: false,
          error:
            "Storage bucket 'project-assets' has not been created yet in the Supabase project. Please refer to the storage migration instructions.",
        };
      }
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("project-assets")
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
    };
  } catch (err: any) {
    console.error("[StorageService] Error uploading project asset:", err);
    return {
      success: false,
      error: err.message || "Failed to upload project asset.",
    };
  }
}
