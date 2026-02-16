
-- Drop the existing broken restrictive policy
DROP POLICY IF EXISTS "Admin users can read own entry" ON public.admin_users;

-- Create a proper permissive policy requiring authentication
CREATE POLICY "Authenticated admins can read own entry"
ON public.admin_users
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'::text));
