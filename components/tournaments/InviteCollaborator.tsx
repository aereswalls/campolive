'use client'

import { useState } from 'react'
import { UserPlus, Mail, Loader2, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InviteCollaboratorProps {
  tournamentId: string
  existingCollaborators?: any[]
}

export default function InviteCollaborator({ 
  tournamentId, 
  existingCollaborators = [] 
}: InviteCollaboratorProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('co_organizer')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)
  const router = useRouter()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/collaborators/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          role 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'invito')
      }

      setMessage({
        type: 'success',
        text: data.message || 'Invito inviato con successo!'
      })
      setEmail('')
      
      setTimeout(() => {
        router.refresh()
        setMessage(null)
      }, 2000)
      
    } catch (error: any) {
      console.error('Errore invito:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Errore durante l\'invito. Riprova.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold mb-4 flex items-center space-x-2">
        <UserPlus className="w-5 h-5" />
        <span>Invita Co-organizzatore</span>
      </h3>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email del co-organizzatore
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="esempio@email.com"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            L'utente potrà accedere al torneo dopo essersi registrato con questa email
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ruolo</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            disabled={isLoading}
          >
            <option value="co_organizer">Co-organizzatore</option>
            <option value="assistant">Assistente</option>
          </select>
        </div>

        {message && (
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' :
            message.type === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {message.type === 'success' && <Check className="w-4 h-4" />}
            {message.type === 'error' && <X className="w-4 h-4" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Invio in corso...</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              <span>Invia Invito</span>
            </>
          )}
        </button>
      </form>

      {existingCollaborators && existingCollaborators.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium mb-3">Co-organizzatori attuali</h4>
          <div className="space-y-2">
            {existingCollaborators.map((collab) => (
              <div key={collab.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  {collab.invited_email || collab.user_profiles?.email || 'Email non disponibile'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  collab.status === 'accepted' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {collab.status === 'accepted' ? 'Attivo' : 'In attesa'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
