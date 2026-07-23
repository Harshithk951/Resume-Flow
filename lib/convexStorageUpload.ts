/**
 * lib/convexStorageUpload.ts
 *
 * Robust utility for uploading files (resumes, screenshots, PDFs) to Convex storage.
 * Fixes CORS 502 Bad Gateway failures by:
 *   1. Enforcing method: "POST" (Convex storage tokens reject PUT/GET with 502/405).
 *   2. Ensuring Content-Type header is non-empty (falling back based on filename extension or octet-stream).
 *   3. Retrying with same-origin upload proxy if direct cross-origin fetch returns 502/CORS error.
 */

function getMimeType(file: File | Blob, filename?: string): string {
  if (file.type && file.type.trim() !== "") {
    return file.type;
  }

  const name = filename || (file as File).name || "";
  const ext = name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "json":
      return "application/json";
    case "tex":
      return "text/x-tex";
    default:
      return "application/octet-stream";
  }
}

export interface UploadResult {
  storageId: string;
}

export async function uploadToConvexStorage(
  uploadUrl: string,
  file: File | Blob,
  filename?: string
): Promise<UploadResult> {
  const mimeType = getMimeType(file, filename);

  // Attempt 1: Direct fetch to Convex storage uploadUrl
  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": mimeType,
      },
      body: file,
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.storageId) {
        return { storageId: data.storageId };
      }
    }

    // If direct upload returned 502 or non-ok status, log and attempt proxy fallback
    console.warn(`[ConvexStorage] Direct upload returned status ${response.status}. Attempting proxy fallback...`);
  } catch (err: any) {
    console.warn("[ConvexStorage] Direct upload CORS/Network error:", err?.message || err);
  }

  // Attempt 2: Fallback to same-origin upload proxy
  try {
    const proxyUrl = `/api/storage/upload-proxy?target=${encodeURIComponent(uploadUrl)}`;
    const proxyResponse = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": mimeType,
      },
      body: file,
    });

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text().catch(() => "");
      throw new Error(`Storage upload failed (${proxyResponse.status}): ${errorText || "Bad Gateway"}`);
    }

    const data = await proxyResponse.json();
    if (!data || !data.storageId) {
      throw new Error("Invalid response format from storage server.");
    }

    return { storageId: data.storageId };
  } catch (proxyErr: any) {
    console.error("[ConvexStorage] Storage upload proxy failed:", proxyErr);
    throw new Error(
      proxyErr.message || "Failed to upload file to storage due to network access restrictions."
    );
  }
}
