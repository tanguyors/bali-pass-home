import { Browser } from '@capacitor/browser';

/**
 * Ouvre une URL externe en utilisant Safari View Controller sur mobile
 * ou window.open sur web
 */
export const openExternalUrl = async (url: string): Promise<void> => {
  try {
    // Utiliser Capacitor Browser (Safari View Controller sur iOS)
    await Browser.open({ 
      url,
      windowName: '_blank'
    });
  } catch (error) {
    console.log('Capacitor Browser failed, using fallback:', error);
    // Fallback vers window.open si Capacitor Browser échoue
    const opened = window.open(url, '_blank');
    if (!opened) {
      // Si popup bloqué, rediriger dans le même onglet
      window.location.href = url;
    }
  }
};