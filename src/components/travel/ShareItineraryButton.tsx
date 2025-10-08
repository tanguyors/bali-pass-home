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
      // Create a temporary div with the story content
      const storyDiv = document.createElement('div');
      storyDiv.style.position = 'fixed';
      storyDiv.style.left = '-9999px';
      storyDiv.style.width = '1080px';
      storyDiv.style.height = '1920px';
      storyDiv.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)';
      storyDiv.style.padding = '80px 60px';
      storyDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      storyDiv.style.color = 'white';
      
      const daysDiff = Math.ceil((new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      storyDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
          <div style="text-align: center;">
            <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(20px); padding: 25px 35px; border-radius: 30px; display: inline-block; margin-bottom: 60px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
              <div style="font-size: 28px; margin-bottom: 8px; opacity: 0.9;">🗺️ ${t('travelPlanner.sharedBy') || 'Shared by'}</div>
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 2px;">PassBali</div>
            </div>
          </div>
          
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 40px 0;">
            <h1 style="font-size: 88px; font-weight: 900; margin-bottom: 50px; text-shadow: 0 4px 30px rgba(0,0,0,0.3); line-height: 1.1; word-wrap: break-word;">
              ${itinerary.title}
            </h1>
            
            <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 60px;">
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 25px 35px; border-radius: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <div style="font-size: 24px; opacity: 0.9; margin-bottom: 8px;">📅</div>
                <div style="font-size: 32px; font-weight: 700;">${daysDiff} ${t('travelPlanner.days') || 'days'}</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 25px 35px; border-radius: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <div style="font-size: 24px; opacity: 0.9; margin-bottom: 8px;">📍</div>
                <div style="font-size: 32px; font-weight: 700;">${days.filter((d: any) => d.itinerary_planned_offers?.length > 0).length} ${t('travelPlanner.days') || 'days'}</div>
              </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(20px); padding: 50px; border-radius: 35px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);">
              <h2 style="font-size: 48px; font-weight: 800; margin-bottom: 35px; letter-spacing: 1px;">
                ✨ ${t('travelPlanner.highlights') || 'Highlights'}
              </h2>
              <div style="display: flex; flex-direction: column; gap: 22px; text-align: left;">
                ${days.slice(0, 4).map((day: any, index: number) => {
                  const plannedOffers = day.itinerary_planned_offers || [];
                  if (plannedOffers.length === 0) return '';
                  
                  return `
                    <div style="font-size: 32px; padding: 20px 25px; background: rgba(255,255,255,0.1); border-radius: 20px; display: flex; align-items: center; gap: 20px;">
                      <span style="font-size: 40px;">📍</span>
                      <span style="font-weight: 600;">${day.cities?.name || `Day ${index + 1}`}</span>
                      <span style="opacity: 0.8; margin-left: auto;">${plannedOffers.length} ${plannedOffers.length > 1 ? 'offers' : 'offer'}</span>
                    </div>
                  `;
                }).filter(Boolean).join('')}
              </div>
            </div>
          </div>
          
          <div style="text-align: center; background: rgba(255,255,255,0.2); backdrop-filter: blur(20px); padding: 45px; border-radius: 35px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);">
            <div style="font-size: 38px; font-weight: 800; margin-bottom: 20px;">
              ${t('travelPlanner.readyForAdventure') || 'Ready for this adventure?'}
            </div>
            <div style="font-size: 32px; opacity: 0.95; font-weight: 600; letter-spacing: 0.5px;">
              passbali.com
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
