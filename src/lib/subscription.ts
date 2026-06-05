import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface SubscriptionStatus {
  isPro: boolean;
  plan: string | null;
  status: string | null;
  expiresAt: string | null;
}

/**
 * Source of truth for PRO access — SERVER SIDE.
 * Rule: status = 'active' AND expires_at > now()
 *
 * Never trust localStorage, query params, or CSS state for PRO access.
 */
export async function getSubscriptionStatus(
  userId?: string
): Promise<SubscriptionStatus> {
  const supabase = createServerSupabaseClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    uid = user?.id;
  }

  const inactive: SubscriptionStatus = {
    isPro: false,
    plan: null,
    status: null,
    expiresAt: null,
  };

  if (!uid) return inactive;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan, status, expires_at")
    .eq("user_id", uid)
    .eq("status", "active")
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return inactive;

  const notExpired =
    data.expires_at && new Date(data.expires_at).getTime() > Date.now();

  if (!notExpired) {
    return {
      isPro: false,
      plan: data.plan,
      status: "expired",
      expiresAt: data.expires_at,
    };
  }

  return {
    isPro: true,
    plan: data.plan,
    status: data.status,
    expiresAt: data.expires_at,
  };
}
