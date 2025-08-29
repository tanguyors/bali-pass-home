import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingActionButton() {
  const handleQRScan = () => {
    // This would open the device camera for QR scanning
    // In a real app, you'd use expo-camera or similar
    console.log("Opening QR scanner for partner codes");
    
    // For now, we'll show an alert
    alert("QR Scanner would open here to scan partner codes");
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
      <Button
        variant="fab"
        onClick={handleQRScan}
        className="relative w-16 h-16 rounded-full shadow-bali-4 animate-pulse-soft"
        aria-label="Scanner QR code partenaire"
        style={{ position: 'static' }}
      >
        <QrCode className="w-7 h-7" />
      </Button>
    </div>
  );
}