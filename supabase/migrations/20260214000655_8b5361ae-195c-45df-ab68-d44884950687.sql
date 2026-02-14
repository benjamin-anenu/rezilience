
INSERT INTO storage.buckets (id, name, public) VALUES ('report-assets', 'report-assets', true);

CREATE POLICY "Public read access for report assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-assets');

CREATE POLICY "Service role can upload report assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-assets');
