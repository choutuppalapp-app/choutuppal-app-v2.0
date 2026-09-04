const sharp = require('sharp');
const fs = require('fs');

async function resize() {
  const input = 'public/images/hero-banner.webp';
  const output = 'public/images/hero-banner-resized.webp';
  if (!fs.existsSync(input)) {
    console.log('No hero-banner.webp found');
    return;
  }
  await sharp(input)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(output);
  fs.renameSync(output, input);
  console.log('Done');
}
resize().catch(console.error);
