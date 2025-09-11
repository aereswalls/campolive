'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, Mail, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function InviteCollaborator({ 
  tournamentId,
  existingCollaborators = []
}: { 
  tournamentId: string
  existingCollaborators: any[]
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      // Verifica se l'utente esiste
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email.trim())
        .single()
      
      if (!users) {
        setError('Utente non trovato. Assicurati che sia registrato su CampoLive.')
        setLoading(false)
        return
      }
      
      // Verifica se è già collaboratore
      const existing = existingCollaborators.find(c => c.user_id === users.id)
      if (existing) {
        setError('Questo utente è già un collaboratore del torneo.')
        setLoading(false)
        return
      }
      
      // Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser()
      
      // Invia invito
      const { error: inviteError } = await supabase
        .from('tournament_collaborators')
        .insert({
          tournament_id: tournamentId,
          user_id: users.id,
          invited_by: user?.id,
          role: 'co_organizer',
          status: 'accepted' // Auto-accetta per semplicità
        })
      
      if (inviteError) throw inviteError
      
      setSuccess(true)
      setEmail('')
      router.refresh()
      
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'invito')
    } finally {
      setLoading(false)
    }
  }
  
  const handleRemove = async (collaboratorId: string) => {
    if (!confirm('Rimuovere questo co-organizzatore?')) return
    
    try {
      await supabase
        .from('tournament_collaborators')
        .delete()
        .eq('id', collaboratorId)
      
      router.refresh()
    } catch (err) {
      console.error('Errore rimozione:', err)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <UserPlus className="w-5 h-5 text-gray-600" />
        <span>Co-organizzatori</span>
      </h3>
      
      <form onSubmit={handleInvite} className="mb-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@esempio.it"
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>{loading ? 'Invio...' : 'Invita'}</span>
          </button>
        </div>
        
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
        
        {success && (
          <p className="text-green-600 text-sm mt-2">Co-organizzatore aggiunto con successo!</p>
        )}
      </form>
      
      {existingCollaborators.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-2">Co-organizzatori attuali:</p>
          {existingCollaborators.map((collab) => (
            <div key={collab.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{collab.user_profiles?.email}</span>
              <button
                onClick={() => handleRemove(collab.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-4">
        I co-organizzatori possono gestire squadre, partite e risultati del torneo.
      </p>
    </div>
  )
}
