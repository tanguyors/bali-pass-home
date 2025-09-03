import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface PassSettings {
  setting_key: string;
  setting_value: string;
}

// Cache global pour éviter les requêtes multiples
let cachedSettings: PassSettings[] | null = null;
let isLoading = false;
let loadingPromise: Promise<PassSettings[]> | null = null;

export function usePassSettings(filterKeys?: string[]) {
  const [settings, setSettings] = useState<PassSettings[]>(cachedSettings || []);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async (): Promise<PassSettings[]> => {
    // Si déjà en cours de chargement, retourner la promesse existante
    if (loadingPromise) {
      return loadingPromise;
    }

    // Si déjà en cache, retourner le cache
    if (cachedSettings) {
      return cachedSettings;
    }

    // Créer une nouvelle promesse de chargement
    loadingPromise = (async () => {
      try {
        isLoading = true;
        logger.debug('Fetching pass settings from database');
        
        const { data, error } = await supabase
          .from('pass_settings')
          .select('setting_key, setting_value');
        
        if (error) {
          throw error;
        }
        
        cachedSettings = data || [];
        logger.debug('Pass settings cached', { count: cachedSettings.length });
        return cachedSettings;
      } catch (err) {
        logger.error('Error fetching pass settings', err);
        throw err;
      } finally {
        isLoading = false;
        loadingPromise = null;
      }
    })();

    return loadingPromise;
  };

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const allSettings = await fetchSettings();
        
        if (!mounted) return;

        // Filtrer si des clés spécifiques sont demandées
        const filteredSettings = filterKeys 
          ? allSettings.filter(setting => filterKeys.includes(setting.setting_key))
          : allSettings;

        setSettings(filteredSettings);
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setSettings([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [filterKeys?.join(',')]); // Re-run si les filtres changent

  return { settings, loading, error };
}

// Helper pour obtenir une valeur spécifique
export function usePassSetting(key: string) {
  const { settings, loading, error } = usePassSettings([key]);
  const value = settings.find(setting => setting.setting_key === key)?.setting_value;
  return { value, loading, error };
}