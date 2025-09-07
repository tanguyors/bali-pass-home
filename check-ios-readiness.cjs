#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la préparation iOS pour Bali\'Pass\n');

const checks = [
  {
    name: 'Repository Git',
    check: () => fs.existsSync('.git'),
    message: '✅ Repository Git initialisé'
  },
  {
    name: 'Dossier iOS',
    check: () => fs.existsSync('ios'),
    message: '✅ Dossier iOS créé'
  },
  {
    name: 'Configuration Capacitor',
    check: () => fs.existsSync('capacitor.config.ts'),
    message: '✅ Configuration Capacitor présente'
  },
  {
    name: 'Package.json avec dépendances iOS',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.dependencies['@capacitor/ios'] && pkg.dependencies['@capacitor/camera'];
    },
    message: '✅ Dépendances iOS installées'
  },
  {
    name: 'Info.plist avec permissions',
    check: () => {
      const infoPlist = fs.readFileSync('ios/App/App/Info.plist', 'utf8');
      return infoPlist.includes('NSCameraUsageDescription') && 
             infoPlist.includes('NSLocationWhenInUseUsageDescription');
    },
    message: '✅ Permissions iOS configurées'
  },
  {
    name: 'Dossier dist (build web)',
    check: () => fs.existsSync('dist'),
    message: '✅ Build web disponible'
  },
  {
    name: 'Instructions de déploiement',
    check: () => fs.existsSync('INSTRUCTIONS_IOS_DEPLOYMENT.md'),
    message: '✅ Instructions créées'
  },
  {
    name: 'Configuration détaillée',
    check: () => fs.existsSync('CONFIGURATION_IOS.md'),
    message: '✅ Configuration documentée'
  }
];

let allPassed = true;

checks.forEach(check => {
  try {
    if (check.check()) {
      console.log(check.message);
    } else {
      console.log(`❌ ${check.name} - ÉCHEC`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${check.name} - ERREUR: ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 TOUT EST PRÊT POUR LE DÉPLOIEMENT iOS !');
  console.log('\n📋 Prochaines étapes pour votre ami :');
  console.log('1. Cloner le repository: git clone [URL]');
  console.log('2. Installer les dépendances: npm install');
  console.log('3. Construire: npm run build');
  console.log('4. Synchroniser: npx cap sync ios');
  console.log('5. Ouvrir dans Xcode: npx cap open ios');
  console.log('\n📖 Voir INSTRUCTIONS_IOS_DEPLOYMENT.md pour plus de détails');
} else {
  console.log('⚠️  Certains éléments nécessitent une attention');
  console.log('Veuillez corriger les erreurs avant de continuer');
}

console.log('\n🔗 Repository: https://github.com/tanguyors/bali-pass-home');
console.log('📱 Bundle ID: com.balipass.app');
console.log('🏷️  Nom: Bali\'Pass - Digital Pass for Bali');
