import { supabase, supabaseStorageBuckets } from "../lib/supabaseClient.js";

export const defaultImageBucket = supabaseStorageBuckets.publicImages;

export const imageUsageOptions = [
  { value: "hero", label: "首頁 Hero", ratio: "21:9", hint: "橫幅大圖，建議 1920x900 以上" },
  { value: "service_hero", label: "服務頁 Hero", ratio: "4:3", hint: "服務頁右側主圖，建議 1400x1050" },
  { value: "article_cover", label: "文章封面", ratio: "16:9", hint: "健康3.0與文章內頁封面，建議 1200x675" },
  { value: "card", label: "卡片縮圖", ratio: "4:3", hint: "一般卡片、列表與區塊圖片" },
  { value: "milestone", label: "大事記圖片", ratio: "1:1", hint: "大事記時間軸使用，固定正方形" },
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

const imageUsageRatios = {
  hero: 21 / 9,
  service_hero: 4 / 3,
  article_cover: 16 / 9,
  card: 4 / 3,
  milestone: 1,
  square: 1,
  avatar: 1
};

const cropOutputSizes = {
  hero: { width: 1920, height: 823 },
  service_hero: { width: 1400, height: 1050 },
  article_cover: { width: 1600, height: 900 },
  card: { width: 1200, height: 900 },
  milestone: { width: 1200, height: 1200 },
  square: { width: 1200, height: 1200 },
  avatar: { width: 900, height: 900 }
};

const responsivePreviewProfiles = {
  hero: [
    { key: "desktop", label: "網頁", ratio: "21 / 9" },
    { key: "tablet", label: "平板", ratio: "16 / 9" },
    { key: "mobile", label: "手機", ratio: "4 / 5" }
  ],
  service_hero: [
    { key: "desktop", label: "網頁", ratio: "4 / 3" },
    { key: "tablet", label: "平板", ratio: "3 / 2" },
    { key: "mobile", label: "手機", ratio: "4 / 3" }
  ],
  article_cover: [
    { key: "desktop", label: "網頁", ratio: "16 / 9" },
    { key: "tablet", label: "平板", ratio: "16 / 10" },
    { key: "mobile", label: "手機", ratio: "4 / 3" }
  ],
  card: [
    { key: "desktop", label: "網頁", ratio: "4 / 3" },
    { key: "tablet", label: "平板", ratio: "4 / 3" },
    { key: "mobile", label: "手機", ratio: "1 / 1" }
  ],
  milestone: [
    { key: "desktop", label: "網頁", ratio: "1 / 1" },
    { key: "tablet", label: "平板", ratio: "1 / 1" },
    { key: "mobile", label: "手機", ratio: "1 / 1" }
  ],
  square: [
    { key: "desktop", label: "網頁", ratio: "1 / 1" },
    { key: "tablet", label: "平板", ratio: "1 / 1" },
    { key: "mobile", label: "手機", ratio: "1 / 1" }
  ],
  avatar: [
    { key: "desktop", label: "網頁", ratio: "1 / 1" },
    { key: "tablet", label: "平板", ratio: "1 / 1" },
    { key: "mobile", label: "手機", ratio: "1 / 1" }
  ]
};

function getImageUsageRatio(value = "card") {
  return imageUsageRatios[value] || null;
}

function getResponsivePreviewProfile(value = "card") {
  return responsivePreviewProfiles[value] || responsivePreviewProfiles.card;
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("圖片讀取失敗，請換一張圖片再試。"));
    };
    image.src = objectUrl;
  });
}

function clamp(value, min, max) {
  if (min > max) return (min + max) / 2;
  return Math.min(Math.max(value, min), max);
}

function makeCroppedFileName(name = "image.jpg") {
  const extension = name.toLowerCase().endsWith(".png") ? "png" : "jpg";
  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "image";
  return `${base}-cropped.${extension}`;
}

function canvasToFile(canvas, originalFile) {
  const isPng = originalFile.type === "image/png";
  const mimeType = isPng ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("裁切圖片失敗，請再試一次。"));
        return;
      }
      resolve(new File([blob], makeCroppedFileName(originalFile.name), {
        type: mimeType,
        lastModified: Date.now()
      }));
    }, mimeType, isPng ? undefined : 0.92);
  });
}

