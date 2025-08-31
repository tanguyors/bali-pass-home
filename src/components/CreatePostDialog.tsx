import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
  onSubmit: (content: string, rating?: number, partnerId?: string, offerId?: string) => Promise<any>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await onSubmit(
        content,
        rating > 0 ? rating : undefined,
        selectedPartnerId || undefined,
        selectedOfferId || undefined
      );
      
      // Reset form
      setContent('');
      setRating(0);
      setSelectedPartnerId('');
      setSelectedOfferId('');
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setLoading(false);
    }
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
      <DialogContent className="w-[95%] max-w-md">
        <DialogHeader>
          <DialogTitle>Partager votre expérience</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectItem value="">Aucun partenaire</SelectItem>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Offer Selection */}
          {selectedPartnerId && availableOffers.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Offre (optionnel)
              </label>
              <Select value={selectedOfferId} onValueChange={setSelectedOfferId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une offre..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune offre spécifique</SelectItem>
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
          {selectedPartnerId && (
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

          {/* Selected items preview */}
          {(selectedPartnerId || rating > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedPartner && (
                <Badge variant="secondary">
                  📍 {selectedPartner.name}
                </Badge>
              )}
              {rating > 0 && (
                <Badge variant="secondary">
                  ⭐ {rating}/5
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
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;