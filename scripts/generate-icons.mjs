// Generates PWA icons from public/favicon.jpg. Run with `npm run icons`.
//
// The source art is black line work on white, so every icon gets a light
// background rather than transparency: iOS ignores alpha on home screen icons
// and would composite the art onto black, hiding it.
import sharp from 'sharp';

const SOURCE = 'public/favicon.jpg';
// Pure white, matching the source JPEG's own background. Anything else leaves a
// visible seam where the trimmed artwork meets the canvas.
const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };

// Maskable icons are cropped to a platform-defined shape, and only the middle
// 80% is guaranteed to survive. The art is wide, so it needs to sit well inside
// that to avoid losing its edges to a circular mask.
const ICONS = [
  { file: 'public/icon-192.png', size: 192, scale: 0.84 },
  { file: 'public/icon-512.png', size: 512, scale: 0.84 },
  { file: 'public/icon-maskable-512.png', size: 512, scale: 0.6 },
  { file: 'public/apple-touch-icon.png', size: 180, scale: 0.8 },
];

const trimmed = await sharp(SOURCE).trim({ threshold: 20 }).toBuffer();

for (const { file, size, scale } of ICONS) {
  const inner = Math.round(size * scale);
  const art = await sharp(trimmed)
    .resize(inner, inner, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toFile(file);

  console.log(`${file} (${size}x${size})`);
}
