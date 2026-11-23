import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { animatedGif } from "./gif.mjs";

const run = promisify(execFile);
const inks = new Map();
async function typeset(root, title, description) {
  const assets = join(root, "art/share");
  const uri = async (name, type) =>
    "data:" +
    type +
    ";base64," +
    (await readFile(join(assets, name))).toString("base64");
  const html = (await readFile(join(root, "scripts/share/ink.html"), "utf8"))
    .replace("FUNNEL_FONT", await uri("funnel-display.woff2", "font/woff2"))
    .replace("SWITZER_FONT", await uri("switzer-400.woff2", "font/woff2"))
    .replace("BRAND_IMAGE", await uri("brand.png", "image/png"));
  const localChrome =
    process.env.PUPPETEER_EXECUTABLE_PATH ??
    (process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : undefined);
  const chromium = localChrome
    ? undefined
    : (await import("@sparticuz/chromium")).default;
  const browser = await puppeteer.launch({
    executablePath: localChrome ?? (await chromium.executablePath()),
    args: chromium?.args,
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(html);
    await page.evaluate(
      async ({ title, description }) => {
        const heading = document.querySelector("h1"),
          sub = document.querySelector("p"),
          main = document.querySelector("main");
        heading.textContent = title;
        sub.textContent = description;
        await Promise.all([
          document.fonts.load("450 72px Funnel"),
          document.fonts.load("400 48px Switzer"),
        ]);
        await document.fonts.ready;
        if (heading.offsetHeight > 152) heading.style.fontSize = "65px";
        // Preserve the full title and subtitle at review size whenever they fit.
        // Long metadata can use the rest of the canvas before reducing type.
        if (main.offsetHeight > 480) main.style.width = "1092px";
        let size = 48;
        while (main.offsetHeight > 480 && size > 22) {
          size -= 2;
          sub.style.fontSize = size + "px";
          heading.style.fontSize = Math.round(size * 1.35) + "px";
        }
        if (main.offsetHeight > 480) {
          // Extremely long descriptions stay available in the page's metadata.
          sub.style.display = "-webkit-box";
          sub.style.setProperty("-webkit-box-orient", "vertical");
          sub.style.overflow = "hidden";
          sub.style.webkitLineClamp = String(
            Math.max(
              1,
              Math.floor((460 - heading.offsetHeight) / (size * 1.16)),
            ),
          );
        }
      },
      { title, description },
    );
    return Buffer.from(
      await page.screenshot({ omitBackground: true, type: "png" }),
    );
  } finally {
    await browser.close();
  }
}

export async function render(root, id, title, description, ext) {
  const assets = join(root, "art/share");
  if (!inks.has(id)) inks.set(id, typeset(root, title, description));
  const ink = await inks.get(id);
  if (ext === "mp4") {
    const dir = await mkdtemp(join(tmpdir(), "opencrawl-card-"));
    try {
      const overlay = join(dir, "ink.png"),
        output = join(dir, "card.mp4");
      await writeFile(overlay, ink);
      await run(ffmpeg.path, [
        "-v",
        "error",
        "-i",
        join(assets, "paper.mkv"),
        "-framerate",
        "30",
        "-i",
        overlay,
        "-filter_complex_threads",
        "1",
        "-filter_complex",
        "[0:v][1:v]overlay=0:0:format=yuv420[v]",
        "-map",
        "[v]",
        "-frames:v",
        "540",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "faster",
        "-threads",
        "3",
        "-qp",
        "10",
        "-x264-params",
        "bframes=0:ipratio=2",
        "-g",
        "540",
        "-keyint_min",
        "540",
        "-sc_threshold",
        "0",
        "-movflags",
        "+faststart",
        output,
      ]);
      return await readFile(output);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
  const poster = sharp(join(assets, "paper.png")).composite([
    { input: ink, top: 0, left: 0 },
  ]);
  if (ext === "webp") return poster.webp({ quality: 95 }).toBuffer();
  if (ext !== "gif") throw new Error("Unknown share card format: " + ext);
  return animatedGif(
    assets,
    await sharp(ink).ensureAlpha().raw().toBuffer(),
    await poster.ensureAlpha().raw().toBuffer(),
  );
}
