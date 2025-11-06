import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.balipass.app',
  appName: "BaliPass - Digital Pass for Bali",
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
    // Signing configuration moved to environment variables for security
    // Use gradle.properties or environment variables instead
  }
};

export default config;