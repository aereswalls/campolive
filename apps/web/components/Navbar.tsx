'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, CreditCard, User, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  userEmail?: string
}

export default function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const isActive = (path: string) => pathname === path
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/events', label: 'Eventi', icon: Calendar },
    { href: '/teams', label: 'Team', icon: Users },
    { href: '/credits', label: 'Crediti', icon: CreditCard },
  ]
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🏟️</span>
            <span className="text-xl font-bold text-green-600">CampoLive</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    isActive(item.href)
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:block">
              {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Esci</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden border-t py-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                    isActive(item.href)
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}
