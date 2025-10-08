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
      storyDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
      storyDiv.style.padding = '0';
      storyDiv.style.fontFamily = "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif";
      storyDiv.style.color = 'white';
      storyDiv.style.overflow = 'hidden';
      
      const daysDiff = Math.ceil((new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      storyDiv.innerHTML = `
        <!-- Formes décoratives -->
        <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(255,255,255,0.15); border-radius: 50%; filter: blur(80px);"></div>
        <div style="position: absolute; bottom: -150px; left: -150px; width: 500px; height: 500px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(100px);"></div>
        
        <div style="position: relative; display: flex; flex-direction: column; height: 100%; padding: 70px 60px; justify-content: space-between;">
          <!-- Header -->
          <div style="text-align: center;">
            <div style="background: rgba(255,255,255,0.95); padding: 20px 40px; border-radius: 25px; display: inline-block; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
              <div style="font-size: 22px; margin-bottom: 4px; color: #667eea; font-weight: 600;">🗺️ ${t('travelPlanner.sharedBy') || 'Partagé par'}</div>
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 2px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">PassBali</div>
            </div>
          </div>
          
          <!-- Contenu principal -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 50px 0;">
            <!-- Titre -->
            <h1 style="font-size: 96px; font-weight: 900; margin-bottom: 60px; line-height: 1.1; word-wrap: break-word; color: #ffffff; text-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3); letter-spacing: -2px;">
              ${itinerary.title}
            </h1>
            
            <!-- Stats -->
            <div style="display: flex; justify-content: center; gap: 25px; margin-bottom: 70px;">
              <div style="background: rgba(255,255,255,0.95); padding: 30px 40px; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size: 40px; margin-bottom: 10px;">📅</div>
                <div style="font-size: 36px; font-weight: 800; color: #667eea;">${daysDiff}</div>
                <div style="font-size: 20px; font-weight: 600; color: #8b5cf6; margin-top: 4px;">${t('travelPlanner.days') || 'jours'}</div>
              </div>
              <div style="background: rgba(255,255,255,0.95); padding: 30px 40px; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size: 40px; margin-bottom: 10px;">🌴</div>
                <div style="font-size: 36px; font-weight: 800; color: #764ba2;">${days.filter((d: any) => d.itinerary_planned_offers?.length > 0).length}</div>
                <div style="font-size: 20px; font-weight: 600; color: #8b5cf6; margin-top: 4px;">${t('travelPlanner.cities') || 'villes'}</div>
              </div>
            </div>
            
            <!-- Highlights -->
            <div style="background: rgba(255,255,255,0.95); padding: 50px 45px; border-radius: 40px; box-shadow: 0 30px 80px rgba(0,0,0,0.3);">
              <h2 style="font-size: 44px; font-weight: 900; margin-bottom: 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
                ✨ ${t('travelPlanner.highlights') || 'Points forts'}
              </h2>
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${days.slice(0, 4).map((day: any, index: number) => {
                  const plannedOffers = day.itinerary_planned_offers || [];
                  if (plannedOffers.length === 0) return '';
                  
                  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
                  const color = colors[index % colors.length];
                  
                  return `
                    <div style="background: linear-gradient(135deg, ${color}15 0%, ${color}08 100%); padding: 20px 26px; border-radius: 22px; display: flex; align-items: center; gap: 18px; border: 2px solid ${color}30;">
                      <span style="font-size: 36px;">📍</span>
                      <span style="font-size: 30px; font-weight: 700; flex: 1; text-align: left; color: #1e293b;">${day.cities?.name || `Jour ${index + 1}`}</span>
                      <span style="font-size: 26px; background: ${color}; color: white; padding: 8px 18px; border-radius: 15px; font-weight: 700;">${plannedOffers.length}</span>
                    </div>
                  `;
                }).filter(Boolean).join('')}
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center;">
            <div style="background: rgba(255,255,255,0.95); padding: 45px 50px; border-radius: 40px; box-shadow: 0 30px 80px rgba(0,0,0,0.3);">
              <div style="font-size: 38px; font-weight: 900; margin-bottom: 18px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
                ${t('travelPlanner.readyForAdventure') || 'Prêt à vivre cette aventure ?'}
              </div>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 25px; font-size: 32px; font-weight: 900; display: inline-block; box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);">
                passbali.com
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
