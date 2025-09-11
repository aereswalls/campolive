'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function TeamForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport_type: 'calcio',
    city: '',
    province: '',
    primary_color: '#10B981',
    secondary_color: '#065F46'
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Crea il team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert(formData)
        .select()
        .single()
      
      if (teamError) throw teamError
      
      // Aggiungi l'utente come owner del team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: 'owner',
          is_active: true
        })
      
      if (memberError) throw memberError
      
      router.push('/teams')
    } catch (err: any) {
      console.error('Errore creazione team:', err)
      setError(err.message || 'Errore durante la creazione del team')
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome Team *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="es. ASD Napoli United"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrizione
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Descrivi il tuo team..."
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sport
          </label>
          <select
            value={formData.sport_type}
            onChange={(e) => setFormData({...formData, sport_type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="calcio">Calcio</option>
            <option value="calcio_5">Calcio a 5</option>
            <option value="basket">Basket</option>
            <option value="volley">Pallavolo</option>
            <option value="tennis">Tennis</option>
            <option value="padel">Padel</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Città *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Napoli"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provincia
          </label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => setFormData({...formData, province: e.target.value})}
            maxLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. NA"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colori Team
          </label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">Primario</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.secondary_color}
                onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">Secondario</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creazione...' : 'Crea Team'}
        </button>
      </div>
    </form>
  )
}
