# Configuration iOS - Bali'Pass

## 📱 Informations de l'application

### Identifiants
- **Bundle Identifier** : `com.balipass.app`
- **Nom de l'app** : Bali'Pass - Digital Pass for Bali
- **Version** : 1.0.0
- **Plateforme** : iOS 13.0+

### Configuration Capacitor
```typescript
// capacitor.config.ts
{
  appId: 'com.balipass.app',
  appName: "Bali'Pass - Digital Pass for Bali",
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1A936F",
      showSpinner: false
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#1A936F"
    }
  }
}
```

## 🔐 Permissions iOS configurées

### Info.plist
```xml
<key>NSCameraUsageDescription</key>
<string>Cette application utilise la caméra pour scanner les codes QR des offres Bali'Pass.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Cette application utilise votre localisation pour vous montrer les offres à proximité.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Cette application utilise votre localisation pour vous montrer les offres à proximité.</string>
```

## 🎨 Assets et icônes

### Icônes d'application
- **Taille** : 1024x1024px (App Store)
- **Format** : PNG
- **Couleur principale** : #1A936F (vert Bali)

### Écran de démarrage
- **Couleur de fond** : #1A936F
- **Durée d'affichage** : 2000ms
- **Spinner** : Désactivé

## 🔧 Plugins Capacitor

### Plugins installés
```json
{
  "@capacitor/camera": "^7.0.2",
  "@capacitor/core": "^7.4.3",
  "@capacitor/ios": "^7.4.3"
}
```

### Fonctionnalités utilisées
- **Scanner QR** : Utilise la caméra pour scanner les codes QR des offres
- **Géolocalisation** : Affiche les offres à proximité
- **Navigation** : Interface de navigation native

## 🌐 Backend et API

### Supabase
- **Base de données** : PostgreSQL via Supabase
- **Authentification** : Gérée par Supabase Auth
- **Stockage** : Images et fichiers via Supabase Storage

### Configuration requise
- Les clés API Supabase sont dans les variables d'environnement
- Configuration dans `src/integrations/supabase/client.ts`

## 📦 Commandes de build

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npx cap sync ios
npx cap open ios
```

### Nettoyage
```bash
# Nettoyer le cache
npm run build
rm -rf ios/App/App/public
npx cap sync ios
```

## 🚀 Déploiement

### TestFlight
1. **Archive** dans Xcode
2. **Upload** vers App Store Connect
3. **Configuration** des groupes de test
4. **Invitation** des testeurs

### App Store
1. **Préparation** des métadonnées
2. **Screenshots** (toutes les tailles d'écran)
3. **Description** multilingue
4. **Soumission** pour review

## 🔍 Tests recommandés

### Fonctionnalités à tester
- [ ] Authentification utilisateur
- [ ] Scanner QR des offres
- [ ] Géolocalisation et offres à proximité
- [ ] Navigation entre les écrans
- [ ] Gestion des favoris
- [ ] Mode hors ligne (si applicable)

### Appareils de test
- **iPhone** : 12, 13, 14, 15 (différentes tailles)
- **iPad** : Air, Pro (si supporté)
- **Versions iOS** : 13.0, 14.0, 15.0, 16.0, 17.0

## 📋 Checklist de validation

### Avant soumission
- [ ] Toutes les permissions fonctionnent
- [ ] Pas d'erreurs dans la console
- [ ] Performance acceptable
- [ ] Interface adaptée à tous les écrans
- [ ] Tests sur appareils physiques
- [ ] Métadonnées complètes
- [ ] Screenshots de qualité

### Après déploiement
- [ ] Monitoring des crashes
- [ ] Feedback des utilisateurs
- [ ] Performance analytics
- [ ] Mises à jour si nécessaire
