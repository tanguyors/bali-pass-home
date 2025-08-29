import { Button } from "@/components/ui/button";

export function FinalCTABanner() {
  return (
    <div className="mt-8 mx-4 mb-8">
      <div className="gradient-tropical rounded-3xl p-6 text-center text-white shadow-bali-4">
        <h2 className="text-xl font-bold mb-2">
          Prêt à profiter de Bali ?
        </h2>
        <p className="text-sm opacity-90 mb-4">
          Découvre tous les avantages exclusifs dès maintenant
        </p>
        
        <Button variant="pillWhite" className="w-full h-12">
          Obtenir le Bali'Pass
        </Button>
      </div>
    </div>
  );
}