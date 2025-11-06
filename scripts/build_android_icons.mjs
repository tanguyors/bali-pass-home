import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const masterIconPath = path.join(projectRoot, 'generated_icons', 'master.png');

if (!fs.existsSync(masterIconPath)) {
  console.error('master.png introuvable dans generated_icons/.');
  process.exit(1);
}

// Tailles foreground pour Adaptive Icon
const densities = [
  { dir: 'mipmap-mdpi', size: 108 },
  { dir: 'mipmap-hdpi', size: 162 },
  { dir: 'mipmap-xhdpi', size: 216 },
  { dir: 'mipmap-xxhdpi', size: 324 },
  { dir: 'mipmap-xxxhdpi', size: 432 },
];

// Tailles classiques (bitmap) pour ic_launcher(.png) utilisées par certains devices/outils
const classic = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

const resDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

async function run() {
  console.log('🔧 Génération des foregrounds Adaptive Icon depuis master.png ...');
  for (const d of densities) {
    const outPath = path.join(resDir, d.dir, 'ic_launcher_foreground.png');
    await sharp(masterIconPath)
      .resize(d.size, d.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`✅ ${d.dir}/ic_launcher_foreground.png (${d.size}x${d.size})`);
  }

  // S'assurer que le background est blanc (couleur déjà référencée par ic_launcher.xml)
  const valuesBg = path.join(resDir, 'values', 'ic_launcher_background.xml');
  if (!fs.existsSync(valuesBg)) {
    fs.mkdirSync(path.dirname(valuesBg), { recursive: true });
    fs.writeFileSync(valuesBg, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>\n`);
  }

  console.log('\n🎯 Foregrounds mis à jour. Build Android recommandé.');

  // Générer également ic_launcher.png et ic_launcher_round.png (classique)
  console.log('\n🔧 Génération des icônes bitmap (ic_launcher*.png) ...');
  for (const d of classic) {
    const baseOut = path.join(resDir, d.dir, 'ic_launcher.png');
    const roundOut = path.join(resDir, d.dir, 'ic_launcher_round.png');
    await sharp(masterIconPath)
      .resize(d.size, d.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(baseOut);
    await sharp(masterIconPath)
      .resize(d.size, d.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(roundOut);
    console.log(`✅ ${d.dir}/ic_launcher(.png|_round.png) (${d.size}x${d.size})`);
  }
  console.log('\n🎯 Icônes bitmap mises à jour.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


