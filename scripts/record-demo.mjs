import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import gifenc from "gifenc";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const { GIFEncoder, quantize, applyPalette } = gifenc;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "docs/demo.gif");
const fps = 15;
const frameDelayMs = Math.round(1000 / fps);
const targetWidth = 360;
const maxFrames = fps * 25;
const minDurationSeconds = 20;
const maxDurationSeconds = 25;

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function startServer() {
  const child = spawn(
    "npm",
    ["run", "dev", "-w", "tg-mini-app-uikit-demo", "--", "--host", "127.0.0.1", "--port", "5173", "--strictPort"],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );

  let outputText = "";
  const urlPromise = new Promise((resolveUrl, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out waiting for Vite dev server")), 15000);
    const onData = (chunk) => {
      outputText += chunk.toString();
      const match = outputText.match(/http:\/\/127\.0\.0\.1:\d+\//);
      if (match) {
        clearTimeout(timeout);
        resolveUrl(match[0]);
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Vite dev server exited with code ${code}\n${outputText}`));
    });
  });

  const url = await urlPromise;
  return {
    url,
    stop: () => {
      child.kill("SIGTERM");
    },
  };
}

async function frameClip(page) {
  const box = await page.locator("[data-demo-frame]").boundingBox();
  if (!box) throw new Error("Could not find [data-demo-frame]");
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}

async function capture(page, frames) {
  if (frames.length >= maxFrames) return;
  const png = await page.screenshot({ clip: await frameClip(page) });
  const decoded = PNG.sync.read(png);
  frames.push(decoded);
}

async function captureFor(page, frames, ms) {
  const frameCount = Math.max(1, Math.round(ms / frameDelayMs));
  for (let i = 0; i < frameCount && frames.length < maxFrames; i += 1) {
    const started = Date.now();
    await capture(page, frames);
    await wait(Math.max(0, frameDelayMs - (Date.now() - started)));
  }
}

async function click(page, selector) {
  await page.locator(selector).click();
}

async function clickRole(page, role, name) {
  await page.getByRole(role, { name }).click();
}

async function runScenario(page, frames) {
  await captureFor(page, frames, 1000);

  await click(page, '[data-demo-product="mug"]');
  await captureFor(page, frames, 1000);
  await page.locator("[data-demo-product-sheet]").getByRole("button", { name: /Add / }).click();
  await captureFor(page, frames, 700);

  await click(page, "[data-demo-shop-tabbar] button:nth-child(3)");
  await captureFor(page, frames, 600);
  await page.locator('[data-demo-decline-toggle] [role="switch"]').click();
  await captureFor(page, frames, 500);
  await page.locator("[data-demo-pay-button] button").click();
  await captureFor(page, frames, 1700);
  await clickRole(page, "button", "Try again");
  await captureFor(page, frames, 500);
  await page.locator("[data-demo-pay-button] button").click();
  await captureFor(page, frames, 1900);
  await clickRole(page, "button", "Done");
  await captureFor(page, frames, 500);

  await click(page, '[data-demo-tab="stars"]');
  await captureFor(page, frames, 700);
  await page.locator('[data-testid="stars-pay"]').click();
  await captureFor(page, frames, 1500);

  await click(page, '[data-demo-tab="support"]');
  await captureFor(page, frames, 700);
  await page.getByRole("button", { name: "Refund" }).click();
  await captureFor(page, frames, 800);

  await click(page, '[data-demo-tab="feed"]');
  await captureFor(page, frames, 700);
  await page.getByRole("button", { name: /show hidden content/i }).click();
  await page.getByRole("button", { name: "Like" }).first().click();
  await captureFor(page, frames, 800);

  await click(page, '[data-demo-tab="platform"]');
  await captureFor(page, frames, 800);
  const grabber = await page.locator("[data-demo-platform-grabber]").boundingBox();
  if (grabber) {
    const x = grabber.x + grabber.width / 2;
    const y = grabber.y + grabber.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y - 210, { steps: 18 });
    await captureFor(page, frames, 700);
    await page.mouse.up();
  }
  await captureFor(page, frames, 500);
  await clickRole(page, "button", "Dark");
  await captureFor(page, frames, 600);
  await clickRole(page, "button", "Fullscreen");
  await captureFor(page, frames, 600);
  await clickRole(page, "button", "QR scan");
  await captureFor(page, frames, 800);

  await click(page, '[data-demo-tab="gallery"]');
  await captureFor(page, frames, 800);
  await page.locator("[data-demo-gallery-scroll]").evaluate((el) => el.scrollTo({ top: 900, behavior: "smooth" }));
  await captureFor(page, frames, 1200);
  await page.locator("[data-demo-gallery-scroll]").evaluate((el) => el.scrollTo({ top: 1550, behavior: "smooth" }));
  await captureFor(page, frames, 1200);
  await page.locator("[data-demo-gallery-scroll]").evaluate((el) => el.scrollTo({ top: 2250, behavior: "smooth" }));
  await captureFor(page, frames, 900);
}

function resizeNearest(frame, width) {
  if (frame.width === width) return frame;
  const height = Math.round((frame.height * width) / frame.width);
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const srcY = Math.min(frame.height - 1, Math.floor((y * frame.height) / height));
    for (let x = 0; x < width; x += 1) {
      const srcX = Math.min(frame.width - 1, Math.floor((x * frame.width) / width));
      const src = (srcY * frame.width + srcX) * 4;
      const dst = (y * width + x) * 4;
      data[dst] = frame.data[src];
      data[dst + 1] = frame.data[src + 1];
      data[dst + 2] = frame.data[src + 2];
      data[dst + 3] = frame.data[src + 3];
    }
  }
  return { width, height, data };
}

function isBlankFrame(rgba) {
  let min = 255;
  let max = 0;
  for (let i = 0; i < rgba.length; i += 400) {
    const luma = (rgba[i] + rgba[i + 1] + rgba[i + 2]) / 3;
    min = Math.min(min, luma);
    max = Math.max(max, luma);
  }
  return max - min < 4;
}

function encodeGif(frames) {
  const durationSeconds = frames.length / fps;
  if (durationSeconds < minDurationSeconds || durationSeconds > maxDurationSeconds) {
    throw new Error(`Expected ${minDurationSeconds}-${maxDurationSeconds}s loop, captured ${durationSeconds.toFixed(1)}s`);
  }
  if (frames.length < durationSeconds * 12) {
    throw new Error(`Expected at least duration*12 frames, captured ${frames.length} for ${durationSeconds.toFixed(1)}s`);
  }
  const resizedFrames = frames.map((frame) => resizeNearest(frame, targetWidth));
  const { width, height } = resizedFrames[0];
  const gif = GIFEncoder();
  let movingPairs = 0;
  let lastSample = null;
  let blankFrames = 0;

  for (const frame of resizedFrames) {
    if (frame.width !== width || frame.height !== height) {
      throw new Error("Captured frames have inconsistent dimensions");
    }
    const rgba = frame.data;
    if (isBlankFrame(rgba)) blankFrames += 1;
    if (lastSample) {
      let delta = 0;
      for (let i = 0; i < rgba.length; i += 400) delta += Math.abs(rgba[i] - lastSample[i]);
      if (delta > 120) movingPairs += 1;
    }
    lastSample = rgba;
    const palette = quantize(rgba, 256, { format: "rgba4444" });
    const index = applyPalette(rgba, palette, "rgba4444");
    gif.writeFrame(index, width, height, { palette, delay: frameDelayMs });
  }

  if (blankFrames) {
    throw new Error(`Captured GIF has ${blankFrames} blank frames`);
  }
  if (movingPairs < resizedFrames.length * 0.35) {
    throw new Error(`Captured GIF looks too static: ${movingPairs}/${resizedFrames.length} moving frame pairs`);
  }
  gif.finish();
  return Buffer.from(gif.bytes());
}

async function main() {
  await mkdir(dirname(output), { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  const frames = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 1120 }, deviceScaleFactor: 1 });
    await page.goto(server.url, { waitUntil: "load" });
    await page.locator("[data-demo-frame]").waitFor({ state: "visible" });
    await runScenario(page, frames);
    const gif = encodeGif(frames);
    await writeFile(output, gif);
    console.log(`Recorded ${frames.length} frames to ${output}`);
  } finally {
    await browser.close();
    server.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
