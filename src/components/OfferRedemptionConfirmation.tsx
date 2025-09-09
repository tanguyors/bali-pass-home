import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, User, MapPin, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface OfferRedemptionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: string;
    title: string;
    value_text?: string;
  };
  partner: {
    name: string;
    address?: string;
  };
  redemptionData?: {
    redeemed_at: string;
    id: string;
  };
}

export const OfferRedemptionConfirmation: React.FC<OfferRedemptionConfirmationProps> = ({ 
  isOpen, 
  onClose, 
  offer, 
  partner, 
  redemptionData 
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const currentDateTime = redemptionData?.redeemed_at || new Date().toISOString();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm mx-auto p-0 bg-background border-0 shadow-2xl rounded-3xl overflow-hidden">
        <div className="relative">
          {/* Header with close button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Success header */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-emerald-800 mb-1">
              Offer used successfully!
            </h2>
            <p className="text-sm text-emerald-600">
              Show this screen to the merchant
            </p>
          </div>

          {/* Redemption details */}
          <div className="p-6 bg-white">
            {/* User info */}
            <div className="bg-emerald-50 rounded-2xl p-4 mb-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">
                  {user?.email || t('common.loading')}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-2">
                {offer.title}
              </h3>
              
              <p className="text-sm font-medium text-gray-700 mb-2">
                {partner.name}
              </p>
              
              {partner.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    {partner.address}
                  </span>
                </div>
              )}
            </div>

            {/* Date and time */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentDateTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentDateTime)}</span>
              </div>
            </div>

            {/* Validation status */}
            <div className="text-center mb-6">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white px-6 py-2 text-sm font-bold rounded-full">
                ✓ OFFER VALIDATED
              </Badge>
            </div>

            {/* Close button */}
            <Button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-2xl shadow-lg transition-all duration-200"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};