import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9337;
const baseUrl = "http://127.0.0.1:5173/";
const artifactsDir = path.join(root, "qa-artifacts");
const profileDir = path.join(root, ".qa-chrome-profile");
const routePaths = {
  compress: "compress",
  convert: "convert",
  enhance: "enhance",
  watermark: "watermark",
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 60) {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(150);
  }
  throw lastError;
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const request = this.pending.get(message.id);
      if (!request) return;
      this.pending.delete(message.id);
      if (message.error) {
        request.reject(new Error(message.error.message));
      } else {
        request.resolve(message.result);
      }
    });

    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
    }
    return result.result.value;
  }

  async screenshot(filePath) {
    const result = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      fromSurface: true,
    });
    await writeFile(filePath, Buffer.from(result.data, "base64"));
  }

  close() {
    this.ws?.close();
  }
}

async function createPage(chrome) {
  const pages = await fetchJson(`http://127.0.0.1:${port}/json`);
  const page = pages.find((item) => item.type === "page") || pages[0];
  const client = new CdpClient(page.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false,
  });
  return client;
}

async function navigate(client, url) {
  await client.send("Page.navigate", { url });
  await wait(800);
  await client.evaluate(`
    (async () => {
      await Promise.all(Array.from(document.images).map((image) => {
        if (image.complete) return true;
        return new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        });
      }));
      const broken = Array.from(document.images)
        .filter((image) => image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src);
      if (broken.length) throw new Error('broken images: ' + broken.join(', '));
    })()
  `);
}

async function runTool(client, route) {
  await navigate(client, `${baseUrl}${routePaths[route]}`);
  return client.evaluate(`
    (async () => {
      const response = await fetch('/sample-mountain.png');
      const blob = await response.blob();
      const file = new File([blob], 'sample-mountain.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]');
      if (!input) throw new Error('file input missing');
      const data = new DataTransfer();
      data.items.add(file);
      input.files = data.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 180));
      const button = document.querySelector('.process-actions .primary');
      if (!button) throw new Error('process button missing');
      button.click();
      for (let i = 0; i < 80; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const link = document.querySelector('.download-action:not(.disabled)');
        const resultImage = document.querySelector('.compare-live figure:nth-child(2) img');
        if (link && resultImage) {
          resultImage.closest('button')?.click();
          await new Promise((resolve) => setTimeout(resolve, 120));
          const opened = !!document.querySelector('.image-lightbox img');
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 80));
          const closed = !document.querySelector('.image-lightbox');
          if (!opened || !closed) throw new Error('lightbox failed for ${route}');
          return {
            route: '${route}',
            title: document.querySelector('.tool-hero h1')?.textContent || '',
            downloadName: link.getAttribute('download') || '',
            stats: Array.from(document.querySelectorAll('.result-stats strong')).map((node) => node.textContent),
            imageCount: document.querySelectorAll('.compare-live img').length
          };
        }
      }
      throw new Error('processing timed out for ${route}');
    })()
  `);
}

async function runWatermarkTool(client) {
  await navigate(client, `${baseUrl}${routePaths.watermark}`);
  return client.evaluate(`
    (async () => {
      const response = await fetch('/sample-mountain.png');
      const blob = await response.blob();
      const targetOne = new File([blob], 'sample-mountain-one.png', { type: 'image/png' });
      const targetTwo = new File([blob], 'sample-mountain-two.png', { type: 'image/png' });

      const canvas = document.createElement('canvas');
      canvas.width = 360;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(12, 99, 246, 0.92)';
      ctx.roundRect(0, 0, canvas.width, canvas.height, 24);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 48px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ImageOps', canvas.width / 2, canvas.height / 2);
      const watermarkBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const watermark = new File([watermarkBlob], 'imageops-watermark.png', { type: 'image/png' });

      const targetInput = document.querySelector('input[data-upload="targets"]');
      const watermarkInput = document.querySelector('input[data-upload="watermark"]');
      if (!targetInput || !watermarkInput) throw new Error('watermark inputs missing');

      const targetData = new DataTransfer();
      targetData.items.add(targetOne);
      targetData.items.add(targetTwo);
      targetInput.files = targetData.files;
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));

      const watermarkData = new DataTransfer();
      watermarkData.items.add(watermark);
      watermarkInput.files = watermarkData.files;
      watermarkInput.dispatchEvent(new Event('change', { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 180));
      const button = document.querySelector('.process-actions .primary');
      if (!button) throw new Error('watermark process button missing');
      button.click();

      for (let i = 0; i < 100; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const links = Array.from(document.querySelectorAll('.batch-card .mini-download'));
        const downloadAll = document.querySelector('.download-all-action:not(:disabled)');
        if (links.length === 2 && downloadAll) {
          const firstPreview = document.querySelector('.batch-card .preview-trigger');
          firstPreview?.click();
          await new Promise((resolve) => setTimeout(resolve, 120));
          const before = document.querySelector('.lightbox-figure figcaption span')?.textContent || '';
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 120));
          const after = document.querySelector('.lightbox-figure figcaption span')?.textContent || '';
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 80));
          if (before !== '1 / 2' || after !== '2 / 2' || document.querySelector('.image-lightbox')) {
            throw new Error('watermark lightbox navigation failed');
          }
          return {
            route: 'watermark',
            title: document.querySelector('.tool-hero h1')?.textContent || '',
            downloadNames: links.map((link) => link.getAttribute('download') || ''),
            stats: Array.from(document.querySelectorAll('.result-stats strong')).map((node) => node.textContent),
            resultCount: links.length
          };
        }
      }
      throw new Error('watermark processing timed out');
    })()
  `);
}

