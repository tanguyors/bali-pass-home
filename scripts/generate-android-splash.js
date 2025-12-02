import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_ICON = path.join(__dirname, '../vrai_logo/AppIcon-1024.png');
const ANDROID_RES_DIR = path.join(__dirname, '../android/app/src/main/res');

// Standard splash screen sizes
const SPLASH_CONFIGS = [
    // Landscape
    { name: 'drawable-land-mdpi', width: 480, height: 320 },
    { name: 'drawable-land-hdpi', width: 800, height: 480 },
    { name: 'drawable-land-xhdpi', width: 1280, height: 720 },
    { name: 'drawable-land-xxhdpi', width: 1600, height: 960 },
    { name: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
    // Portrait
    { name: 'drawable-port-mdpi', width: 320, height: 480 },
    { name: 'drawable-port-hdpi', width: 480, height: 800 },
    { name: 'drawable-port-xhdpi', width: 720, height: 1280 },
    { name: 'drawable-port-xxhdpi', width: 960, height: 1600 },
    { name: 'drawable-port-xxxhdpi', width: 1280, height: 1920 }
];

async function generateSplashScreens() {
    if (!fs.existsSync(SOURCE_ICON)) {
        console.error(`❌ Source icon not found at: ${SOURCE_ICON}`);
        process.exit(1);
    }

    console.log(`🚀 Generating Android splash screens from: ${SOURCE_ICON}`);

    for (const config of SPLASH_CONFIGS) {
        const outputDir = path.join(ANDROID_RES_DIR, config.name);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Calculate logo size (e.g., 40% of the smaller dimension)
        const logoSize = Math.floor(Math.min(config.width, config.height) * 0.4);

        // Resize logo
        const logo = await sharp(SOURCE_ICON)
            .resize(logoSize, logoSize)
            .toBuffer();

        // Create white background and composite logo
        await sharp({
            create: {
                width: config.width,
                height: config.height,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
        .composite([{ input: logo, gravity: 'center' }])
        .toFile(path.join(outputDir, 'splash.png'));

        console.log(`✅ Generated ${config.name}/splash.png (${config.width}x${config.height})`);
    }

    console.log('\n✨ All Android splash screens generated successfully!');
}

generateSplashScreens().catch(err => {
    console.error('❌ Error generating splash screens:', err);
    process.exit(1);
});
