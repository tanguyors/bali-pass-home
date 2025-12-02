import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_ICON = path.join(__dirname, '../vrai_logo/AppIcon-1024.png');
const ANDROID_RES_DIR = path.join(__dirname, '../android/app/src/main/res');

const ICON_CONFIGS = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 }
];

async function generateIcons() {
    if (!fs.existsSync(SOURCE_ICON)) {
        console.error(`❌ Source icon not found at: ${SOURCE_ICON}`);
        process.exit(1);
    }

    console.log(`🚀 Generating Android icons from: ${SOURCE_ICON}`);

    for (const config of ICON_CONFIGS) {
        const outputDir = path.join(ANDROID_RES_DIR, config.name);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate square icon (ic_launcher.png)
        await sharp(SOURCE_ICON)
            .resize(config.size, config.size)
            .toFile(path.join(outputDir, 'ic_launcher.png'));

        // Generate foreground for adaptive icon (ic_launcher_foreground.png)
        // We use the same icon as foreground, assuming it has transparency
        await sharp(SOURCE_ICON)
            .resize(config.size, config.size)
            .toFile(path.join(outputDir, 'ic_launcher_foreground.png'));

        // Generate round icon (ic_launcher_round.png)
        // Create a rounded mask
        const roundedMask = Buffer.from(
            `<svg><rect x="0" y="0" width="${config.size}" height="${config.size}" rx="${config.size/2}" ry="${config.size/2}"/></svg>`
        );

        await sharp(SOURCE_ICON)
            .resize(config.size, config.size)
            .composite([{
                input: roundedMask,
                blend: 'dest-in'
            }])
            .toFile(path.join(outputDir, 'ic_launcher_round.png'));

        console.log(`✅ Generated ${config.name} (${config.size}x${config.size})`);
    }

    console.log('\n✨ All Android icons generated successfully!');
}

generateIcons().catch(err => {
    console.error('❌ Error generating icons:', err);
    process.exit(1);
});
