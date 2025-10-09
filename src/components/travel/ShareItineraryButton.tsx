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
      
      // Générer l'URL de la carte statique
      const mapUrl = generateStaticMapUrl(days);
      
      storyDiv.innerHTML = `
        <!-- Carte en fond -->
        <div style="position: absolute; inset: 0;">
          <img src="${mapUrl}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />
        </div>
        
        <!-- Overlay assombrissant pour contraste et lisibilité -->
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.6) 100%);"></div>
        
        <!-- Contenu avec safe zones Instagram -->
        <div style="position: relative; padding: 180px 100px; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
          
          <!-- 1. HEADER - Logo + Titre -->
          <div style="text-align: center;">
            <!-- Petit logo badge discret -->
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(20px); padding: 12px 28px; border-radius: 100px; margin-bottom: 24px; border: 2px solid rgba(255,255,255,0.5); box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
              <span style="font-size: 18px; font-weight: 700; color: white; letter-spacing: 1.5px; text-shadow: 0 2px 8px rgba(0,0,0,0.4);">Created with Pass'Bali</span>
            </div>
            
            <!-- TITRE GÉANT -->
            <h1 style="font-size: 120px; font-weight: 900; color: #FFFFFF; line-height: 0.95; margin: 0 0 20px 0; text-shadow: 0 12px 48px rgba(0,0,0,0.8), 0 6px 16px rgba(0,0,0,0.6); letter-spacing: -3px; font-family: 'Poppins', sans-serif;">
              ${itinerary.title}
            </h1>
            
            <!-- Sous-titre -->
            <div style="font-size: 46px; color: white; font-weight: 700; text-shadow: 0 4px 16px rgba(0,0,0,0.7); letter-spacing: 1px;">
              ✈️ ${new Date(itinerary.start_date).toLocaleDateString(language, { month: 'long', year: 'numeric' })}
            </div>
          </div>
          
          <!-- 2. BADGES INFOS -->
          <div style="display: flex; justify-content: center; gap: 20px; margin: 60px 0;">
            <!-- Badge Durée -->
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); padding: 24px 36px; border-radius: 24px; text-align: center; box-shadow: 0 16px 48px rgba(0,0,0,0.4);">
              <div style="font-size: 48px; margin-bottom: 8px;">📅</div>
              <div style="font-size: 58px; font-weight: 900; color: #FF6B6B; line-height: 1;">${daysDiff}</div>
              <div style="font-size: 24px; font-weight: 700; color: #555; margin-top: 4px; letter-spacing: 0.5px;">${t('travelPlanner.days') || 'days'}</div>
            </div>
            
            <!-- Badge Villes -->
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); padding: 24px 36px; border-radius: 24px; text-align: center; box-shadow: 0 16px 48px rgba(0,0,0,0.4);">
              <div style="font-size: 48px; margin-bottom: 8px;">🌆</div>
              <div style="font-size: 58px; font-weight: 900; color: #C471ED; line-height: 1;">${activeDays.length}</div>
              <div style="font-size: 24px; font-weight: 700; color: #555; margin-top: 4px; letter-spacing: 0.5px;">${t('travelPlanner.cities') || 'cities'}</div>
            </div>
            
            <!-- Badge Spots -->
            <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); padding: 24px 36px; border-radius: 24px; text-align: center; box-shadow: 0 16px 48px rgba(0,0,0,0.4);">
              <div style="font-size: 48px; margin-bottom: 8px;">📍</div>
              <div style="font-size: 58px; font-weight: 900; color: #12CBC4; line-height: 1;">${totalOffers}</div>
              <div style="font-size: 24px; font-weight: 700; color: #555; margin-top: 4px; letter-spacing: 0.5px;">spots</div>
            </div>
          </div>
          
          <!-- 3. CTA FINAL -->
          <div style="text-align: center; margin-top: auto;">
            <div style="background: linear-gradient(135deg, #FF8C42 0%, #FF5D73 100%); padding: 48px 56px; border-radius: 36px; box-shadow: 0 24px 72px rgba(255,93,115,0.5), 0 12px 32px rgba(0,0,0,0.4); border: 3px solid rgba(255,255,255,0.4);">
              <div style="font-size: 54px; font-weight: 900; color: white; margin-bottom: 26px; line-height: 1.2; text-shadow: 0 6px 20px rgba(0,0,0,0.4);">
                🌴 ${t('travelPlanner.readyForBaliAdventure') || 'Ready for your Bali adventure?'}
              </div>
              
              <div style="display: inline-block; background: white; padding: 20px 56px; border-radius: 100px; box-shadow: 0 12px 36px rgba(0,0,0,0.3);">
                <span style="font-size: 46px; font-weight: 900; color: #FF5D73; letter-spacing: 0.5px;">passbali.com</span>
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
