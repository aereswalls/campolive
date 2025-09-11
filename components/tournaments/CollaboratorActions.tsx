'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export default function CollaboratorActions({ 
  collaboratorId, 
  tournamentId,
  isPending = false
}: { 
  collaboratorId: string
  tournamentId: string
  isPending?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const handleRemove = async () => {
    const message = isPending 
      ? 'Vuoi annullare questo invito?' 
      : 'Vuoi rimuovere questo co-organizzatore?'
    
    if (!confirm(message)) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/collaborators/${collaboratorId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Errore durante la rimozione')
      }
    } catch (error) {
      alert('Errore durante la rimozione')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
      title={isPending ? 'Annulla invito' : 'Rimuovi co-organizzatore'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  )
}
