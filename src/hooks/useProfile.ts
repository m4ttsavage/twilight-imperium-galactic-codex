import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDisplayName(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      setDisplayName(data?.display_name ?? null);
      setLoading(false);
    };

    fetch();
  }, [user]);

  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!user) return false;
      const trimmed = name.trim();
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: trimmed || null })
        .eq("id", user.id);

      if (!error) {
        setDisplayName(trimmed || null);
        return true;
      }
      return false;
    },
    [user],
  );

  return { displayName, loading, updateDisplayName };
}
