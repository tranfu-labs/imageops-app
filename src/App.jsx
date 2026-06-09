import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Box,
  Braces,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Image as ImageIcon,
  Languages,
  Layers3,
  Lock,
  Monitor,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Upload,
  Wand2,
  Zap,
  X,
} from "lucide-react";

const routes = {
  home: "home",
  compress: "compress",
  convert: "convert",
  enhance: "enhance",
  watermark: "watermark",
};

const routePaths = {
  [routes.home]: "/",
  [routes.compress]: "/compress",
  [routes.convert]: "/convert",
  [routes.enhance]: "/enhance",
  [routes.watermark]: "/watermark",
};

const routesByPath = Object.fromEntries(Object.entries(routePaths).map(([route, path]) => [path, route]));

const toolBase = {
  compress: {
    id: "compress",
    icon: Box,
    tone: "green",
    defaultFormat: "image/webp",
    outputName: "compressed",
  },
  convert: {
    id: "convert",
    icon: FileImage,
    tone: "blue",
    defaultFormat: "image/webp",
    outputName: "converted",
  },
  enhance: {
    id: "enhance",
    icon: Sparkles,
    tone: "purple",
    defaultFormat: "image/webp",
    outputName: "enhanced",
  },
  watermark: {
    id: "watermark",
    icon: BadgeCheck,
    tone: "orange",
    defaultFormat: "image/webp",
    outputName: "watermarked",
  },
};

const futureBase = [
  { id: "api", icon: Braces, tone: "blue" },
  { id: "cli", icon: Terminal, tone: "dark" },
  { id: "ocr", icon: Monitor, tone: "green" },
  { id: "removeWatermark", icon: BadgeCheck, tone: "orange" },
  { id: "html", icon: FileImage, tone: "blue-soft" },
];

