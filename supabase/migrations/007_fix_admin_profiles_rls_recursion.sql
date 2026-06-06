-- Fix P9 admin RLS recursion on profiles
-- Root cause: policy on profiles queried profiles again, causing infinite recursion.

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Keep self-profile access from 001 migration as the only profiles SELECT policy.
-- Admin dashboard already verifies current user's own profile role first,
-- then uses service role on the server for cross-user metrics.

-- Recreate payments admin policy through a SECURITY DEFINER helper to avoid
-- recursion and avoid querying profiles directly inside policies.
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
      AND role IN ('admin', 'super_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;

DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (public.is_admin_user(auth.uid()));
