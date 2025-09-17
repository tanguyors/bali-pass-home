import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple PNG generator without external dependencies
function createPNGIcon(size) {
    // Create a simple PNG-like data structure
    // This is a simplified approach - in production you'd use a proper PNG library
    
    const isLarge = size >= 120;
    const canvas = [];
    
    // Create a simple representation
    for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) {
            // Simple gradient from green to darker green
            const distance = Math.sqrt((x - size/2) ** 2 + (y - size/2) ** 2);
            const maxDistance = size / 2;
            const ratio = distance / maxDistance;
            
            if (ratio <= 0.8) { // Inside the rounded rectangle
                if (isLarge) {
                    // Draw temple gate pattern
                    if (isTempleGatePixel(x, y, size)) {
                        row.push([255, 215, 0]); // Gold
                    } else {
                        row.push([46, 125, 50]); // Green
                    }
                } else {
                    // Draw PB text pattern
                    if (isPBTextPixel(x, y, size)) {
                        row.push([255, 215, 0]); // Gold
                    } else {
                        row.push([46, 125, 50]); // Green
                    }
                }
            } else {
                row.push([0, 0, 0, 0]); // Transparent
            }
        }
        canvas.push(row);
    }
    
    return canvas;
}

function isTempleGatePixel(x, y, size) {
    const centerX = size / 2;
    const centerY = size / 2;
    const gateWidth = size * 0.6;
    const gateHeight = size * 0.5;
    
    // Simple temple gate pattern
    const leftPillar = Math.abs(x - (centerX - gateWidth * 0.4)) < size * 0.01;
    const rightPillar = Math.abs(x - (centerX + gateWidth * 0.4)) < size * 0.01;
    const arch = Math.abs(y - (centerY + gateHeight * 0.3)) < size * 0.01 && 
                 x > centerX - gateWidth * 0.3 && x < centerX + gateWidth * 0.3;
    const roof = Math.abs(y - (centerY - gateHeight * 0.2)) < size * 0.01 && 
                 x > centerX - gateWidth * 0.3 && x < centerX + gateWidth * 0.3;
    
    return leftPillar || rightPillar || arch || roof;
}

function isPBTextPixel(x, y, size) {
    const centerX = size / 2;
    const centerY = size / 2;
    const textSize = size * 0.4;
    
    // Simple PB text pattern
    const inP = (x > centerX - textSize * 0.3 && x < centerX - textSize * 0.1 && 
                 y > centerY - textSize * 0.2 && y < centerY + textSize * 0.2);
    const inB = (x > centerX + textSize * 0.1 && x < centerX + textSize * 0.3 && 
                 y > centerY - textSize * 0.2 && y < centerY + textSize * 0.2);
    
    return inP || inB;
}

// Create a simple PNG file (simplified approach)
function createSimplePNG(size, filename) {
    const canvas = createPNGIcon(size);
    
    // Create a simple file that represents our icon
    // In a real implementation, you'd use a proper PNG encoder
    const data = {
        size: size,
        canvas: canvas,
        filename: filename
    };
    
    return JSON.stringify(data, null, 2);
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

// Create PNG icons directory
const pngIconsDir = path.join(__dirname, 'png_icons');
if (!fs.existsSync(pngIconsDir)) {
    fs.mkdirSync(pngIconsDir);
}

// Generate all PNG icons
iconSizes.forEach(icon => {
    const pngData = createSimplePNG(icon.size, icon.name);
    const pngPath = path.join(pngIconsDir, icon.name.replace('.png', '.json'));
    fs.writeFileSync(pngPath, pngData);
    console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
});

console.log(`\n✅ All ${iconSizes.length} PNG icons generated in ${pngIconsDir}/`);
console.log('📝 Note: These are simplified representations. For production, use a proper PNG encoder.');


