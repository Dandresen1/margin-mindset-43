-- Create storage bucket for product uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('product_uploads', 'product_uploads', false);

-- Create RLS policies for product uploads bucket
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'product_uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'product_uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'product_uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'product_uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);