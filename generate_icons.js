import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple icon generator using canvas-like approach
function createIconSVG(size) {
    const isLarge = size >= 120;
    
    if (isLarge) {
        // Temple gate for larger icons
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2E7D32;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1B5E20;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <g stroke="#FFD700" stroke-width="${size * 0.02}" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Main arch -->
    <path d="M ${size * 0.2} ${size * 0.65} A ${size * 0.18} ${size * 0.18} 0 0 1 ${size * 0.8} ${size * 0.65}"/>
    <!-- Left pillar -->
    <line x1="${size * 0.26}" y1="${size * 0.4}" x2="${size * 0.26}" y2="${size * 0.7}"/>
    <!-- Right pillar -->
    <line x1="${size * 0.74}" y1="${size * 0.4}" x2="${size * 0.74}" y2="${size * 0.7}"/>
    <!-- Top roof -->
    <path d="M ${size * 0.35} ${size * 0.4} L ${size * 0.5} ${size * 0.3} L ${size * 0.65} ${size * 0.4}"/>
  </g>
</svg>`;
    } else {
        // PB text for smaller icons
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2E7D32;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1B5E20;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <text x="${size / 2}" y="${size / 2}" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#FFD700">PB</text>
</svg>`;
    }
}

// Icon sizes required by Apple
const iconSizes = [
    { size: 1024, name: "AppIcon-1024.png" },
    { size: 180, name: "AppIcon-180.png" },
    { size: 167, name: "AppIcon-167.png" },
    { size: 152, name: "AppIcon-152.png" },
    { size: 120, name: "AppIcon-120.png" },
    { size: 87, name: "AppIcon-87.png" },
    { size: 80, name: "AppIcon-80.png" },
    { size: 76, name: "AppIcon-76.png" },
    { size: 60, name: "AppIcon-60.png" },
    { size: 58, name: "AppIcon-58.png" },
    { size: 40, name: "AppIcon-40.png" },
    { size: 29, name: "AppIcon-29.png" }
];

// Create icons directory
const iconsDir = path.join(__dirname, 'generated_icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Generate all icons
iconSizes.forEach(icon => {
    const svg = createIconSVG(icon.size);
    const svgPath = path.join(iconsDir, icon.name.replace('.png', '.svg'));
    fs.writeFileSync(svgPath, svg);
    console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
});

console.log(`\n✅ All ${iconSizes.length} icons generated in ${iconsDir}/`);
console.log('📝 Note: These are SVG files. You may need to convert them to PNG for iOS.');
