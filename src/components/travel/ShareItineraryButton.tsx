import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  MessageCircle,
  Check,
  Link2,
  Instagram,
  Sparkles,
} from "lucide-react";
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Share as CapShare } from '@capacitor/share';
import { toast } from "sonner";
import { 
  useGenerateShareLink, 
  useDisableSharing, 
  generateStaticMapUrl, 
  generateItineraryDescription,
  type SharedItineraryData 
} from "@/hooks/useSharedItinerary";
import { type Itinerary } from "@/hooks/useItineraries";
import { type ItineraryDay } from "@/hooks/useItineraryDays";
import { useTranslation } from "@/hooks/useTranslation";

interface ShareItineraryButtonProps {
  itinerary: Itinerary;
  days: ItineraryDay[];
}

export function ShareItineraryButton({ itinerary, days }: ShareItineraryButtonProps) {
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const generateLink = useGenerateShareLink();
  const disableSharing = useDisableSharing();

  const shareUrl = itinerary.share_token
    ? `${window.location.origin}/shared-itinerary/${itinerary.share_token}`
    : "";

  const appDeepLink = itinerary.share_token
    ? `passbali://shared-itinerary/${itinerary.share_token}`
    : "";

  const handleGenerateLink = () => {
    generateLink.mutate(itinerary.id);
  };

  const handleCopyLinkOnly = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('travelPlanner.linkCopied') || 'Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('common.error') || 'Erreur lors de la copie');
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    const mapUrl = generateStaticMapUrl(days);
    const description = generateItineraryDescription({
      ...itinerary,
      is_public: itinerary.is_public || false,
      days: days as any,
    } as SharedItineraryData);

    const textToCopy = `${description}\n\n📍 Voir sur la carte: ${mapUrl}\n\n🔗 ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(t('travelPlanner.linkCopied') || 'Lien copié avec description !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('common.error') || 'Erreur lors de la copie');
    }
  };

  const handleShareWhatsApp = () => {
    if (!shareUrl) return;

    const description = generateItineraryDescription({
      ...itinerary,
      is_public: itinerary.is_public || false,
      days: days as any,
    } as SharedItineraryData);

    const message = encodeURIComponent(`${description}\n\n🔗 ${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = () => {
    if (!shareUrl) return;

    const mapUrl = generateStaticMapUrl(days);
    const description = generateItineraryDescription({
      ...itinerary,
      is_public: itinerary.is_public || false,
      days: days as any,
    } as SharedItineraryData);

    const subject = encodeURIComponent(`Itinéraire Bali: ${itinerary.title}`);
    const body = encodeURIComponent(
      `${description}\n\nVoir sur la carte: ${mapUrl}\n\nConsulter l'itinéraire complet: ${shareUrl}`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareFacebook = () => {
    if (!shareUrl) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const handleDownloadMap = () => {
    const mapUrl = generateStaticMapUrl(days);
    window.open(mapUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;

    const description = generateItineraryDescription({
      ...itinerary,
      is_public: itinerary.is_public || false,
      days: days as any,
    } as SharedItineraryData);

    try {
      if (navigator.share) {
        await navigator.share({
          title: itinerary.title,
          text: description,
          url: shareUrl,
        });
      } else {
        await handleCopyLink();
      }
    } catch (error) {
      // Utilisateur a annulé le partage
    }
  };

  const handleDisableSharing = () => {
    disableSharing.mutate(itinerary.id);
  };

  const generateInstagramStory = async () => {
    setIsGeneratingStory(true);
    
    try {
      const storyDiv = document.createElement('div');
      storyDiv.style.position = 'fixed';
      storyDiv.style.left = '-9999px';
      storyDiv.style.width = '1080px';
      storyDiv.style.height = '1920px';
      storyDiv.style.fontFamily = "'Poppins', 'Inter', -apple-system, sans-serif";
      storyDiv.style.overflow = 'hidden';
      storyDiv.style.position = 'relative';
      
      const daysDiff = Math.ceil((new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const activeDays = days.filter((d: any) => d.itinerary_planned_offers?.length > 0);
      
      // Calculer le total des offres
      const totalOffers = activeDays.reduce((sum: number, day: any) => 
        sum + (day.itinerary_planned_offers?.length || 0), 0
      );
      
      storyDiv.innerHTML = `
        <!-- Photo de fond Bali (simulation avec dégradé tropical + overlay) -->
        <div style="position: absolute; inset: 0; background: linear-gradient(165deg, #FF9A56 0%, #FF6B9D 30%, #C471ED 60%, #12CBC4 100%);"></div>
        
        <!-- Overlay assombrissant pour contraste -->
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.4) 100%);"></div>
        
        <!-- Effet halo de lumière (soleil couchant) -->
        <div style="position: absolute; top: 200px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,220,120,0.4) 0%, transparent 70%); filter: blur(80px);"></div>
        
        <!-- Texture grain subtile -->
        <div style="position: absolute; inset: 0; background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.2%22 numOctaves=%223%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.08%22/%3E%3C/svg%3E'); opacity: 0.5; mix-blend-mode: overlay;"></div>
        
        <!-- Formes décoratives organiques (vagues, palmiers stylisés) -->
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 300px; background: linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%);"></div>
        
        <!-- Contenu avec safe zones Instagram -->
        <div style="position: relative; padding: 220px 120px; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
          
          <!-- 1. HEADER - Logo + Titre storytelling -->
          <div style="text-align: center;">
            <!-- Petit logo badge discret -->
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(15px); padding: 10px 24px; border-radius: 100px; margin-bottom: 20px; border: 1.5px solid rgba(255,255,255,0.4); box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
              <span style="font-size: 16px; font-weight: 700; color: white; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Created with Bali'Pass</span>
            </div>
            
            <!-- TITRE GÉANT - Style magazine voyage -->
            <h1 style="font-size: 110px; font-weight: 900; color: #FFFFFF; line-height: 0.95; margin: 0 0 18px 0; text-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4); letter-spacing: -3px; font-family: 'Poppins', sans-serif;">
              ${itinerary.title}
            </h1>
            
            <!-- Sous-titre émoji voyage -->
            <div style="font-size: 42px; color: white; font-weight: 700; text-shadow: 0 3px 12px rgba(0,0,0,0.5); letter-spacing: 1px;">
              ✈️ ${new Date(itinerary.start_date).toLocaleDateString(language, { month: 'long', year: 'numeric' })}
            </div>
          </div>
          
          <!-- 2. BADGES INFOS - Style carte postale moderne -->
          <div style="display: flex; justify-content: center; gap: 16px; margin: 50px 0;">
            <!-- Badge Durée avec icône stylée -->
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); padding: 20px 32px; border-radius: 20px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.25), inset 0 -2px 0 rgba(255,154,86,0.3); border-top: 3px solid rgba(255,154,86,0.5);">
              <div style="font-size: 44px; margin-bottom: 6px;">📅</div>
              <div style="font-size: 52px; font-weight: 900; color: #FF6B6B; line-height: 1;">${daysDiff}</div>
              <div style="font-size: 22px; font-weight: 700; color: #555; margin-top: 2px; letter-spacing: 0.5px;">${t('travelPlanner.days') || 'days'}</div>
            </div>
            
            <!-- Badge Villes -->
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); padding: 20px 32px; border-radius: 20px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.25), inset 0 -2px 0 rgba(196,113,237,0.3); border-top: 3px solid rgba(196,113,237,0.5);">
              <div style="font-size: 44px; margin-bottom: 6px;">🌆</div>
              <div style="font-size: 52px; font-weight: 900; color: #C471ED; line-height: 1;">${activeDays.length}</div>
              <div style="font-size: 22px; font-weight: 700; color: #555; margin-top: 2px; letter-spacing: 0.5px;">${t('travelPlanner.cities') || 'cities'}</div>
            </div>
            
            <!-- Badge Spots -->
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); padding: 20px 32px; border-radius: 20px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.25), inset 0 -2px 0 rgba(18,203,196,0.3); border-top: 3px solid rgba(18,203,196,0.5);">
              <div style="font-size: 44px; margin-bottom: 6px;">📍</div>
              <div style="font-size: 52px; font-weight: 900; color: #12CBC4; line-height: 1;">${totalOffers}</div>
              <div style="font-size: 22px; font-weight: 700; color: #555; margin-top: 2px; letter-spacing: 0.5px;">spots</div>
            </div>
          </div>
          
          <!-- 3. DESTINATIONS - Style tags flottants organiques -->
          <div style="margin: 30px 0;">
            <!-- Titre section avec effet manuscrit -->
            <div style="text-align: center; margin-bottom: 28px;">
              <h2 style="font-size: 56px; font-weight: 900; color: white; margin: 0; text-shadow: 0 6px 24px rgba(0,0,0,0.5); letter-spacing: -1px; display: inline-block; position: relative;">
                ✨ ${t('travelPlanner.highlights') || 'Your Adventure'}
                <!-- Soulignement décoratif -->
                <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 80%; height: 4px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); border-radius: 2px;"></div>
              </h2>
            </div>
            
            <!-- Tags destinations avec emojis contextuels -->
            <div style="display: flex; flex-direction: column; gap: 14px; max-width: 750px; margin: 0 auto;">
              ${activeDays.slice(0, 5).map((day: any, index: number) => {
                const plannedOffers = day.itinerary_planned_offers || [];
                const cityName = day.cities?.name || 'Destination';
                
                // Emojis contextuels par destination
                const emojis = ['🏄‍♂️', '🌊', '🏖️', '🌴', '🛵'];
                const emoji = emojis[index % emojis.length];
                
                // Couleurs vibrantes différentes
                const gradients = [
                  'linear-gradient(135deg, #FF6B9D, #FFA07A)',
                  'linear-gradient(135deg, #C471ED, #F09AE9)',
                  'linear-gradient(135deg, #12CBC4, #4FACFE)',
                  'linear-gradient(135deg, #FF9A56, #FFCD3C)',
                  'linear-gradient(135deg, #667EEA, #764BA2)'
                ];
                const gradient = gradients[index % gradients.length];
                
                return `
                  <div style="background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(15px); padding: 18px 28px; border-radius: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 8px 28px rgba(0,0,0,0.2);">
                    <div style="display: flex; align-items: center; gap: 14px;">
                      <span style="font-size: 38px;">${emoji}</span>
                      <span style="font-size: 38px; font-weight: 800; color: #1E1E1E; letter-spacing: -0.5px;">${cityName}</span>
                    </div>
                    <div style="background: ${gradient}; color: white; padding: 8px 20px; border-radius: 14px; font-size: 30px; font-weight: 900; box-shadow: 0 4px 16px rgba(0,0,0,0.2); min-width: 60px; text-align: center;">
                      ${plannedOffers.length}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <!-- 4. CTA FINAL - Style carte voyage premium -->
          <div style="text-align: center; margin-top: 50px;">
            <!-- Carte CTA avec dégradé chaud -->
            <div style="background: linear-gradient(135deg, #FF8C42 0%, #FF5D73 100%); padding: 42px 48px; border-radius: 32px; box-shadow: 0 20px 60px rgba(255,93,115,0.4), 0 8px 24px rgba(0,0,0,0.3); border: 3px solid rgba(255,255,255,0.3);">
              <!-- Texte accrocheur -->
              <div style="font-size: 50px; font-weight: 900; color: white; margin-bottom: 22px; line-height: 1.2; text-shadow: 0 4px 16px rgba(0,0,0,0.3);">
                🌴 Ready for your<br/>Bali adventure?
              </div>
              
              <!-- Bouton site web -->
              <div style="display: inline-block; background: white; padding: 18px 52px; border-radius: 100px; box-shadow: 0 8px 28px rgba(0,0,0,0.25); transform: scale(1); transition: transform 0.2s;">
                <span style="font-size: 42px; font-weight: 900; background: linear-gradient(135deg, #FF8C42, #FF5D73); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 0.5px;">passbali.com</span>
              </div>
            </div>
          </div>
          
        </div>
      `;
      
      document.body.appendChild(storyDiv);
      
      const canvas = await html2canvas(storyDiv, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      
      document.body.removeChild(storyDiv);
      
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        if (Capacitor.isNativePlatform()) {
          try {
            await CapShare.share({
              title: itinerary.title,
              text: `${itinerary.title} - ${t('travelPlanner.sharedBy')} PassBali`,
              url: base64data,
              dialogTitle: t('travelPlanner.shareOn') || 'Share on',
            });
            toast.success(t('travelPlanner.sharedSuccessfully') || 'Partagé avec succès !');
          } catch (error) {
            console.error('Error sharing:', error);
            toast.error(t('travelPlanner.shareError') || 'Erreur lors du partage');
          }
        } else {
          const link = document.createElement('a');
          link.download = `${itinerary.title}-instagram-story.png`;
          link.href = base64data;
          link.click();
          toast.success(t('travelPlanner.imageDownloaded') || 'Image téléchargée ! Vous pouvez maintenant la publier sur Instagram.');
        }
      };
      
    } catch (error) {
      console.error('Error generating Instagram story:', error);
      toast.error(t('travelPlanner.shareError') || 'Erreur lors de la génération');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Si pas encore de lien de partage
  if (!itinerary.share_token || !itinerary.is_public) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateLink}
        disabled={generateLink.isPending}
        className="gap-2"
      >
        <Link2 className="w-4 h-4" />
        {generateLink.isPending
          ? (t('travelPlanner.generating') || 'Génération...')
          : (t('travelPlanner.generateLink') || 'Générer un lien')}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hover:bg-primary/5 transition-colors border-border/60 hover:border-primary/30"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              {t('travelPlanner.copied') || 'Copié'}
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              {t('travelPlanner.share') || 'Partager'}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-lg border-border/60">
        <DropdownMenuItem 
          onClick={handleCopyLinkOnly}
          className="gap-3 py-3 cursor-pointer hover:bg-primary/5"
        >
          <Link2 className="w-4 h-4 text-primary" />
          <span className="font-medium">{t('travelPlanner.copyLink') || 'Copier le lien uniquement'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleShareWhatsApp}
          className="gap-3 py-3 cursor-pointer hover:bg-green-500/5"
        >
          <MessageCircle className="w-4 h-4 text-green-600" />
          <span className="font-medium">{t('travelPlanner.shareWhatsApp') || 'Partager sur WhatsApp'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={generateInstagramStory}
          disabled={isGeneratingStory}
          className="gap-3 py-3 cursor-pointer hover:bg-pink-500/5"
        >
          {isGeneratingStory ? (
            <>
              <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
              <span className="font-medium">{t('travelPlanner.generating') || 'Génération...'}</span>
            </>
          ) : (
            <>
              <Instagram className="w-4 h-4 text-pink-500" />
              <span className="font-medium">{t('travelPlanner.shareInstagramStory') || 'Partager en story Instagram'}</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