function createCropModal() {
  let modal = document.querySelector("[data-image-crop-modal]");
  if (modal) return modal;

  modal = document.createElement("section");
  modal.className = "admin-modal admin-crop-modal";
  modal.hidden = true;
  modal.dataset.imageCropModal = "true";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div class="admin-modal-panel admin-crop-panel">
      <header>
        <div>
          <p class="admin-kicker">IMAGE CROP</p>
          <h2>調整圖片裁切</h2>
        </div>
        <button type="button" data-crop-cancel>取消</button>
      </header>
      <div class="admin-crop-layout">
        <div>
          <div class="admin-crop-frame" data-crop-frame>
            <img alt="裁切預覽" data-crop-image />
          </div>
          <p class="admin-crop-hint" data-crop-hint></p>
        </div>
        <aside class="admin-crop-tools">
          <strong data-crop-title>圖片比例不符合版位</strong>
          <p data-crop-copy></p>
          <label>
            縮放
            <input type="range" min="1" max="3" step="0.01" value="1" data-crop-zoom />
          </label>
          <div class="admin-crop-device-preview">
            <div>
              <span>RWD 可視範圍</span>
              <small>拖曳左側圖片時，這裡會同步顯示各裝置最可能看到的畫面。</small>
            </div>
            <div class="admin-crop-device-grid" data-crop-device-grid></div>
          </div>
          <div class="admin-crop-actions">
            <button type="button" data-crop-skip>保留原圖</button>
            <button type="button" data-crop-apply>套用裁切</button>
          </div>
        </aside>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

export async function prepareImageForUpload(file, imageUsage = "card") {
  const ratio = getImageUsageRatio(imageUsage);
  if (!file || !ratio || !file.type?.startsWith("image/")) return file;

  const image = await readImage(file);
  const currentRatio = image.naturalWidth / image.naturalHeight;
  const ratioIsAlreadySafe = Math.abs(currentRatio - ratio) / ratio < 0.035;

  return new Promise((resolve) => {
    const modal = createCropModal();
    const frame = modal.querySelector("[data-crop-frame]");
    const preview = modal.querySelector("[data-crop-image]");
    const zoomInput = modal.querySelector("[data-crop-zoom]");
    const hint = modal.querySelector("[data-crop-hint]");
    const title = modal.querySelector("[data-crop-title]");
    const copy = modal.querySelector("[data-crop-copy]");
    const deviceGrid = modal.querySelector("[data-crop-device-grid]");
    const usageOption = getImageUsageOption(imageUsage);
    const outputSize = cropOutputSizes[imageUsage] || cropOutputSizes.card;
    const previewProfile = getResponsivePreviewProfile(imageUsage);
    let objectUrl = URL.createObjectURL(file);
    let baseScale = 1;
    let zoom = 1;
    let x = 0;
    let y = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let settled = false;
    let previewFrameRequest = 0;

    function cleanup(result) {
      if (settled) return;
      settled = true;
      if (previewFrameRequest) cancelAnimationFrame(previewFrameRequest);
      URL.revokeObjectURL(objectUrl);
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      preview.src = "";
      resolve(result);
    }

    function updateImage() {
      const rect = frame.getBoundingClientRect();
      const scale = baseScale * zoom;
      const renderedWidth = image.naturalWidth * scale;
      const renderedHeight = image.naturalHeight * scale;
      x = clamp(x, rect.width - renderedWidth, 0);
      y = clamp(y, rect.height - renderedHeight, 0);
      preview.style.width = `${renderedWidth}px`;
      preview.style.height = `${renderedHeight}px`;
      preview.style.transform = `translate(${x}px, ${y}px)`;
      updateDevicePreviews();
    }

    function getCropSourceRect() {
      const rect = frame.getBoundingClientRect();
      const scale = baseScale * zoom;
      const sx = clamp(-x / scale, 0, image.naturalWidth);
      const sy = clamp(-y / scale, 0, image.naturalHeight);
      const sw = clamp(rect.width / scale, 1, image.naturalWidth - sx);
      const sh = clamp(rect.height / scale, 1, image.naturalHeight - sy);
      return { sx, sy, sw, sh };
    }

    function drawBaseCrop() {
      const { sx, sy, sw, sh } = getCropSourceRect();
      const canvas = document.createElement("canvas");
      canvas.width = outputSize.width;
      canvas.height = outputSize.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      return canvas;
    }

    function drawDevicePreview(baseCanvas, previewRatio) {
      const baseRatio = baseCanvas.width / baseCanvas.height;
      const canvas = document.createElement("canvas");
      canvas.width = 420;
      canvas.height = Math.round(canvas.width / previewRatio);
      const context = canvas.getContext("2d");
      let sx = 0;
      let sy = 0;
      let sw = baseCanvas.width;
      let sh = baseCanvas.height;

      if (baseRatio > previewRatio) {
        sw = baseCanvas.height * previewRatio;
        sx = (baseCanvas.width - sw) / 2;
      } else if (baseRatio < previewRatio) {
        sh = baseCanvas.width / previewRatio;
        sy = (baseCanvas.height - sh) / 2;
      }

      context.drawImage(baseCanvas, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.78);
    }

    function parseRatio(ratioText = "4 / 3") {
      const [width, height] = ratioText.split("/").map((part) => Number(part.trim()));
      return width && height ? width / height : ratio;
    }

    function updateDevicePreviews() {
      if (!deviceGrid) return;
      if (previewFrameRequest) cancelAnimationFrame(previewFrameRequest);
      previewFrameRequest = requestAnimationFrame(() => {
        const baseCanvas = drawBaseCrop();
        deviceGrid.querySelectorAll("[data-device-preview-image]").forEach((previewImage) => {
          const previewRatio = parseRatio(previewImage.dataset.previewRatio);
          previewImage.src = drawDevicePreview(baseCanvas, previewRatio);
          previewImage.style.objectPosition = "center center";
        });
        previewFrameRequest = 0;
      });
    }

    function resetPosition() {
      const rect = frame.getBoundingClientRect();
      baseScale = Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
      zoom = Number(zoomInput.value || 1);
      const renderedWidth = image.naturalWidth * baseScale * zoom;
      const renderedHeight = image.naturalHeight * baseScale * zoom;
      x = (rect.width - renderedWidth) / 2;
      y = (rect.height - renderedHeight) / 2;
      updateImage();
    }

    async function applyCrop() {
      const canvas = drawBaseCrop();
      cleanup(await canvasToFile(canvas, file));
    }

    title.textContent = ratioIsAlreadySafe
      ? `確認${usageOption?.label || "此版位"}圖片裁切：${usageOption?.ratio || ""}`
      : `${usageOption?.label || "此版位"}建議比例：${usageOption?.ratio || ""}`;
    copy.textContent = ratioIsAlreadySafe
      ? `目前圖片為 ${image.naturalWidth} × ${image.naturalHeight}，比例已接近版位需求。仍可拖曳或放大微調重點，再確認桌機、平板、手機預覽。`
      : `目前圖片為 ${image.naturalWidth} × ${image.naturalHeight}，和版位比例不同。請拖曳圖片調整重點，並確認三種裝置預覽。`;
    hint.textContent = "左側是實際輸出的裁切範圍；右側是這張裁切後圖片放到網頁、平板、手機容器時的可視畫面。";
    deviceGrid.innerHTML = previewProfile.map((item) => `
      <figure class="admin-crop-device-card" data-device-preview="${item.key}">
        <span>${item.label}</span>
        <div style="aspect-ratio:${item.ratio}">
          <img src="${objectUrl}" alt="${item.label}端預覽" data-device-preview-image data-preview-ratio="${item.ratio}" />
        </div>
      </figure>
    `).join("");
    frame.style.aspectRatio = `${ratio}`;
    preview.src = objectUrl;
    zoomInput.value = "1";
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(resetPosition);

    zoomInput.oninput = () => {
      const rect = frame.getBoundingClientRect();
      const previousScale = baseScale * zoom;
      const centerX = rect.width / 2 - x;
      const centerY = rect.height / 2 - y;
      zoom = Number(zoomInput.value || 1);
      const nextScale = baseScale * zoom;
      x -= centerX * (nextScale / previousScale - 1);
      y -= centerY * (nextScale / previousScale - 1);
      updateImage();
    };

    frame.onpointerdown = (event) => {
      dragging = true;
      frame.setPointerCapture(event.pointerId);
      startX = event.clientX;
      startY = event.clientY;
      originX = x;
      originY = y;
    };
    frame.onpointermove = (event) => {
      if (!dragging) return;
      x = originX + event.clientX - startX;
      y = originY + event.clientY - startY;
      updateImage();
    };
    frame.onpointerup = () => {
      dragging = false;
    };
    frame.onpointercancel = () => {
      dragging = false;
    };

    modal.querySelector("[data-crop-cancel]").onclick = () => cleanup(null);
    modal.querySelector("[data-crop-skip]").onclick = () => cleanup(file);
    modal.querySelector("[data-crop-apply]").onclick = applyCrop;
    modal.onclick = (event) => {
      if (event.target === modal) cleanup(null);
    };
  });
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
