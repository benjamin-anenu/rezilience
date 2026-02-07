-- Create storage bucket for team member images
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-images', 'team-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to team images
CREATE POLICY "Team images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-images');

-- Allow authenticated users to upload team images
CREATE POLICY "Authenticated users can upload team images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team-images');

-- Allow users to update their uploaded images
CREATE POLICY "Users can update their team images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'team-images');

-- Allow users to delete their team images
CREATE POLICY "Users can delete their team images"
ON storage.objects FOR DELETE
USING (bucket_id = 'team-images');