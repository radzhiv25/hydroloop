/**
 * Upload a file to Cloudinary (unsigned) and return the CDN URL.
 * Requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.
 */

const CLOUD_NAME = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME : undefined;
const UPLOAD_PRESET = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET : undefined;

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadSoundToCloudinary(file: File): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return {
      ok: false,
      error: "Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env",
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || `Upload failed (${res.status})` };
    }

    const data = (await res.json()) as { secure_url?: string };
    const secureUrl = data?.secure_url;
    if (!secureUrl || typeof secureUrl !== "string") {
      return { ok: false, error: "Invalid response from Cloudinary" };
    }

    return { ok: true, url: secureUrl };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