async function setPreferences(client, locale = "zh", theme = "light") {
  await client.evaluate(`
    localStorage.setItem('imageops-locale', '${locale}');
    localStorage.setItem('imageops-theme', '${theme}');
  `);
  await navigate(client, baseUrl);
}

async function verifyLanguageAndTheme(client) {
  await setPreferences(client, "zh", "light");
  const result = await client.evaluate(`
    (async () => {
      const languageButton = Array.from(document.querySelectorAll('.header-toggle')).find((button) => button.textContent.includes('EN'));
      if (!languageButton) throw new Error('language toggle missing');
      languageButton.click();
      await new Promise((resolve) => setTimeout(resolve, 150));
      const brandAfterLanguage = document.querySelector('.brand span:last-child')?.textContent || '';

      const themeButton = document.querySelector('.header-toggle.icon-only');
      if (!themeButton) throw new Error('theme toggle missing');
      themeButton.click();
      await new Promise((resolve) => setTimeout(resolve, 150));

      return {
        brandAfterLanguage,
        theme: document.documentElement.dataset.theme,
        heroText: document.querySelector('.hero-copy p')?.textContent || ''
      };
    })()
  `);
  if (result.brandAfterLanguage !== "ImageOps") {
    throw new Error(`language toggle failed: ${result.brandAfterLanguage}`);
  }
  if (result.theme !== "dark") {
    throw new Error(`theme toggle failed: ${result.theme}`);
  }
  await client.screenshot(path.join(artifactsDir, "home-en-dark.png"));
  await setPreferences(client, "zh", "light");
  return result;
}

async function captureComparison(client, implementationPath) {
  const sourcePath = "/Users/mccree/.codex/generated_images/019ea6ca-07ee-76d2-b2fb-504549e7bf79/ig_078efb208009059d016a269d8de1f8819bbd6c984c313e1a39.png";
  if (!existsSync(sourcePath)) return;
  const htmlPath = path.join(artifactsDir, "comparison-home.html");
  const html = `<!doctype html>
<meta charset="utf-8" />
<style>
  body { margin: 0; background: #f5f6f8; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 2880px; padding: 16px; }
  figure { margin: 0; background: white; border: 1px solid #d8dde7; }
  figcaption { padding: 12px 16px; font-size: 22px; font-weight: 700; color: #111827; }
  img { width: 100%; display: block; }
</style>
<div class="wrap">
  <figure><figcaption>参考图一</figcaption><img src="file://${sourcePath}" /></figure>
  <figure><figcaption>当前实现</figcaption><img src="file://${implementationPath}" /></figure>
</div>`;
  await writeFile(htmlPath, html);
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 2880,
    height: 1120,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await navigate(client, `file://${htmlPath}`);
  await client.screenshot(path.join(artifactsDir, "comparison-home.png"));
}

async function main() {
  await mkdir(artifactsDir, { recursive: true });
  await rm(profileDir, { recursive: true, force: true });

  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ], { stdio: "ignore" });

  let client;
  try {
    client = await createPage(chrome);
    await navigate(client, baseUrl);
    const uiState = await verifyLanguageAndTheme(client);
    await client.screenshot(path.join(artifactsDir, "home.png"));
    const results = [];
    for (const route of ["compress", "convert", "enhance"]) {
      results.push(await runTool(client, route));
      await client.screenshot(path.join(artifactsDir, `${route}.png`));
    }
    results.push(await runWatermarkTool(client));
    await client.screenshot(path.join(artifactsDir, "watermark.png"));
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await navigate(client, baseUrl);
    await client.screenshot(path.join(artifactsDir, "mobile-home.png"));
    await captureComparison(client, path.join(artifactsDir, "home.png"));
    await writeFile(path.join(artifactsDir, "functional-results.json"), JSON.stringify({ uiState, results }, null, 2));
    console.log(JSON.stringify({ ok: true, uiState, results, artifactsDir }, null, 2));
  } finally {
    client?.close();
    chrome.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
