import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0284c7"/>
  <path d="M128 272h96l32 96 64-224 32 128h96" fill="none" stroke="#ffffff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.25"/>
</svg>
`;

async function generate() {
  await mkdir(iconsDir, { recursive: true });
  const buffer = Buffer.from(svg);

  for (const size of [192, 512]) {
    await sharp(buffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`));
  }

  await writeFile(
    path.join(iconsDir, "icon.svg"),
    svg.trim(),
    "utf8"
  );

  console.log("PWA icons written to public/icons/");
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
