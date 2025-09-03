import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OfferUsedConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: {
    title: string;
    partner: {
      name: string;
      address?: string;
    };
  };
  userEmail?: string;
  redemptionTime?: string;
}

export function OfferUsedConfirmation({ 
  isOpen, 
  onClose, 
  offer, 
  userEmail,
  redemptionTime 
}: OfferUsedConfirmationProps) {
  const { t } = useLanguage();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const dateTime = redemptionTime ? formatDateTime(redemptionTime) : { date: '', time: '' };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl border-0 p-0 overflow-hidden bg-white">
        {/* Header avec bouton fermer */}
        <div className="relative p-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-500" />
          </Button>
        </div>

        {/* Contenu principal */}
        <div className="px-6 pb-6 text-center">
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Titre principal */}
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            {t('offers.used_successfully')}
          </h2>
          
          {/* Sous-titre */}
          <p className="text-gray-600 mb-6">
            {t('offer_details.show_merchant')}
          </p>

          {/* Carte avec détails de l'offre */}
          <div className="bg-green-50 rounded-2xl p-6 mb-6 text-left border-2 border-green-100">
            {/* Email utilisateur */}
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {userEmail}
              </span>
            </div>

            {/* Titre de l'offre */}
            <h3 className="font-bold text-lg text-green-800 mb-3 leading-tight">
              {offer?.title}
            </h3>

            {/* Nom du partenaire */}
            <p className="font-semibold text-green-700 mb-2">
              {offer?.partner.name}
            </p>

            {/* Adresse */}
            {offer?.partner.address && (
              <div className="flex items-start gap-2 mb-4">
                <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-700">
                  {offer.partner.address}
                </span>
              </div>
            )}

            {/* Date et heure */}
            <div className="flex items-center gap-6 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span>{dateTime.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span>{dateTime.time}</span>
              </div>
            </div>

            {/* Badge de validation */}
            <div className="mt-4 p-3 bg-green-600 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">
                {t('offer_details.validated')}
              </span>
              </div>
            </div>
          </div>

          {/* Bouton fermer */}
          <Button 
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl text-lg"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}