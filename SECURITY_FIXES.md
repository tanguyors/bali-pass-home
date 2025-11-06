# 🔒 Corrections de Sécurité - BaliPass

## Problèmes Corrigés

### 1. **Clés de Signature Exposées** ✅
- **Problème** : Mots de passe et chemins des clés exposés dans `capacitor.config.ts`
- **Solution** : Déplacé vers `android/gradle.properties.example`
- **Action** : Copier `gradle.properties.example` vers `gradle.properties` et remplir vos vraies valeurs

### 2. **Permissions Sécurisées** ✅
- **Problème** : Permissions sans justification claire
- **Solution** : Ajout de descriptions détaillées en français et anglais
- **Permissions conservées** :
  - `CAMERA` : Pour scanner les QR codes
  - `ACCESS_FINE_LOCATION` : Pour la géolocalisation précise
  - `ACCESS_COARSE_LOCATION` : Pour la géolocalisation approximative

### 3. **Noms d'App Harmonisés** ✅
- **Problème** : Noms différents entre Android et iOS
- **Solution** : Nom uniforme "BaliPass" sur toutes les plateformes

### 4. **Permissions iOS Nettoyées** ✅
- **Problème** : Permission microphone inutile
- **Solution** : Supprimée, gardé seulement les permissions nécessaires

## Instructions pour le Déploiement

1. **Copier le fichier de configuration** :
   ```bash
   cp android/gradle.properties.example android/gradle.properties
   ```

2. **Remplir vos vraies valeurs dans `android/gradle.properties`**

3. **Rebuilder l'app** :
   ```bash
   npm run build
   npx cap sync
   ```

4. **Tester les permissions** avant de soumettre à Google Play

## Conformité Google Play

- ✅ Clés de signature sécurisées
- ✅ Permissions justifiées avec descriptions claires
- ✅ Noms d'app cohérents
- ✅ Pas de permissions inutiles
- ✅ Descriptions en français et anglais

