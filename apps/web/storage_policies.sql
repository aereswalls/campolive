-- Policies per il bucket 'videos'
-- Solo utenti autenticati possono caricare
CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND 
    auth.role() = 'authenticated'
);

-- Solo il proprietario può vedere i propri video
CREATE POLICY "Users can view own videos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Solo il proprietario può eliminare
CREATE POLICY "Users can delete own videos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies per 'thumbnails' (pubblico)
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'thumbnails' AND 
    auth.role() = 'authenticated'
);

-- Policies per 'highlights'
CREATE POLICY "Authenticated users can upload highlights" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'highlights' AND 
    auth.role() = 'authenticated'
);

CREATE POLICY "Users can view own highlights" ON storage.objects
FOR SELECT USING (
    bucket_id = 'highlights' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies per 'team-logos' (pubblico)
CREATE POLICY "Anyone can view team logos" ON storage.objects
FOR SELECT USING (bucket_id = 'team-logos');

CREATE POLICY "Team managers can upload logos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'team-logos' AND 
    auth.role() = 'authenticated'
);

-- Policies per 'profile-avatars' (pubblico)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'profile-avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);
