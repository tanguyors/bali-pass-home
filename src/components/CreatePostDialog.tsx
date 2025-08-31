import React, { useState, useEffect } from 'react';
import { Star, X, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  name: string;
  slug: string;
  offers: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
}

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, rating?: number, partnerId?: string, offerId?: string, photos?: string[]) => Promise<any>;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const { toast } = useToast();

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          id,
          name,
          slug,
          offers (
            id,
            title,
            slug
          )
        `)
        .eq('status', 'approved')
        .order('name');

      if (error) {
        console.error('Error fetching partners:', error);
        return;
      }

      setPartners(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPartners();
    }
  }, [isOpen]);

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);
  const availableOffers = selectedPartner?.offers || [];
  const selectedOffer = availableOffers.find(o => o.id === selectedOfferId);

  const uploadPhotos = async (photos: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) throw new Error('User not authenticated');

    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('community-photos')
        .upload(fileName, photo);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('community-photos')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un contenu pour votre post",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setUploadingPhotos(selectedPhotos.length > 0);
      
      // Upload photos if any
      let photoUrls: string[] = [];
      if (selectedPhotos.length > 0) {
        photoUrls = await uploadPhotos(selectedPhotos);
      }
      
      await onSubmit(
        content,
        rating > 0 ? rating : undefined,
        selectedPartnerId && selectedPartnerId !== 'none' ? selectedPartnerId : undefined,
        selectedOfferId && selectedOfferId !== 'none' ? selectedOfferId : undefined,
        photoUrls.length > 0 ? photoUrls : undefined
      );
      
      // Reset form
      setContent('');
      setRating(0);
      setSelectedPartnerId('');
      setSelectedOfferId('');
      setSelectedPhotos([]);
      onClose();
      
      toast({
        title: "Succès",
        description: "Votre post a été publié avec succès !",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingPhotos(false);
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      
      if (!isValidType) {
        toast({
          title: "Erreur",
          description: "Seules les images sont autorisées",
          variant: "destructive",
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "Erreur",
          description: "Les images ne doivent pas dépasser 5MB",
          variant: "destructive",
        });
      }
      
      return isValidType && isValidSize;
    });

    if (selectedPhotos.length + validFiles.length > 4) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez ajouter que 4 photos maximum",
        variant: "destructive",
      });
      return;
    }

    setSelectedPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className="text-2xl hover:scale-110 transition-transform"
      >
        <Star
          className={`w-6 h-6 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
          }`}
        />
      </button>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Partager votre expérience</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Votre avis *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partagez votre expérience avec la communauté..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {content.length}/500 caractères
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Photos (optionnel)
            </label>
            <div className="space-y-3">
              {/* Photo Preview */}
              {selectedPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Photo Button */}
              {selectedPhotos.length < 4 && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedPhotos.length === 0 ? 'Ajouter des photos' : 'Ajouter plus de photos'}
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Maximum 4 photos, 5MB par photo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Partner Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Partenaire (optionnel)
            </label>
            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un partenaire..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun partenaire</SelectItem>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Offer Selection */}
          {selectedPartnerId && selectedPartnerId !== 'none' && availableOffers.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Offre (optionnel)
              </label>
              <Select value={selectedOfferId} onValueChange={setSelectedOfferId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une offre..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune offre spécifique</SelectItem>
                  {availableOffers.map((offer) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      {offer.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Rating */}
          {selectedPartnerId && selectedPartnerId !== 'none' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Note (optionnel)
              </label>
              <div className="flex items-center gap-1">
                {renderStars()}
                {rating > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRating(0)}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Selected items preview */}
          {((selectedPartnerId && selectedPartnerId !== 'none') || rating > 0 || selectedPhotos.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedPartnerId && selectedPartnerId !== 'none' && selectedPartner && (
                <Badge variant="secondary">
                  📍 {selectedPartner.name}
                </Badge>
              )}
              {selectedOfferId && selectedOfferId !== 'none' && selectedOffer && (
                <Badge variant="secondary">
                  🎁 {selectedOffer.title}
                </Badge>
              )}
              {rating > 0 && (
                <Badge variant="secondary">
                  ⭐ {rating}/5
                </Badge>
              )}
              {selectedPhotos.length > 0 && (
                <Badge variant="secondary">
                  📷 {selectedPhotos.length} photo{selectedPhotos.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || loading}
              className="flex-1"
            >
              {uploadingPhotos ? 'Upload des photos...' : loading ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;