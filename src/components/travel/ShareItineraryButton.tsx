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
  Copy,
  MessageCircle,
  Mail,
  Facebook,
  Download,
  X,
  Check,
  Link2,
} from "lucide-react";
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
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
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
        <Button variant="outline" size="sm" className="gap-2">
          {copied ? (
            <>
              <Check className="w-4 h-4" />
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleCopyLinkOnly}>
          <Link2 className="w-4 h-4 mr-2" />
          Copier le lien uniquement
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="w-4 h-4 mr-2" />
          Copier lien + description
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleNativeShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Partager via...
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Partager sur WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareEmail}>
          <Mail className="w-4 h-4 mr-2" />
          Partager par Email
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Partager sur Facebook
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDownloadMap}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger la carte
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleDisableSharing}
          className="text-destructive focus:text-destructive"
        >
          <X className="w-4 h-4 mr-2" />
          Désactiver le partage
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
