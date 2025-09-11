'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function Navbar({ userEmail }: { userEmail?: string | null }) {
  const router = useRouter()
  const supabase = createClient()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-green-600">
              🏟️ CampoLive
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900">
                Eventi
              </Link>
              <Link href="/teams" className="text-gray-600 hover:text-gray-900">
                Team
              </Link>
              <Link href="/tournaments" className="text-gray-600 hover:text-gray-900">
                Tornei
              </Link>
              <Link href="/credits" className="text-gray-600 hover:text-gray-900">
                Crediti
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Esci
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
