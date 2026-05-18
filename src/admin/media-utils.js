import { supabase, supabaseStorageBuckets } from "../lib/supabaseClient.js";

export const defaultImageBucket = supabaseStorageBuckets.publicImages;

export function slugifyFileName(name = "image") {
  const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "png";
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "image";
  return `${base}.${extension}`;
}

export function getImageSize(file) {
  return new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: null, height: null });
    };
    image.src = objectUrl;
  });
}

export async function fetchMediaImages(limit = 80) {
  const { data, error } = await supabase
    .from("media")
    .select("id, bucket, storage_path, public_url, file_name, alt_text, caption, created_at")
    .eq("is_enabled", true)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function uploadImageToMedia({
  file,
  altText = "",
  caption = "",
  bucket = defaultImageBucket
}) {
  if (!file) throw new Error("請先選擇圖片檔案。");
  if (!file.type.startsWith("image/")) throw new Error("只支援圖片檔案。");

  const { width, height } = await getImageSize(file);
  const safeName = slugifyFileName(file.name);
  const storagePath = `cms/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  const publicUrl = publicUrlData.publicUrl;

  const { data, error: insertError } = await supabase
    .from("media")
    .insert({
      bucket,
      storage_path: storagePath,
      public_url: publicUrl,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      width,
      height,
      alt_text: altText.trim() || null,
      caption: caption.trim() || null,
      visibility: "public",
      is_enabled: true
    })
    .select("id, bucket, storage_path, public_url, file_name, alt_text, caption, created_at")
    .single();

  if (insertError) throw insertError;
  return data;
}
