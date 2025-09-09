'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface TeamFormProps {
  userId: string
  initialData?: any
  isEdit?: boolean
}

export default function TeamForm({ userId, initialData, isEdit = false }: TeamFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    sport_type: initialData?.sport_type || 'calcio',
    level: initialData?.level || 'amatoriale',
    city: initialData?.city || '',
    province: initialData?.province || '',
    region: initialData?.region || '',
    founded_year: initialData?.founded_year || new Date().getFullYear(),
    primary_color: initialData?.primary_color || '#16a34a',
    secondary_color: initialData?.secondary_color || '#ffffff'
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáäâ]/g, 'a')
      .replace(/[èéëê]/g, 'e')
      .replace(/[ìíïî]/g, 'i')
      .replace(/[òóöô]/g, 'o')
      .replace(/[ùúüû]/g, 'u')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      if (isEdit) {
        const { error: updateError } = await supabase
          .from('teams')
          .update(formData)
          .eq('id', initialData.id)
        
        if (updateError) throw updateError
      } else {
        // Crea il team
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .insert({
            ...formData,
            created_by: userId
          })
          .select()
          .single()
        
        if (teamError) throw teamError
        
        // Aggiungi il creatore come manager
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: team.id,
            user_id: userId,
            role: 'manager',
            is_active: true
          })
        
        if (memberError) throw memberError
        
        router.push(`/teams/${team.id}`)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Nome Team *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. ASD Sporting Club"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Slug URL *
          </label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="asd-sporting-club"
            pattern="[a-z0-9-]+"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL: /teams/{formData.slug || 'nome-team'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Sport
          </label>
          <select
            value={formData.sport_type}
            onChange={(e) => setFormData({...formData, sport_type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="calcio">Calcio</option>
            <option value="calcetto">Calcetto</option>
            <option value="basket">Basket</option>
            <option value="volley">Pallavolo</option>
            <option value="tennis">Tennis</option>
            <option value="padel">Padel</option>
            <option value="rugby">Rugby</option>
            <option value="altro">Altro</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Livello
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({...formData, level: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="amatoriale">Amatoriale</option>
            <option value="giovanile">Giovanile</option>
            <option value="semipro">Semi-professionistico</option>
            <option value="professionistico">Professionistico</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Città
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Milano"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Anno di Fondazione
          </label>
          <input
            type="number"
            value={formData.founded_year}
            onChange={(e) => setFormData({...formData, founded_year: parseInt(e.target.value)})}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Colore Primario
          </label>
          <input
            type="color"
            value={formData.primary_color}
            onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
            className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Colore Secondario
          </label>
          <input
            type="color"
            value={formData.secondary_color}
            onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
            className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Descrizione
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={4}
            placeholder="Descrivi il tuo team..."
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Salvataggio...' : (isEdit ? 'Salva Modifiche' : 'Crea Team')}
        </button>
      </div>
    </form>
  )
}
