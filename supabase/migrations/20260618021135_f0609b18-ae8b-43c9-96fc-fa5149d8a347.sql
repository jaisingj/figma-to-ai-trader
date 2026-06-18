
CREATE POLICY "Admins can upload kb books" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kb-books' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read kb books" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'kb-books' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete kb books" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'kb-books' AND public.has_role(auth.uid(), 'admin'));
