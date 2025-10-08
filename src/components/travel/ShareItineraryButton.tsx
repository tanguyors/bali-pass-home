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
      storyDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)';
      storyDiv.style.padding = '0';
      storyDiv.style.fontFamily = "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif";
      storyDiv.style.color = 'white';
      storyDiv.style.position = 'relative';
      storyDiv.style.overflow = 'hidden';
      
      const daysDiff = Math.ceil((new Date(itinerary.end_date).getTime() - new Date(itinerary.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      storyDiv.innerHTML = `
        <!-- Formes décoratives en arrière-plan -->
        <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px);"></div>
        <div style="position: absolute; bottom: -150px; left: -150px; width: 500px; height: 500px; background: rgba(255,255,255,0.08); border-radius: 50%; filter: blur(80px);"></div>
        <div style="position: absolute; top: 300px; right: -50px; width: 250px; height: 250px; background: rgba(255,255,255,0.06); border-radius: 50%; filter: blur(50px);"></div>
        
        <!-- Grain texture overlay -->
        <div style="position: absolute; inset: 0; background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.05%22/%3E%3C/svg%3E'); mix-blend-mode: overlay; opacity: 0.3;"></div>
        
        <div style="position: relative; display: flex; flex-direction: column; height: 100%; padding: 70px 60px; justify-content: space-between;">
          <!-- Header avec logo -->
          <div style="text-align: center; animation: fadeInDown 0.8s ease-out;">
            <div style="background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%); backdrop-filter: blur(30px); padding: 22px 40px; border-radius: 25px; display: inline-block; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4);">
              <div style="font-size: 24px; margin-bottom: 6px; opacity: 0.95; font-weight: 600; letter-spacing: 1px;">🗺️ ${t('travelPlanner.sharedBy') || 'Shared by'}</div>
              <div style="font-size: 52px; font-weight: 900; letter-spacing: 3px; background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 4px 20px rgba(0,0,0,0.2);">PassBali</div>
            </div>
          </div>
          
          <!-- Contenu principal -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 50px 0;">
            <!-- Titre principal avec effet néon -->
            <h1 style="font-size: 96px; font-weight: 900; margin-bottom: 60px; line-height: 1.1; word-wrap: break-word; background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3); filter: drop-shadow(0 8px 32px rgba(0,0,0,0.4)); letter-spacing: -2px;">
              ${itinerary.title}
            </h1>
            
            <!-- Stats cards avec effet 3D -->
            <div style="display: flex; justify-content: center; gap: 25px; margin-bottom: 70px;">
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%); backdrop-filter: blur(20px); padding: 30px 40px; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5); border: 2px solid rgba(255,255,255,0.25); transform: perspective(1000px) rotateY(-5deg); transition: all 0.3s;">
                <div style="font-size: 42px; margin-bottom: 12px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">📅</div>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.5px;">${daysDiff} ${t('travelPlanner.days') || 'jours'}</div>
              </div>
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%); backdrop-filter: blur(20px); padding: 30px 40px; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5); border: 2px solid rgba(255,255,255,0.25); transform: perspective(1000px) rotateY(5deg); transition: all 0.3s;">
                <div style="font-size: 42px; margin-bottom: 12px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">🌴</div>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.5px;">${days.filter((d: any) => d.itinerary_planned_offers?.length > 0).length} ${t('travelPlanner.cities') || 'villes'}</div>
              </div>
            </div>
            
            <!-- Section highlights avec design moderne -->
            <div style="background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%); backdrop-filter: blur(30px); padding: 55px 50px; border-radius: 40px; box-shadow: 0 30px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4); border: 2px solid rgba(255,255,255,0.3);">
              <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 40px;">
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent); border-radius: 2px;"></div>
                <h2 style="font-size: 46px; font-weight: 900; letter-spacing: 1px; margin: 0; background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
                  ✨ ${t('travelPlanner.highlights') || 'Points forts'}
                </h2>
                <div style="width: 60px; height: 4px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent); border-radius: 2px;"></div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 18px;">
                ${days.slice(0, 4).map((day: any, index: number) => {
                  const plannedOffers = day.itinerary_planned_offers || [];
                  if (plannedOffers.length === 0) return '';
                  
                  return `
                    <div style="background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%); backdrop-filter: blur(10px); padding: 22px 28px; border-radius: 22px; display: flex; align-items: center; gap: 20px; border: 1.5px solid rgba(255,255,255,0.25); box-shadow: 0 8px 24px rgba(0,0,0,0.15); transition: all 0.3s;">
                      <span style="font-size: 40px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));">📍</span>
                      <span style="font-size: 32px; font-weight: 700; flex: 1; text-align: left;">${day.cities?.name || `Jour ${index + 1}`}</span>
                      <span style="font-size: 28px; background: rgba(255,255,255,0.25); padding: 8px 18px; border-radius: 15px; font-weight: 700; backdrop-filter: blur(10px);">${plannedOffers.length}</span>
                    </div>
                  `;
                }).filter(Boolean).join('')}
              </div>
            </div>
          </div>
          
          <!-- Footer avec CTA -->
          <div style="text-align: center;">
            <div style="background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%); backdrop-filter: blur(30px); padding: 50px 55px; border-radius: 40px; box-shadow: 0 30px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5); border: 2px solid rgba(255,255,255,0.35);">
              <div style="font-size: 42px; font-weight: 900; margin-bottom: 18px; letter-spacing: 0.5px;">
                ${t('travelPlanner.readyForAdventure') || 'Prêt à vivre cette aventure ?'}
              </div>
              <div style="display: inline-block; background: rgba(255,255,255,0.95); color: #667eea; padding: 18px 45px; border-radius: 25px; font-size: 34px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 12px 40px rgba(0,0,0,0.25); border: 2px solid rgba(255,255,255,1);">
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