const messages = {
  zh: {
    brand: "图片助手",
    nav: { tools: "工具", api: "API", cli: "CLI" },
    actions: {
      start: "开始使用",
      upload: "上传图片",
      viewTools: "查看工具",
      download: "下载图片",
      downloadResult: "下载结果",
      downloadAll: "下载全部",
      back: "返回首页",
      processing: "处理中",
      closePreview: "关闭预览",
      previousImage: "上一张",
      nextImage: "下一张",
      openPreview: "放大查看",
    },
    hero: {
      titleLine1: "一站式图片处理",
      titleLine2: "与自动化工具平台",
      subtitle: "面向 Agent 时代的图片处理自动化基础设施",
    },
    trust: {
      safe: "安全处理",
      privacy: "隐私保护",
      local: "本地处理",
      scalable: "扩展高效",
      free: "免费使用",
    },
    preview: {
      drop: "拖拽图片到此处",
      clickUpload: "或点击上传",
      formats: "支持 JPG、PNG、WebP 等格式",
      original: "原图 2.4MB",
      compressed: "压缩后 348KB",
      done: "压缩完成",
      saved: "已减少 85%",
      quality: "画质 100%",
      more: "更多工具",
    },
    sections: {
      core: "核心工具",
      future: "更多能力，即将到来",
    },
    tools: {
      compress: {
        title: "图片压缩",
        subtitle: "智能压缩图片体积，在保证质感的同时减小文件大小。",
        action: "开始压缩",
      },
      convert: {
        title: "格式转换",
        subtitle: "支持 PNG、JPG、WebP 之间互转，适配不同发布场景。",
        action: "开始转换",
      },
      enhance: {
        title: "清晰度增强",
        subtitle: "增强边缘和细节，让发灰、发糊的图片更清晰。",
        action: "开始增强",
      },
      watermark: {
        title: "添加水印",
        subtitle: "上传水印图并批量添加到图片，适合运营、设计和内容发布场景。",
        action: "开始添加",
      },
    },
    future: {
      api: { label: "API", text: "强大的 API 接口" },
      cli: { label: "CLI", text: "命令行工具" },
      ocr: { label: "OCR", text: "图片文字识别" },
      removeWatermark: { label: "去除水印", text: "合规去水印能力规划中" },
      html: { label: "HTML 转图片", text: "将网页转换为图片" },
    },
    uploader: {
      emptyPreviewTitle: "上传图片后查看预览",
      emptyPreviewText: "处理结果会在这里显示",
      original: "原图",
      result: "处理后",
      pending: "等待处理",
      reselect: "可重新选择",
      click: "或点击上传 JPG、PNG、WebP 图片",
      invalid: "请选择图片文件",
      missing: "请先上传图片",
      watermarkMissing: "请先上传水印图片",
      targetsMissing: "请先上传要加水印的图片",
      failed: "处理失败，请换一张图片试试",
      watermarkClick: "上传 PNG、JPG、WebP 水印图片",
      batchClick: "可拖拽或点击批量上传 JPG、PNG、WebP 图片",
      targetImages: "待加水印图片",
      watermarkImage: "水印图片",
      selected: "已选择",
      batchReady: "批量结果会在这里显示",
      noResults: "添加水印后查看结果",
    },
    settings: {
      outputFormat: "输出格式",
      quality: "画质",
      strength: "增强强度",
      watermarkOpacity: "水印透明度",
      watermarkSize: "水印大小",
      watermarkPosition: "水印位置",
      original: "原图",
      result: "结果",
      reduced: "减少",
      total: "总数",
      completed: "完成",
      positionBottomRight: "右下角",
      positionBottomLeft: "左下角",
      positionTopRight: "右上角",
      positionTopLeft: "左上角",
      positionCenter: "居中",
    },
    toggles: {
      language: "EN",
      dark: "暗色模式",
      light: "白色模式",
    },
  },
  en: {
    brand: "ImageOps",
    nav: { tools: "Tools", api: "API", cli: "CLI" },
    actions: {
      start: "Start",
      upload: "Upload image",
      viewTools: "View tools",
      download: "Download",
      downloadResult: "Download result",
      downloadAll: "Download all",
      back: "Back home",
      processing: "Processing",
      closePreview: "Close preview",
      previousImage: "Previous image",
      nextImage: "Next image",
      openPreview: "Open preview",
    },
    hero: {
      titleLine1: "All-in-one image",
      titleLine2: "automation toolkit",
      subtitle: "Image processing automation infrastructure for the Agent era",
    },
    trust: {
      safe: "Secure",
      privacy: "Private",
      local: "Local first",
      scalable: "Extensible",
      free: "Free to use",
    },
    preview: {
      drop: "Drop image here",
      clickUpload: "or click to upload",
      formats: "JPG, PNG, WebP supported",
      original: "Original 2.4MB",
      compressed: "Compressed 348KB",
      done: "Compressed",
      saved: "85% saved",
      quality: "Quality 100%",
      more: "More tools",
    },
    sections: {
      core: "Core tools",
      future: "More capabilities coming soon",
    },
    tools: {
      compress: {
        title: "Image compression",
        subtitle: "Reduce file size while keeping visual quality under control.",
        action: "Compress",
      },
      convert: {
        title: "Format conversion",
        subtitle: "Convert between PNG, JPG, and WebP for different publishing needs.",
        action: "Convert",
      },
      enhance: {
        title: "Clarity enhancement",
        subtitle: "Improve edges and detail so dull or soft images look clearer.",
        action: "Enhance",
      },
      watermark: {
        title: "Add watermark",
        subtitle: "Upload a watermark image and apply it to multiple images in one batch.",
        action: "Add watermark",
      },
    },
    future: {
      api: { label: "API", text: "Powerful API access" },
      cli: { label: "CLI", text: "Command-line tools" },
      ocr: { label: "OCR", text: "Extract text from images" },
      removeWatermark: { label: "Remove watermark", text: "Compliant removal planned" },
      html: { label: "HTML to image", text: "Turn web pages into images" },
    },
    uploader: {
      emptyPreviewTitle: "Upload to preview",
      emptyPreviewText: "Processed results will appear here",
      original: "Original",
      result: "Processed",
      pending: "Waiting",
      reselect: "Choose another",
      click: "or click to upload JPG, PNG, or WebP",
      invalid: "Please choose an image file",
      missing: "Please upload an image first",
      watermarkMissing: "Please upload a watermark image first",
      targetsMissing: "Please upload target images first",
      failed: "Processing failed. Try another image.",
      watermarkClick: "Upload a PNG, JPG, or WebP watermark",
      batchClick: "Drop or click to upload JPG, PNG, or WebP images in batch",
      targetImages: "Target images",
      watermarkImage: "Watermark image",
      selected: "Selected",
      batchReady: "Batch results will appear here",
      noResults: "Add watermark to preview results",
    },
    settings: {
      outputFormat: "Output format",
      quality: "Quality",
      strength: "Enhancement strength",
      watermarkOpacity: "Watermark opacity",
      watermarkSize: "Watermark size",
      watermarkPosition: "Watermark position",
      original: "Original",
      result: "Result",
      reduced: "Reduced",
      total: "Total",
      completed: "Done",
      positionBottomRight: "Bottom right",
      positionBottomLeft: "Bottom left",
      positionTopRight: "Top right",
      positionTopLeft: "Top left",
      positionCenter: "Center",
    },
    toggles: {
      language: "中文",
      dark: "Dark mode",
      light: "Light mode",
    },
  },
};

function getInitialLocale() {
  const saved = localStorage.getItem("imageops-locale") || localStorage.getItem("image-helper-locale");
  return saved === "en" ? "en" : "zh";
}

function getInitialTheme() {
  const saved = localStorage.getItem("imageops-theme") || localStorage.getItem("image-helper-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function usePathRoute() {
  const readRoute = () => {
    const hashRoute = window.location.hash.replace("#", "");
    if (routes[hashRoute]) {
      window.history.replaceState({}, "", routePaths[hashRoute]);
      return hashRoute;
    }

    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    return routesByPath[path] || routes.home;
  };
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onRouteChange = () => setRoute(readRoute());
    window.addEventListener("popstate", onRouteChange);
    window.addEventListener("hashchange", onRouteChange);
    return () => {
      window.removeEventListener("popstate", onRouteChange);
      window.removeEventListener("hashchange", onRouteChange);
    };
  }, []);

  const navigate = useCallback((nextRoute) => {
    const nextPath = routePaths[nextRoute] || routePaths[routes.home];
    if (window.location.pathname !== nextPath || window.location.hash) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute(nextRoute);
  }, []);

  return [route, navigate];
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function getExtension(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, mime });
          return;
        }
        canvas.toBlob((fallbackBlob) => resolve({ blob: fallbackBlob, mime: "image/png" }), "image/png");
      },
      mime,
      quality,
    );
  });
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let j = 0; j < 8; j += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
})();

function getCrc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value >>> 0, true);
}

function makeZipPart(size) {
  const bytes = new Uint8Array(size);
  return { bytes, view: new DataView(bytes.buffer) };
}

