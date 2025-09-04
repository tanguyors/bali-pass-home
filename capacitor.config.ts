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
  }
};

export default config;