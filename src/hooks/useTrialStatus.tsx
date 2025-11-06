import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTrialStatus() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["trial-status", user?.id],
    queryFn: async () => {
      if (!user) return { isTrialExpired: false, trialPass: null };

      // Chercher un pass avec un qr_token qui commence par TRIAL_
      const { data: passes, error } = await supabase
        .from("passes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !passes || passes.length === 0) {
        return { isTrialExpired: false, trialPass: null };
      }

      // Trouver le trial pass (qr_token commence par TRIAL_)
      const trialPass = passes.find((pass) => pass.qr_token?.startsWith("TRIAL_"));

      if (!trialPass) {
        return { isTrialExpired: false, trialPass: null };
      }

      // Vérifier si le trial pass a déjà été utilisé
      const { data: redemptions } = await supabase
        .from("redemptions")
        .select("id")
        .eq("pass_id", trialPass.id)
        .limit(1);

      // Le trial est expiré s'il a déjà une redemption
      const isExpired = redemptions && redemptions.length > 0;

      return {
        isTrialExpired: isExpired,
        trialPass: trialPass,
      };
    },
    enabled: !!user,
  });

  return {
    isTrialExpired: data?.isTrialExpired || false,
    trialPass: data?.trialPass || null,
    loading: isLoading,
  };
}
