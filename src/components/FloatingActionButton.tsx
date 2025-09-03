import { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRScanner } from "@/components/QRScanner";
import { PartnerOffersModal } from "@/components/PartnerOffersModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface UserPass {
  id: string;
  status: string;
  expires_at: string;
}

export function FloatingActionButton() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedPartner, setScannedPartner] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userPass, setUserPass] = useState<UserPass | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserPass(session.user.id);
        } else {
          setUserPass(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserPass(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserPass = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('passes')
        .select('id, status, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user pass:', error);
        return;
      }

      setUserPass(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Don't render if user is not authenticated or doesn't have active pass
  const hasActivePass = !!userPass && new Date(userPass.expires_at) > new Date();
  if (!user || !hasActivePass) {
    return null;
  }

  const handleQRScan = () => {
    setShowScanner(true);
  };

  const handleScanSuccess = (partnerData: any) => {
    setScannedPartner(partnerData);
  };

  return (
    <>
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          variant="fab"
          onClick={handleQRScan}
          className="relative w-16 h-16 rounded-full shadow-bali-4"
          aria-label={t('action.scan_qr')}
          style={{ position: 'static' }}
        >
          <QrCode className="w-7 h-7" />
        </Button>
      </div>

      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      <PartnerOffersModal
        isOpen={!!scannedPartner}
        onClose={() => setScannedPartner(null)}
        partner={scannedPartner}
      />
    </>
  );
}