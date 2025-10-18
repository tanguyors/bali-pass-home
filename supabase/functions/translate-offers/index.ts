import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

async function translateText(text: string, targetLang: string, apiKey: string): Promise<string> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      target: targetLang,
      format: 'text',
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const googleApiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
    if (!googleApiKey) {
      throw new Error('Google Translate API key not configured');
    }

    // Récupérer toutes les offres actives
    const { data: offers, error: fetchError } = await supabaseClient
      .from('offers')
      .select('id, title, short_desc, long_desc, conditions_text, title_en, title_es, title_id, title_zh, short_desc_en, short_desc_es, short_desc_id, short_desc_zh, long_desc_en, long_desc_es, long_desc_id, long_desc_zh, conditions_text_en, conditions_text_es, conditions_text_id, conditions_text_zh')
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    // Récupérer tous les partenaires approuvés
    const { data: partners, error: partnersError } = await supabaseClient
      .from('partners')
      .select('id, description, description_en, description_es, description_id, description_zh')
      .eq('status', 'approved');

    if (partnersError) throw partnersError;

    const languages = [
      { code: 'en', suffix: '_en' },
      { code: 'es', suffix: '_es' },
      { code: 'id', suffix: '_id' },
      { code: 'zh', suffix: '_zh' },
    ];

    const fields = ['title', 'short_desc', 'long_desc', 'conditions_text'];
    const partnerFields = ['description'];

    let translatedCount = 0;
    let skippedCount = 0;

    // Traduire les offres
    for (const offer of offers || []) {
      const updates: any = {};
      let hasUpdates = false;

      for (const field of fields) {
        const sourceText = offer[field];
        if (!sourceText || sourceText.trim() === '') continue;

        for (const lang of languages) {
          const fieldName = `${field}${lang.suffix}`;
          
          // Si la traduction existe déjà, on la saute
          if (offer[fieldName] && offer[fieldName].trim() !== '') {
            skippedCount++;
            continue;
          }

          try {
            // Traduire le texte
            const translated = await translateText(sourceText, lang.code, googleApiKey);
            updates[fieldName] = translated;
            hasUpdates = true;
            translatedCount++;
            
            // Petit délai pour éviter de surcharger l'API
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error translating ${field} to ${lang.code} for offer ${offer.id}:`, error);
          }
        }
      }

      // Mettre à jour l'offre si il y a des traductions
      if (hasUpdates) {
        const { error: updateError } = await supabaseClient
          .from('offers')
          .update(updates)
          .eq('id', offer.id);

        if (updateError) {
          console.error(`Error updating offer ${offer.id}:`, updateError);
        }
      }
    }

    // Traduire les descriptions des partenaires
    for (const partner of partners || []) {
      const updates: any = {};
      let hasUpdates = false;

      for (const field of partnerFields) {
        const sourceText = partner[field];
        if (!sourceText || sourceText.trim() === '') continue;

        for (const lang of languages) {
          const fieldName = `${field}${lang.suffix}`;
          
          // Si la traduction existe déjà, on la saute
          if (partner[fieldName] && partner[fieldName].trim() !== '') {
            skippedCount++;
            continue;
          }

          try {
            // Traduire le texte
            const translated = await translateText(sourceText, lang.code, googleApiKey);
            updates[fieldName] = translated;
            hasUpdates = true;
            translatedCount++;
            
            // Petit délai pour éviter de surcharger l'API
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error translating ${field} to ${lang.code} for partner ${partner.id}:`, error);
          }
        }
      }

      // Mettre à jour le partenaire si il y a des traductions
      if (hasUpdates) {
        const { error: updateError } = await supabaseClient
          .from('partners')
          .update(updates)
          .eq('id', partner.id);

        if (updateError) {
          console.error(`Error updating partner ${partner.id}:`, updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Translation completed: ${translatedCount} fields translated, ${skippedCount} fields skipped (already translated)`,
        translatedCount,
        skippedCount,
        totalOffers: offers?.length || 0,
        totalPartners: partners?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
