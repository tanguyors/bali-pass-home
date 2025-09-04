import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2af2c1af70fe42cc976c665c5ed05358',
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