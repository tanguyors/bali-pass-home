# Instructions pour le déploiement iOS - Bali'Pass

## 📋 Prérequis pour votre ami (avec Mac)

### 1. Outils nécessaires
- **Xcode** (dernière version depuis l'App Store)
- **Node.js** (version 18 ou plus récente)
- **Git**
- **Compte développeur Apple** (99€/an)

### 2. Installation des dépendances
```bash
# Cloner le repository
git clone https://github.com/tanguyors/bali-pass-home.git
cd bali-pass-home

# Installer les dépendances
npm install

# Installer CocoaPods (si pas déjà installé)
sudo gem install cocoapods
```

## 🚀 Étapes de déploiement

### 1. Préparation du projet
```bash
# Construire l'application web
npm run build

# Synchroniser avec iOS
npx cap sync ios
```

### 2. Configuration dans Xcode

#### A. Ouvrir le projet
```bash
npx cap open ios
```

#### B. Configuration du projet
1. **Sélectionner le projet** dans le navigateur de gauche
2. **Onglet "Signing & Capabilities"** :
   - Cocher "Automatically manage signing"
   - Sélectionner votre **Team** (compte développeur Apple)
   - Vérifier que le **Bundle Identifier** est : `com.balipass.app`

#### C. Configuration des permissions
Les permissions sont déjà configurées dans `Info.plist` :
- ✅ Caméra (pour scanner QR)
- ✅ Localisation (pour offres à proximité)

### 3. Test sur simulateur
1. **Sélectionner un simulateur** (ex: iPhone 15)
2. **Cliquer sur le bouton Run (▶️)**
3. **Vérifier** que l'app se lance correctement

### 4. Déploiement sur appareil physique

#### A. Configuration de l'appareil
1. **Connecter l'iPhone/iPad** via USB
2. **Activer le mode développeur** sur l'appareil :
   - Réglages > Confidentialité et sécurité > Mode développeur
3. **Faire confiance** au certificat de développement

#### B. Build et installation
1. **Sélectionner l'appareil** dans Xcode
2. **Cliquer sur Run (▶️)**
3. **Attendre** la compilation et l'installation

### 5. Upload vers TestFlight (optionnel)

#### A. Archive du projet
1. **Product > Archive** dans Xcode
2. **Attendre** la fin de l'archivage
3. **Cliquer sur "Distribute App"**

#### B. Distribution
1. **Sélectionner "App Store Connect"**
2. **Upload** vers TestFlight
3. **Configurer** les informations de test dans App Store Connect

## 🔧 Informations importantes

### Bundle Identifier
- **ID** : `com.balipass.app`
- **Nom** : Bali'Pass - Digital Pass for Bali

### Permissions configurées
- **Caméra** : "Cette application utilise la caméra pour scanner les codes QR des offres Bali'Pass."
- **Localisation** : "Cette application utilise votre localisation pour vous montrer les offres à proximité."

### Plugins Capacitor utilisés
- `@capacitor/camera` (v7.0.2)
- `@capacitor/core` (v7.4.3)

## 🐛 Dépannage

### Erreur de signature
- Vérifier que le compte développeur Apple est configuré
- S'assurer que l'appareil est ajouté au provisioning profile

### Erreur de build
```bash
# Nettoyer et reconstruire
cd ios
pod install
cd ..
npx cap sync ios
```

### Erreur de permissions
- Vérifier que les permissions sont bien dans `Info.plist`
- Redémarrer l'app après modification des permissions

## 📞 Support

En cas de problème, contacter :
- **Développeur** : [Votre nom/email]
- **Repository** : https://github.com/tanguyors/bali-pass-home

## ✅ Checklist finale

- [ ] Xcode installé et à jour
- [ ] Compte développeur Apple actif
- [ ] Projet cloné et dépendances installées
- [ ] Build web réussi (`npm run build`)
- [ ] Synchronisation iOS réussie (`npx cap sync ios`)
- [ ] Projet ouvert dans Xcode (`npx cap open ios`)
- [ ] Signature configurée dans Xcode
- [ ] Test sur simulateur réussi
- [ ] Test sur appareil physique réussi
- [ ] Upload TestFlight (si nécessaire)

---

**Note** : Cette application utilise Supabase comme backend. Assurez-vous que les clés API sont correctement configurées dans le fichier de configuration.
