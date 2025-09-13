'use client'

import { useCredits } from '@/hooks/useCredits'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function CreditsDisplay({ userId }: { userId: string }) {
  const { credits, loading } = useCredits(userId)

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
    )
  }

  return (
    <Link 
      href="/credits"
      className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition"
    >
      <CreditCard className="w-4 h-4" />
      <span className="font-semibold">{credits}</span>
      <span className="text-sm">crediti</span>
    </Link>
  )
}
