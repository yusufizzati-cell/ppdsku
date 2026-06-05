/**
 * Upload configuration & validation shared between client and server.
 */

export const UPLOAD_BUCKET = "uploads";

export const ALLOWED_MIME_TYPES = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/png": "image",
} as const;

export type AllowedMime = keyof typeof ALLOWED_MIME_TYPES;
export type FileKind = "pdf" | "image";

// Max sizes in bytes
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

// Free tier usage limits
export const FREE_MAX_UPLOADS = 5;

export interface FileValidationResult {
  ok: boolean;
  fileKind?: FileKind;
  error?: string;
  code?: "UNSUPPORTED_FILE_TYPE" | "FILE_TOO_LARGE";
}

/**
 * Validates a file's MIME type and size. Used on both client and server.
 */
export function validateFile(
  mimeType: string,
  sizeBytes: number
): FileValidationResult {
  const fileKind = ALLOWED_MIME_TYPES[mimeType as AllowedMime];

  if (!fileKind) {
    return {
      ok: false,
      code: "UNSUPPORTED_FILE_TYPE",
      error: "Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG.",
    };
  }

  const maxSize = fileKind === "pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
  if (sizeBytes > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      error: `Ukuran file melebihi batas ${maxMb} MB.`,
    };
  }

  return { ok: true, fileKind };
}

/**
 * Human-readable file size.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Builds the storage path: uploads/{user_id}/{upload_id}/{filename}
 * Filename is sanitized to avoid path traversal / unsafe chars.
 */
export function buildStoragePath(
  userId: string,
  uploadId: string,
  filename: string
): string {
  const safeName = filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 120);
  return `${userId}/${uploadId}/${safeName}`;
}
