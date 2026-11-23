import gifenc from "gifenc";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const width = 1200,
  height = 630,
  frames = 450,
  cell = 3;
let lighting, colors;

export function animatedGif(assets, ink, poster) {
  // Each sample in the approved indexed lighting loop covers a 3x3 block.
  // Frame zero is opaque. Zero in later frames preserves the preceding color.
  lighting ??= gunzipSync(readFileSync(join(assets, "lighting.idx.gz")));
  colors ??= JSON.parse(readFileSync(join(assets, "palette.json"), "utf8"));
  const glyphs = [];
  for (let pixel = 0; pixel < width * height; pixel++) {
    if (ink[pixel * 4 + 3] >= 8) glyphs.push(pixel);
  }
  const glyphColors = new Uint8Array(glyphs.length * 4);
  for (const [i, pixel] of glyphs.entries())
    glyphColors.set(poster.subarray(pixel * 4, pixel * 4 + 4), i * 4);
  const inkPalette = gifenc.quantize(glyphColors, 256 - colors.length);
  const inkIndices = gifenc.applyPalette(glyphColors, inkPalette);
  const palette = [...colors, ...inkPalette];
  const encoder = gifenc.GIFEncoder();
  const pixels = new Uint8Array(width * height);
  let sample = 0;
  for (let frame = 0; frame < frames; frame++) {
    for (let y = 0; y < height; y += cell) {
      const row = y * width;
      for (let x = 0; x < width; x += cell) {
        const i = row + x,
          color = lighting[sample++];
        pixels[i] = pixels[i + 1] = pixels[i + 2] = color;
      }
      pixels.copyWithin(row + width, row, row + width);
      pixels.copyWithin(row + 2 * width, row, row + width);
    }
    for (let i = 0; i < glyphs.length; i++)
      pixels[glyphs[i]] = frame === 0 ? colors.length + inkIndices[i] : 0;
    encoder.writeFrame(pixels, width, height, {
      delay: 40,
      dispose: 1,
      ...(frame === 0
        ? { palette, repeat: 0 }
        : { transparent: true, transparentIndex: 0 }),
    });
  }
  encoder.finish();
  return encoder.bytesView();
}
