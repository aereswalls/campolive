'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestUpload({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Devi selezionare un file')
      }
      
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      
      const supabase = createClient()
      
      // Upload to thumbnails bucket (pubblico per test)
      const { data, error } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(fileName)
      
      setUploadedUrl(publicUrl)
      console.log('File uploaded:', publicUrl)
      
    } catch (error: any) {
      alert('Errore upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test Upload Storage</h3>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="mb-4"
      />
      
      {uploading && <p>Caricamento...</p>}
      
      {uploadedUrl && (
        <div>
          <p className="text-sm text-green-600 mb-2">Upload completato!</p>
          <img 
            src={uploadedUrl} 
            alt="Upload test" 
            className="max-w-xs rounded"
          />
          <p className="text-xs mt-2 break-all">{uploadedUrl}</p>
        </div>
      )}
    </div>
  )
}
