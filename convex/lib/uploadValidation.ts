// convex/lib/uploadValidation.ts
//
// Security Layer: Upload Validation
// Verifies file size and magic bytes on the server before processing files.

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MAGIC_PATTERNS = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  jpeg: [0xff, 0xd8, 0xff], // JPEG
};

/**
 * Validates a file's buffer by checking its magic bytes.
 * Returns the matching mime type, or null if invalid/unsupported.
 */
export function validateFileMagicBytes(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer);
  
  // Helper to match starting bytes
  const matches = (magic: number[]) => {
    if (bytes.length < magic.length) return false;
    for (let i = 0; i < magic.length; i++) {
      if (bytes[i] !== magic[i]) return false;
    }
    return true;
  };

  if (matches(MAGIC_PATTERNS.pdf)) return "application/pdf";
  if (matches(MAGIC_PATTERNS.png)) return "image/png";
  if (matches(MAGIC_PATTERNS.jpeg)) return "image/jpeg";

  return null;
}

/**
 * Validates file size and type.
 * Returns true if valid, throws an error otherwise.
 */
export function validateUpload(buffer: ArrayBuffer, size: number): { mimeType: string } {
  if (size > MAX_FILE_SIZE || buffer.byteLength > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit.");
  }

  const mimeType = validateFileMagicBytes(buffer);
  if (!mimeType) {
    throw new Error("Invalid file type. Only PDF, PNG, and JPEG files are supported.");
  }

  return { mimeType };
}
