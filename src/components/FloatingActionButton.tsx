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
    <Button
      variant="fab"
      onClick={handleQRScan}
      className="shadow-lg"
      aria-label="Scanner QR code partenaire"
    >
      <QrCode className="w-6 h-6" />
    </Button>
  );
}