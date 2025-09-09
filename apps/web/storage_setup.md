# Configurazione Bucket Supabase Storage

## 1. BUCKET: videos
- Nome: videos
- Public: NO (privato)
- File size limit: 2GB
- Allowed MIME types: video/mp4, video/webm, video/quicktime
- Uso: Video dirette complete

## 2. BUCKET: thumbnails  
- Nome: thumbnails
- Public: YES (pubblico)
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- Uso: Anteprime video

## 3. BUCKET: highlights
- Nome: highlights
- Public: NO (privato)
- File size limit: 500MB
- Allowed MIME types: video/mp4
- Uso: Clip 30 secondi

## 4. BUCKET: team-logos
- Nome: team-logos
- Public: YES (pubblico)
- File size limit: 2MB
- Allowed MIME types: image/jpeg, image/png, image/svg+xml
- Uso: Loghi squadre

## 5. BUCKET: profile-avatars
- Nome: profile-avatars
- Public: YES (pubblico)
- File size limit: 2MB
- Allowed MIME types: image/jpeg, image/png
- Uso: Foto profilo utenti
