"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ClientSubscriptionStatus {
  loading: boolean;
  isPro: boolean;
  isAuthenticated: boolean;
  plan: string | null;
  expiresAt: string | null;
}

/**
 * Client-side hook to read PRO status.
 * NOTE: This is for UI display only. Actual access gating for sensitive
 * data must be enforced server-side (see lib/subscription.ts).
 */
export function useSubscription(): ClientSubscriptionStatus {
  const [state, setState] = useState<ClientSubscriptionStatus>({
    loading: true,
    isPro: false,
    isAuthenticated: false,
    plan: null,
    expiresAt: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled)
          setState({
            loading: false,
            isPro: false,
            isAuthenticated: false,
            plan: null,
            expiresAt: null,
          });
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const isPro = Boolean(
        data?.expires_at && new Date(data.expires_at).getTime() > Date.now()
      );

      if (!cancelled)
        setState({
          loading: false,
          isPro,
          isAuthenticated: true,
          plan: data?.plan ?? null,
          expiresAt: data?.expires_at ?? null,
        });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
