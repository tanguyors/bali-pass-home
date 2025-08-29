import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function AuthButtons() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleSignUp = () => {
    navigate('/auth');
  };

  return (
    <div className="mx-4 mt-6 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={handleSignIn}
          className="h-12"
        >
          Se connecter
        </Button>
        
        <Button 
          variant="default" 
          onClick={handleSignUp}
          className="h-12"
        >
          Créer un compte
        </Button>
      </div>
    </div>
  );
}