import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
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
  },
  android: {
    signingConfig: {
      keystorePath: 'android/app/balipass-release-key.keystore',
      keystorePassword: 'balipass2024',
      keystoreKeyAlias: 'balipass',
      keystoreKeyPassword: 'balipass2024'
    }
  }
};

export default config;