async function createZipBlob(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const safeName = file.name.replace(/[\\/]+/g, "-");
    const nameBytes = encoder.encode(safeName);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const crc = getCrc32(data);

    const local = makeZipPart(30 + nameBytes.length);
    writeUint32(local.view, 0, 0x04034b50);
    writeUint16(local.view, 4, 20);
    writeUint16(local.view, 6, 0);
    writeUint16(local.view, 8, 0);
    writeUint16(local.view, 10, 0);
    writeUint16(local.view, 12, 0);
    writeUint32(local.view, 14, crc);
    writeUint32(local.view, 18, data.length);
    writeUint32(local.view, 22, data.length);
    writeUint16(local.view, 26, nameBytes.length);
    writeUint16(local.view, 28, 0);
    local.bytes.set(nameBytes, 30);
    localParts.push(local.bytes, data);

    const central = makeZipPart(46 + nameBytes.length);
    writeUint32(central.view, 0, 0x02014b50);
    writeUint16(central.view, 4, 20);
    writeUint16(central.view, 6, 20);
    writeUint16(central.view, 8, 0);
    writeUint16(central.view, 10, 0);
    writeUint16(central.view, 12, 0);
    writeUint16(central.view, 14, 0);
    writeUint32(central.view, 16, crc);
    writeUint32(central.view, 20, data.length);
    writeUint32(central.view, 24, data.length);
    writeUint16(central.view, 28, nameBytes.length);
    writeUint16(central.view, 30, 0);
    writeUint16(central.view, 32, 0);
    writeUint16(central.view, 34, 0);
    writeUint16(central.view, 36, 0);
    writeUint32(central.view, 38, 0);
    writeUint32(central.view, 42, offset);
    central.bytes.set(nameBytes, 46);
    centralParts.push(central.bytes);

    offset += local.bytes.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = makeZipPart(22);
  writeUint32(end.view, 0, 0x06054b50);
  writeUint16(end.view, 4, 0);
  writeUint16(end.view, 6, 0);
  writeUint16(end.view, 8, files.length);
  writeUint16(end.view, 10, files.length);
  writeUint32(end.view, 12, centralSize);
  writeUint32(end.view, 16, offset);
  writeUint16(end.view, 20, 0);

  return new Blob([...localParts, ...centralParts, end.bytes], { type: "application/zip" });
}

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

function smoothStep(edge0, edge1, value) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function enhanceImageData(imageData, strength) {
  const { data, width, height } = imageData;
  const source = new Uint8ClampedArray(data);
  const amount = 0.18 + (strength / 100) * 0.5;
  const threshold = 5 + (100 - strength) * 0.08;
  const contrast = 1 + (strength / 100) * 0.055;
  const saturation = 1 + (strength / 100) * 0.075;

  const read = (x, y, c) => {
    const cx = Math.max(0, Math.min(width - 1, x));
    const cy = Math.max(0, Math.min(height - 1, y));
    return source[(cy * width + cx) * 4 + c];
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const centerR = source[idx];
      const centerG = source[idx + 1];
      const centerB = source[idx + 2];
      const blur = [0, 0, 0];

      for (let c = 0; c < 3; c += 1) {
        blur[c] = (
          read(x - 1, y - 1, c) +
          read(x + 1, y - 1, c) +
          read(x - 1, y + 1, c) +
          read(x + 1, y + 1, c) +
          2 * read(x, y - 1, c) +
          2 * read(x - 1, y, c) +
          2 * read(x + 1, y, c) +
          2 * read(x, y + 1, c) +
          4 * read(x, y, c)
        ) / 16;
      }

      const sourceLum = centerR * 0.299 + centerG * 0.587 + centerB * 0.114;
      const blurLum = blur[0] * 0.299 + blur[1] * 0.587 + blur[2] * 0.114;
      const detail = sourceLum - blurLum;
      const edgeGate = smoothStep(threshold, threshold + 32, Math.abs(detail));
      const highlightGuard = sourceLum > 232 ? 0.65 : 1;
      const localAmount = amount * edgeGate * highlightGuard;

      for (let c = 0; c < 3; c += 1) {
        const sharpened = source[idx + c] + (source[idx + c] - blur[c]) * localAmount;
        data[idx + c] = clamp((sharpened - 128) * contrast + 128);
      }

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      data[idx] = clamp(gray + (r - gray) * saturation);
      data[idx + 1] = clamp(gray + (g - gray) * saturation);
      data[idx + 2] = clamp(gray + (b - gray) * saturation);
    }
  }

  return imageData;
}

async function processImage({ file, mode, outputMime, quality, strength }) {
  const { image, url } = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: mode === "enhance" });
  const maxEdge = mode === "enhance" ? 3200 : 2400;
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  canvas.width = width;
  canvas.height = height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, width, height);

  if (mode === "enhance") {
    const imageData = ctx.getImageData(0, 0, width, height);
    ctx.putImageData(enhanceImageData(imageData, strength), 0, 0);
  }

  URL.revokeObjectURL(url);
  return canvasToBlob(canvas, outputMime, quality);
}

function getWatermarkPosition(position, canvasWidth, canvasHeight, markWidth, markHeight, margin) {
  const positions = {
    "top-left": [margin, margin],
    "top-right": [canvasWidth - markWidth - margin, margin],
    "bottom-left": [margin, canvasHeight - markHeight - margin],
    "bottom-right": [canvasWidth - markWidth - margin, canvasHeight - markHeight - margin],
    center: [(canvasWidth - markWidth) / 2, (canvasHeight - markHeight) / 2],
  };
  return positions[position] || positions["bottom-right"];
}

