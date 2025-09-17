import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to iOS app icons
const appIconPath = path.join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

// Create the proper Contents.json for iOS
function createContentsJson() {
    return {
        "images": [
            {
                "filename": "AppIcon-29.png",
                "idiom": "iphone",
                "scale": "2x",
                "size": "29x29"
            },
            {
                "filename": "AppIcon-29.png",
                "idiom": "iphone",
                "scale": "3x",
                "size": "29x29"
            },
            {
                "filename": "AppIcon-40.png",
                "idiom": "iphone",
                "scale": "2x",
                "size": "40x40"
            },
            {
                "filename": "AppIcon-40.png",
                "idiom": "iphone",
                "scale": "3x",
                "size": "40x40"
            },
            {
                "filename": "AppIcon-60.png",
                "idiom": "iphone",
                "scale": "2x",
                "size": "60x60"
            },
            {
                "filename": "AppIcon-60.png",
                "idiom": "iphone",
                "scale": "3x",
                "size": "60x60"
            },
            {
                "filename": "AppIcon-76.png",
                "idiom": "ipad",
                "scale": "1x",
                "size": "76x76"
            },
            {
                "filename": "AppIcon-76.png",
                "idiom": "ipad",
                "scale": "2x",
                "size": "76x76"
            },
            {
                "filename": "AppIcon-83.5.png",
                "idiom": "ipad",
                "scale": "2x",
                "size": "83.5x83.5"
            },
            {
                "filename": "AppIcon-1024.png",
                "idiom": "ios-marketing",
                "scale": "1x",
                "size": "1024x1024"
            }
        ],
        "info": {
            "author": "xcode",
            "version": 1
        }
    };
}

// Check if app icon directory exists
if (!fs.existsSync(appIconPath)) {
    console.log('❌ App icon directory not found:', appIconPath);
    console.log('📁 Please make sure you have run: npx cap sync ios');
    process.exit(1);
}

// Create the new Contents.json
const contentsJson = createContentsJson();
const contentsPath = path.join(appIconPath, 'Contents.json');

fs.writeFileSync(contentsPath, JSON.stringify(contentsJson, null, 2));
console.log('✅ Created Contents.json for iOS app icons');

// List current files in the directory
console.log('\n📁 Current files in AppIcon.appiconset:');
const currentFiles = fs.readdirSync(appIconPath);
currentFiles.forEach(file => {
    console.log(`  - ${file}`);
});

console.log('\n📋 Next steps:');
console.log('1. Download all icons from create_ios_icons.html');
console.log('2. Place them in:', appIconPath);
console.log('3. Run: npx cap sync ios');
console.log('4. Build and resubmit to Apple');

console.log('\n🎯 Required icon files:');
console.log('  - AppIcon-29.png (58x58 and 87x87)');
console.log('  - AppIcon-40.png (80x80 and 120x120)');
console.log('  - AppIcon-60.png (120x120 and 180x180)');
console.log('  - AppIcon-76.png (76x76 and 152x152)');
console.log('  - AppIcon-83.5.png (167x167)');
console.log('  - AppIcon-1024.png (1024x1024)');


