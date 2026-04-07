-- Lets the client show "create an account" vs "wrong password" style UX.
-- Note: allows email enumeration; grant only if that tradeoff is acceptable.

CREATE OR REPLACE FUNCTION public.auth_user_exists_by_email(p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE lower(trim(auth.users.email)) = lower(trim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.auth_user_exists_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_exists_by_email(text) TO anon, authenticated;
