import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserPass() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["user-pass", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("passes")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  return {
    pass: data,
    hasPass: !!data,
    loading: isLoading,
  };
}