async function processWatermarkImage({
  file,
  watermarkFile,
  outputMime,
  quality,
  opacity,
  scale,
  position,
}) {
  const [{ image, url }, { image: watermarkImage, url: watermarkUrl }] = await Promise.all([
    loadImage(file),
    loadImage(watermarkFile),
  ]);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const maxEdge = 3200;
  const imageScale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * imageScale));
  const height = Math.max(1, Math.round(image.naturalHeight * imageScale));

  canvas.width = width;
  canvas.height = height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, width, height);

  const margin = Math.max(16, Math.round(Math.min(width, height) * 0.035));
  const maxMarkWidth = Math.max(24, width - margin * 2);
  const maxMarkHeight = Math.max(24, height - margin * 2);
  const requestedWidth = Math.max(24, Math.round(maxMarkWidth * (scale / 100)));
  const requestedHeight = Math.max(24, Math.round(requestedWidth * (watermarkImage.naturalHeight / watermarkImage.naturalWidth)));
  const fitScale = Math.min(1, maxMarkWidth / requestedWidth, maxMarkHeight / requestedHeight);
  const markWidth = Math.max(24, Math.round(requestedWidth * fitScale));
  const markHeight = Math.max(24, Math.round(requestedHeight * fitScale));
  const [x, y] = getWatermarkPosition(position, width, height, markWidth, markHeight, margin);

  ctx.globalAlpha = opacity / 100;
  ctx.drawImage(watermarkImage, x, y, markWidth, markHeight);
  ctx.globalAlpha = 1;

  URL.revokeObjectURL(url);
  URL.revokeObjectURL(watermarkUrl);
  return canvasToBlob(canvas, outputMime, outputMime === "image/png" ? undefined : quality);
}

function makeFileId(file, index = 0) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}-${Math.random().toString(36).slice(2)}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.documentElement.dataset.lastImageopsDownload = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 400);
}

function ImageLightbox({ images, index, setIndex, onClose, t }) {
  const current = images[index];
  const hasMultiple = images.length > 1;

  const move = useCallback((delta) => {
    setIndex((currentIndex) => (currentIndex + delta + images.length) % images.length);
  }, [images.length, setIndex]);

  useEffect(() => {
    if (!current) onClose();
  }, [current, onClose]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasMultiple) move(-1);
      if (event.key === "ArrowRight" && hasMultiple) move(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, move, onClose]);

  if (!current) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t.actions.openPreview}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button className="lightbox-close" type="button" onClick={onClose} aria-label={t.actions.closePreview}>
        <X size={22} />
      </button>

      {hasMultiple && (
        <button className="lightbox-nav prev" type="button" onClick={() => move(-1)} aria-label={t.actions.previousImage}>
          <ChevronLeft size={30} />
        </button>
      )}

      <figure className="lightbox-figure">
        <img src={current.src} alt={current.alt || current.label || ""} />
        <figcaption>
          <strong>{current.label}</strong>
          {hasMultiple && <span>{index + 1} / {images.length}</span>}
        </figcaption>
      </figure>

      {hasMultiple && (
        <button className="lightbox-nav next" type="button" onClick={() => move(1)} aria-label={t.actions.nextImage}>
          <ChevronRight size={30} />
        </button>
      )}
    </div>
  );
}

