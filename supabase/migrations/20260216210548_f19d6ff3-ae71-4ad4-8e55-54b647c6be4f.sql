-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload team images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their team images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their team images" ON storage.objects;

-- Create ownership-scoped policies
CREATE POLICY "Profile owners can upload team images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.claimed_profiles 
    WHERE x_user_id = (auth.jwt() ->> 'sub')
  )
);

CREATE POLICY "Profile owners can update team images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'team-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.claimed_profiles 
    WHERE x_user_id = (auth.jwt() ->> 'sub')
  )
);

CREATE POLICY "Profile owners can delete team images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.claimed_profiles 
    WHERE x_user_id = (auth.jwt() ->> 'sub')
  )
);