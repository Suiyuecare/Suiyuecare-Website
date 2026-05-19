import { supabase, supabaseStorageBuckets } from "../lib/supabaseClient.js";

export const defaultImageBucket = supabaseStorageBuckets.publicImages;

export const imageUsageOptions = [
  { value: "hero", label: "首頁 Hero", ratio: "21:9", hint: "橫幅大圖，建議 1920x900 以上" },
  { value: "service_hero", label: "服務頁 Hero", ratio: "4:3", hint: "服務頁右側主圖，建議 1400x1050" },
  { value: "article_cover", label: "文章封面", ratio: "16:9", hint: "健康3.0與文章內頁封面，建議 1200x675" },
  { value: "card", label: "卡片縮圖", ratio: "4:3", hint: "一般卡片、列表與區塊圖片" },
  { value: "square", label: "方形圖片", ratio: "1:1", hint: "方形輪播或小型視覺卡" },
  { value: "avatar", label: "人物頭像", ratio: "1:1", hint: "人物臉部，建議置中或靠上" },
  { value: "logo", label: "Logo/識別", ratio: "完整顯示", hint: "不裁切，使用 contain" },
  { value: "map", label: "地圖/資訊圖", ratio: "完整顯示", hint: "不裁切，使用 contain" },
  { value: "freeform", label: "自由圖片", ratio: "依版面", hint: "特殊版位使用" }
];

export const focalPointOptions = [
  { value: "center", label: "置中" },
  { value: "top", label: "靠上" },
  { value: "bottom", label: "靠下" },
  { value: "left", label: "靠左" },
  { value: "right", label: "靠右" },
  { value: "top-left", label: "左上" },
  { value: "top-right", label: "右上" },
  { value: "bottom-left", label: "左下" },
  { value: "bottom-right", label: "右下" }
];

export function getImageUsageOption(value = "card") {
  return imageUsageOptions.find((option) => option.value === value) || imageUsageOptions.find((option) => option.value === "card");
}

export function getFocalPointOption(value = "center") {
  return focalPointOptions.find((option) => option.value === value) || focalPointOptions[0];
}

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
    .select("id, bucket, storage_path, public_url, file_name, alt_text, caption, image_usage, focal_point, width, height, created_at")
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
  imageUsage = "card",
  focalPoint = "center",
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
      image_usage: getImageUsageOption(imageUsage)?.value || "card",
      focal_point: getFocalPointOption(focalPoint)?.value || "center",
      visibility: "public",
      is_enabled: true
    })
    .select("id, bucket, storage_path, public_url, file_name, alt_text, caption, image_usage, focal_point, width, height, created_at")
    .single();

  if (insertError) throw insertError;
  return data;
}