function Header({ route, navigate, locale, setLocale, theme, setTheme, t }) {
  const navItems = [
    { label: t.nav.tools, target: "compress", activeRoutes: ["compress", "convert", "enhance", "watermark"] },
    { label: t.nav.api, target: "home", activeRoutes: [] },
    { label: t.nav.cli, target: "home", activeRoutes: [] },
  ];

  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => navigate(routes.home)} aria-label={t.brand}>
        <span className="brand-mark">
          <img src="/brand/apple-touch-icon-20260609-tight.png" alt="" />
        </span>
        <span>{t.brand}</span>
      </button>

      <nav className="top-nav" aria-label="main navigation">
        {navItems.map(({ label, target, activeRoutes }) => (
          <button
            className={activeRoutes.includes(route) ? "active" : ""}
            key={label}
            type="button"
            onClick={() => navigate(target)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <button className="header-toggle" type="button" onClick={() => setLocale(locale === "zh" ? "en" : "zh")}>
          <Languages size={17} />
          {t.toggles.language}
        </button>
        <button
          className="header-toggle icon-only"
          type="button"
          aria-label={theme === "dark" ? t.toggles.light : t.toggles.dark}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="primary small" type="button" onClick={() => navigate(routes.compress)}>
          {t.actions.start}
        </button>
      </div>
    </header>
  );
}

function HeroPreview({ t }) {
  return (
    <section className="preview-shell" aria-label="image processing preview">
      <div className="preview-sidebar">
        <div className="drop-mini">
          <Upload size={28} strokeWidth={1.8} />
          <strong>{t.preview.drop}</strong>
          <span>{t.preview.clickUpload}</span>
          <small>{t.preview.formats}</small>
        </div>

        <div className="mini-tool active">
          <Zap size={18} />
          <span>{t.tools.compress.title}</span>
          <b />
        </div>
        <div className="mini-tool">
          <RefreshCw size={18} />
          <span>{t.tools.convert.title}</span>
        </div>
        <div className="mini-tool">
          <Sparkles size={18} />
          <span>{t.tools.enhance.title}</span>
        </div>
        <div className="mini-tool">
          <BadgeCheck size={18} />
          <span>{t.tools.watermark.title}</span>
        </div>

        <button className="more-tools" type="button">
          {t.preview.more}
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="preview-main">
        <div className="image-comparison">
          <img src="/sample-mountain.png" alt="" />
          <span className="image-badge before">{t.preview.original}</span>
          <span className="image-badge after">{t.preview.compressed}</span>
        </div>

        <div className="result-bar">
          <div className="saved">
            <BadgeCheck size={26} />
            <span>
              <strong>{t.preview.done}</strong>
              <small>{t.preview.saved}</small>
            </span>
          </div>
          <button className="select-like" type="button">WebP</button>
          <button className="select-like" type="button">{t.preview.quality}</button>
          <button className="download-like" type="button">
            <ArrowDownToLine size={16} />
            {t.actions.download}
          </button>
        </div>
      </div>
    </section>
  );
}

function Home({ navigate, t }) {
  const tools = Object.values(toolBase).map((tool) => ({ ...tool, ...t.tools[tool.id] }));

  return (
    <main className="page home-page page-enter">
      <section className="hero">
        <div className="hero-copy">
          <h1>
            {t.hero.titleLine1}
            <br />
            {t.hero.titleLine2}
          </h1>
          <p>{t.hero.subtitle}</p>

          <div className="hero-actions">
            <button className="primary" type="button" onClick={() => navigate(routes.compress)}>
              <Upload size={22} />
              {t.actions.upload}
            </button>
            <button className="secondary" type="button" onClick={() => navigate(routes.compress)}>
              {t.actions.viewTools}
            </button>
          </div>

          <div className="trust-row" aria-label="product features">
            <span><Lock size={18} /> {t.trust.safe}</span>
            <span><ShieldCheck size={18} /> {t.trust.privacy}</span>
            <span><Monitor size={18} /> {t.trust.local}</span>
            <span><Layers3 size={18} /> {t.trust.scalable}</span>
            <span><BadgeCheck size={18} /> {t.trust.free}</span>
          </div>
        </div>

        <HeroPreview t={t} />
      </section>

      <section className="section">
        <h2>{t.sections.core}</h2>
        <div className="tool-grid">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button className="tool-card" key={tool.id} type="button" onClick={() => navigate(tool.id)}>
                <span className={`tool-icon ${tool.tone}`}>
                  <Icon size={28} />
                </span>
                <span>
                  <strong>{tool.title}</strong>
                  <small>{tool.subtitle}</small>
                </span>
                <ArrowRight size={21} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="future-panel">
        <h2>{t.sections.future}</h2>
        <div className="future-grid">
          {futureBase.map((item) => {
            const Icon = item.icon;
            const copy = t.future[item.id];
            return (
              <div className="future-item" key={item.id}>
                <span className={`future-icon ${item.tone}`}>
                  <Icon size={25} />
                </span>
                <span>
                  <strong>{copy.label}</strong>
                  <small>{copy.text}</small>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function EmptyPreview({ file, originalUrl, resultUrl, t, onOpenPreview }) {
  if (!file) {
    return (
      <div className="empty-preview">
        <ImageIcon size={44} />
        <strong>{t.uploader.emptyPreviewTitle}</strong>
        <span>{t.uploader.emptyPreviewText}</span>
      </div>
    );
  }

  return (
    <div className="compare-live">
      <figure>
        <button className="preview-image-button" type="button" onClick={() => onOpenPreview(0)} aria-label={t.actions.openPreview}>
          <img src={originalUrl} alt={t.uploader.original} />
        </button>
        <figcaption>{t.uploader.original}</figcaption>
      </figure>
      <figure>
        {resultUrl ? (
          <button className="preview-image-button" type="button" onClick={() => onOpenPreview(1)} aria-label={t.actions.openPreview}>
            <img src={resultUrl} alt={t.uploader.result} />
          </button>
        ) : (
          <div className="pending-result">{t.uploader.pending}</div>
        )}
        <figcaption>{t.uploader.result}</figcaption>
      </figure>
    </div>
  );
}

function ToolPage({ tool, navigate, t }) {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState(null);
  const [resultMime, setResultMime] = useState(tool.defaultFormat);
  const [quality, setQuality] = useState(1);
  const [strength, setStrength] = useState(55);
  const [outputMime, setOutputMime] = useState(tool.defaultFormat);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const processingRef = useRef(false);
  const Icon = tool.icon;

  useEffect(() => {
    setFile(null);
    setOriginalUrl("");
    setResultUrl("");
    setResultBlob(null);
    setResultMime(tool.defaultFormat);
    setOutputMime(tool.defaultFormat);
    setStatus("idle");
    setError("");
  }, [tool]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  const outputSize = resultBlob?.size || 0;
  const savedRatio = file && outputSize ? Math.max(0, Math.round((1 - outputSize / file.size) * 100)) : 0;

  const handleFile = useCallback((nextFile) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError(t.uploader.invalid);
      return;
    }
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(nextFile);
    setOriginalUrl(URL.createObjectURL(nextFile));
    setResultUrl("");
    setResultBlob(null);
    setStatus("ready");
    setError("");
  }, [originalUrl, resultUrl, t.uploader.invalid]);

  const runProcess = useCallback(async () => {
    if (processingRef.current) return;
    if (!file) {
      setError(t.uploader.missing);
      return;
    }

    processingRef.current = true;
    setStatus("processing");
    setError("");
    try {
      const { blob, mime: actualMime } = await processImage({
        file,
        mode: tool.id,
        outputMime,
        quality,
        strength,
      });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const nextUrl = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultMime(actualMime);
      setResultUrl(nextUrl);
      setStatus("done");
    } catch {
      setError(t.uploader.failed);
      setStatus("ready");
    } finally {
      processingRef.current = false;
    }
  }, [file, outputMime, quality, resultUrl, strength, tool.id, t.uploader.failed, t.uploader.missing]);

  const onDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const downloadName = useMemo(() => {
    const base = file?.name?.replace(/\.[^.]+$/, "") || "image";
    return `${base}-${tool.outputName}.${getExtension(resultMime)}`;
  }, [file, resultMime, tool.outputName]);

  const previewImages = useMemo(() => [
    originalUrl ? { src: originalUrl, label: t.uploader.original, alt: t.uploader.original } : null,
    resultUrl ? { src: resultUrl, label: t.uploader.result, alt: t.uploader.result } : null,
  ].filter(Boolean), [originalUrl, resultUrl, t.uploader.original, t.uploader.result]);

  return (
    <main className="page tool-page page-enter">
      <button className="back-link" type="button" onClick={() => navigate(routes.home)}>
        <ArrowLeft size={18} />
        {t.actions.back}
      </button>

      <section className="tool-hero">
        <span className={`tool-icon large ${tool.tone}`}>
          <Icon size={32} />
        </span>
        <div>
          <h1>{tool.title}</h1>
          <p>{tool.subtitle}</p>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="processor-panel">
          <label
            className="upload-zone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
          >
            <input
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
              type="file"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <Upload size={34} />
            <strong>{file ? file.name : t.preview.drop}</strong>
            <span>{file ? `${formatBytes(file.size)} · ${t.uploader.reselect}` : t.uploader.click}</span>
          </label>

          <div className="settings-group">
            {(tool.id === "compress" || tool.id === "convert") && (
              <>
                <label>
                  <span>{t.settings.outputFormat}</span>
                  <select value={outputMime} onChange={(event) => setOutputMime(event.target.value)}>
                    <option value="image/webp">WebP</option>
                    <option value="image/jpeg">JPG</option>
                    <option value="image/png">PNG</option>
                  </select>
                </label>
                <label>
                  <span>{t.settings.quality} {Math.round(quality * 100)}%</span>
                  <input
                    min="0.35"
                    max="1"
                    step="0.01"
                    type="range"
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                  />
                </label>
              </>
            )}

            {tool.id === "enhance" && (
              <>
                <label>
                  <span>{t.settings.strength} {strength}%</span>
                  <input
                    min="20"
                    max="100"
                    step="1"
                    type="range"
                    value={strength}
                    onChange={(event) => setStrength(Number(event.target.value))}
                  />
                </label>
                <label>
                  <span>{t.settings.outputFormat}</span>
                  <select value={outputMime} onChange={(event) => setOutputMime(event.target.value)}>
                    <option value="image/webp">WebP</option>
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPG</option>
                  </select>
                </label>
              </>
            )}
          </div>

          {error && <div className="error-note">{error}</div>}

          <div className="process-actions">
            <button className="primary" type="button" onClick={runProcess} disabled={status === "processing"}>
              {status === "processing" ? <RefreshCw className="spin" size={20} /> : <Wand2 size={20} />}
              {status === "processing" ? t.actions.processing : tool.action}
            </button>
            <a
              className={`secondary download-action ${resultBlob ? "" : "disabled"}`}
              href={resultUrl || undefined}
              download={downloadName}
              aria-disabled={!resultBlob}
            >
              <ArrowDownToLine size={19} />
              {t.actions.downloadResult}
            </a>
          </div>

          <div className="result-stats">
            <span>
              <small>{t.settings.original}</small>
              <strong>{formatBytes(file?.size || 0)}</strong>
            </span>
            <span>
              <small>{t.settings.result}</small>
              <strong>{formatBytes(outputSize)}</strong>
            </span>
            <span>
              <small>{t.settings.reduced}</small>
              <strong>{savedRatio}%</strong>
            </span>
          </div>
        </div>

        <div className="preview-panel">
          <EmptyPreview
            file={file}
            originalUrl={originalUrl}
            resultUrl={resultUrl}
            t={t}
            onOpenPreview={setLightboxIndex}
          />
        </div>
      </section>
      {lightboxIndex !== null && (
        <ImageLightbox
          images={previewImages}
          index={Math.min(lightboxIndex, previewImages.length - 1)}
          setIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          t={t}
        />
      )}
    </main>
  );
}

function WatermarkPage({ tool, navigate, t }) {
  const [targetItems, setTargetItems] = useState([]);
  const [watermarkFile, setWatermarkFile] = useState(null);
  const [watermarkUrl, setWatermarkUrl] = useState("");
  const [results, setResults] = useState([]);
  const targetItemsRef = useRef([]);
  const resultsRef = useRef([]);
  const watermarkUrlRef = useRef("");
  const [outputMime, setOutputMime] = useState(tool.defaultFormat);
  const [quality, setQuality] = useState(1);
  const [opacity, setOpacity] = useState(60);
  const [scale, setScale] = useState(18);
  const [position, setPosition] = useState("bottom-right");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const watermarkProcessingRef = useRef(false);
  const zipDownloadingRef = useRef(false);
  const Icon = tool.icon;

  useEffect(() => {
    targetItemsRef.current = targetItems;
  }, [targetItems]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    watermarkUrlRef.current = watermarkUrl;
  }, [watermarkUrl]);

  useEffect(() => () => {
    targetItemsRef.current.forEach((item) => URL.revokeObjectURL(item.originalUrl));
    resultsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    if (watermarkUrlRef.current) URL.revokeObjectURL(watermarkUrlRef.current);
  }, []);

  const clearResults = useCallback(() => {
    results.forEach((item) => URL.revokeObjectURL(item.url));
    setResults([]);
    setStatus(targetItems.length || watermarkFile ? "ready" : "idle");
  }, [results, targetItems.length, watermarkFile]);

  const handleTargetFiles = useCallback((fileList) => {
    const nextFiles = Array.from(fileList || []).filter((item) => item.type.startsWith("image/"));
    if (!nextFiles.length) {
      setError(t.uploader.invalid);
      return;
    }

    targetItems.forEach((item) => URL.revokeObjectURL(item.originalUrl));
    results.forEach((item) => URL.revokeObjectURL(item.url));
    const nextItems = nextFiles.map((file, index) => ({
      id: makeFileId(file, index),
      file,
      originalUrl: URL.createObjectURL(file),
    }));

    setTargetItems(nextItems);
    setResults([]);
    setStatus("ready");
    setError("");
  }, [results, targetItems, t.uploader.invalid]);

  const handleWatermarkFile = useCallback((nextFile) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError(t.uploader.invalid);
      return;
    }

    if (watermarkUrl) URL.revokeObjectURL(watermarkUrl);
    setWatermarkFile(nextFile);
    setWatermarkUrl(URL.createObjectURL(nextFile));
    clearResults();
    setStatus("ready");
    setError("");
  }, [clearResults, t.uploader.invalid, watermarkUrl]);

  const runWatermark = useCallback(async () => {
    if (watermarkProcessingRef.current) return;
    if (!watermarkFile) {
      setError(t.uploader.watermarkMissing);
      return;
    }
    if (!targetItems.length) {
      setError(t.uploader.targetsMissing);
      return;
    }

    watermarkProcessingRef.current = true;
    setStatus("processing");
    setError("");
    try {
      results.forEach((item) => URL.revokeObjectURL(item.url));
      const nextResults = [];
      for (const item of targetItems) {
        const { blob, mime } = await processWatermarkImage({
          file: item.file,
          watermarkFile,
          outputMime,
          quality,
          opacity,
          scale,
          position,
        });
        const base = item.file.name.replace(/\.[^.]+$/, "") || "image";
        nextResults.push({
          id: item.id,
          name: `${base}-${tool.outputName}.${getExtension(mime)}`,
          blob,
          mime,
          size: blob.size,
          url: URL.createObjectURL(blob),
        });
      }
      setResults(nextResults);
      setStatus("done");
    } catch {
      setError(t.uploader.failed);
      setStatus("ready");
    } finally {
      watermarkProcessingRef.current = false;
    }
  }, [
    opacity,
    outputMime,
    position,
    quality,
    results,
    scale,
    targetItems,
    tool.outputName,
    t.uploader.failed,
    t.uploader.targetsMissing,
    t.uploader.watermarkMissing,
    watermarkFile,
  ]);

  const onTargetDrop = (event) => {
    event.preventDefault();
    handleTargetFiles(event.dataTransfer.files);
  };

  const onWatermarkDrop = (event) => {
    event.preventDefault();
    handleWatermarkFile(event.dataTransfer.files?.[0]);
  };

  const downloadAll = useCallback(async () => {
    if (!results.length || zipDownloadingRef.current) return;
    zipDownloadingRef.current = true;
    try {
      const zipBlob = await createZipBlob(results);
      downloadBlob(zipBlob, "imageops-watermarked-results.zip");
    } finally {
      zipDownloadingRef.current = false;
    }
  }, [results]);

  const resultById = useMemo(() => new Map(results.map((item) => [item.id, item])), [results]);
  const lightboxImages = useMemo(() => targetItems.map((item) => {
    const result = resultById.get(item.id);
    return {
      src: result?.url || item.originalUrl,
      label: result?.name || item.file.name,
      alt: item.file.name,
    };
  }), [resultById, targetItems]);
  const completedCount = results.length;

  return (
    <main className="page tool-page page-enter">
      <button className="back-link" type="button" onClick={() => navigate(routes.home)}>
        <ArrowLeft size={18} />
        {t.actions.back}
      </button>

      <section className="tool-hero">
        <span className={`tool-icon large ${tool.tone}`}>
          <Icon size={32} />
        </span>
        <div>
          <h1>{tool.title}</h1>
          <p>{tool.subtitle}</p>
        </div>
      </section>

      <section className="workspace-grid watermark-workspace">
        <div className="processor-panel">
          <div className="watermark-upload-stack">
            <label
              className="upload-zone step-upload"
              onDragOver={(event) => event.preventDefault()}
              onDrop={onWatermarkDrop}
            >
              <span className="step-badge" aria-hidden="true">①</span>
              <input
                accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
                data-upload="watermark"
                type="file"
                onChange={(event) => handleWatermarkFile(event.target.files?.[0])}
              />
              <ImageIcon size={32} />
              <strong>{watermarkFile ? watermarkFile.name : t.uploader.watermarkImage}</strong>
              <span>{watermarkFile ? `${formatBytes(watermarkFile.size)} · ${t.uploader.reselect}` : t.uploader.watermarkClick}</span>
            </label>

            <label
              className="upload-zone step-upload"
              onDragOver={(event) => event.preventDefault()}
              onDrop={onTargetDrop}
            >
              <span className="step-badge" aria-hidden="true">②</span>
              <input
                accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
                data-upload="targets"
                multiple
                type="file"
                onChange={(event) => handleTargetFiles(event.target.files)}
              />
              <Upload size={32} />
              <strong>{targetItems.length ? `${targetItems.length} ${t.uploader.selected}` : t.uploader.targetImages}</strong>
              <span>{targetItems.length ? targetItems.map((item) => item.file.name).slice(0, 2).join(" · ") : t.uploader.batchClick}</span>
            </label>
          </div>

          <div className="settings-group">
            <label>
              <span>{t.settings.watermarkPosition}</span>
              <select value={position} onChange={(event) => setPosition(event.target.value)}>
                <option value="bottom-right">{t.settings.positionBottomRight}</option>
                <option value="bottom-left">{t.settings.positionBottomLeft}</option>
                <option value="top-right">{t.settings.positionTopRight}</option>
                <option value="top-left">{t.settings.positionTopLeft}</option>
                <option value="center">{t.settings.positionCenter}</option>
              </select>
            </label>
            <label>
              <span>{t.settings.watermarkOpacity} {opacity}%</span>
              <input
                min="10"
                max="100"
                step="1"
                type="range"
                value={opacity}
                onChange={(event) => setOpacity(Number(event.target.value))}
              />
            </label>
            <label>
              <span>{t.settings.watermarkSize} {scale}%</span>
              <input
                min="6"
                max="100"
                step="1"
                type="range"
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
              />
            </label>
            <label>
              <span>{t.settings.outputFormat}</span>
              <select value={outputMime} onChange={(event) => setOutputMime(event.target.value)}>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
              </select>
            </label>
            <label>
              <span>{t.settings.quality} {Math.round(quality * 100)}%</span>
              <input
                min="0.45"
                max="1"
                step="0.01"
                type="range"
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
              />
            </label>
          </div>

          {error && <div className="error-note">{error}</div>}

          <div className="process-actions">
            <button className="primary" type="button" onClick={runWatermark} disabled={status === "processing"}>
              {status === "processing" ? <RefreshCw className="spin" size={20} /> : <Wand2 size={20} />}
              {status === "processing" ? t.actions.processing : tool.action}
            </button>
            <button
              className={`secondary download-all-action ${completedCount ? "" : "disabled"}`}
              type="button"
              onClick={downloadAll}
              disabled={!completedCount}
            >
              <ArrowDownToLine size={19} />
              {t.actions.downloadAll}
            </button>
          </div>

          <div className="result-stats">
            <span>
              <small>{t.settings.total}</small>
              <strong>{targetItems.length}</strong>
            </span>
            <span>
              <small>{t.uploader.watermarkImage}</small>
              <strong>{watermarkFile ? formatBytes(watermarkFile.size) : "0 KB"}</strong>
            </span>
            <span>
              <small>{t.settings.completed}</small>
              <strong>{completedCount}</strong>
            </span>
          </div>
        </div>

        <div className="preview-panel">
          {!targetItems.length ? (
            <div className="empty-preview">
              <ImageIcon size={44} />
              <strong>{t.uploader.noResults}</strong>
              <span>{t.uploader.batchReady}</span>
            </div>
          ) : (
            <div className="batch-preview">
              {watermarkUrl && (
                <div className="watermark-summary">
                  <img src={watermarkUrl} alt={t.uploader.watermarkImage} />
                  <span>
                    <strong>{t.uploader.watermarkImage}</strong>
                    <small>{watermarkFile?.name}</small>
                  </span>
                </div>
              )}
              <div className="batch-grid">
                {targetItems.map((item, index) => {
                  const result = resultById.get(item.id);
                  return (
                    <figure className="batch-card" key={item.id}>
                      <button
                        className="batch-image preview-trigger"
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        aria-label={t.actions.openPreview}
                      >
                        <img src={result?.url || item.originalUrl} alt={item.file.name} />
                        <span>{result ? t.settings.result : t.uploader.pending}</span>
                      </button>
                      <figcaption>
                        <strong>{item.file.name}</strong>
                        <small>{result ? `${formatBytes(result.size)} · ${result.name}` : formatBytes(item.file.size)}</small>
                        {result && (
                          <a className="mini-download" href={result.url} download={result.name}>
                            <ArrowDownToLine size={15} />
                            {t.actions.downloadResult}
                          </a>
                        )}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          index={Math.min(lightboxIndex, lightboxImages.length - 1)}
          setIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          t={t}
        />
      )}
    </main>
  );
}

export function App() {
  const [route, navigate] = usePathRoute();
  const [locale, setLocale] = useState(getInitialLocale);
  const [theme, setTheme] = useState(getInitialTheme);
  const t = messages[locale];
  const selectedTool = toolBase[route] ? { ...toolBase[route], ...t.tools[route] } : null;

  useEffect(() => {
    localStorage.setItem("imageops-locale", locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    localStorage.setItem("imageops-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell">
      <Header
        route={route}
        navigate={navigate}
        locale={locale}
        setLocale={setLocale}
        theme={theme}
        setTheme={setTheme}
        t={t}
      />
      {selectedTool?.id === routes.watermark ? (
        <WatermarkPage tool={selectedTool} navigate={navigate} t={t} />
      ) : selectedTool ? (
        <ToolPage tool={selectedTool} navigate={navigate} t={t} />
      ) : (
        <Home navigate={navigate} t={t} />
      )}
    </div>
  );
}
