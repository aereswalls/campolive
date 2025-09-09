import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TestUpload from '@/components/TestUpload'
import Link from 'next/link'

export default async function TestUploadPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              🧪 Test Upload Storage
            </h1>
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Test Supabase Storage</h2>
          <p className="text-gray-600 mb-6">
            Usa questa pagina per testare che i bucket Storage siano configurati correttamente.
          </p>
          
          <TestUpload userId={user.id} />
          
          <div className="mt-8 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Bucket Configurati:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ videos - Video dirette (privato, 2GB)</li>
              <li>✓ thumbnails - Anteprime (pubblico, 5MB)</li>
              <li>✓ highlights - Clip 30 sec (privato, 500MB)</li>
              <li>✓ team-logos - Loghi squadre (pubblico, 2MB)</li>
              <li>✓ profile-avatars - Foto profilo (pubblico, 2MB)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
