'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Funzione semplificata per creare uno slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[àáäâ]/g, 'a')
    .replace(/[èéëê]/g, 'e')
    .replace(/[ìíïî]/g, 'i')
    .replace(/[òóöô]/g, 'o')
    .replace(/[ùúüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^\w\s-]/g, '') // rimuovi caratteri speciali
    .replace(/\s+/g, '-')      // spazi diventano trattini
    .replace(/-+/g, '-')        // multipli trattini diventano uno
    .replace(/^-+/, '')         // rimuovi trattini iniziali
    .replace(/-+$/, '')         // rimuovi trattini finali
}

export default function TeamForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    province: '',
    region: '',
    sport_type: 'calcio',
    level: 'amatoriale',
    description: '',
    founded_year: new Date().getFullYear(),
    primary_color: '#10B981',
    secondary_color: '#065F46',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Devi essere autenticato')
      }
      
      // Crea uno slug basato sul nome (non deve essere unico)
      const slug = createSlug(formData.name) || 'team'
      
      const teamData = {
        ...formData,
        slug: slug,
        created_by: user.id
      }
      
      const { data, error } = await supabase
        .from('teams')
        .insert(teamData)
        .select()
        .single()
      
      if (error) throw error
      
      // Aggiungi l'utente come owner del team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: user.id,
          role: 'owner',
          position: 'Fondatore',
          joined_at: new Date().toISOString(),
          is_active: true
        })
      
      if (memberError) {
        console.error('Errore aggiunta membro:', memberError)
        // Non bloccare se fallisce l'aggiunta del membro
      }
      
      router.push(`/teams/${data.id}`)
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
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p>📌 Puoi creare squadre con lo stesso nome di squadre esistenti. Ogni organizzatore gestisce le proprie squadre indipendentemente.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Squadra *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Real Madrid, Juventus, Milano FC..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Puoi usare qualsiasi nome, anche se già esistente
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sport *
          </label>
          <select
            required
            value={formData.sport_type}
            onChange={(e) => setFormData({...formData, sport_type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="calcio">Calcio</option>
            <option value="calcio_5">Calcio a 5</option>
            <option value="calcio_7">Calcio a 7</option>
            <option value="calcio_8">Calcio a 8</option>
            <option value="basket">Basket</option>
            <option value="volley">Pallavolo</option>
            <option value="tennis">Tennis</option>
            <option value="padel">Padel</option>
          </select>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
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
            placeholder="es. Milano, Roma, Napoli..."
          />
        </div>
        
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
            placeholder="es. MI, RM, NA..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regione
          </label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData({...formData, region: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Lombardia, Lazio, Campania..."
          />
        </div>
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
          placeholder="Descrivi la tua squadra, la sua storia, i suoi obiettivi..."
        />
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Livello
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({...formData, level: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="amatoriale">Amatoriale</option>
            <option value="semi-pro">Semi-professionistico</option>
            <option value="professionistico">Professionistico</option>
            <option value="giovanile">Giovanile</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anno di Fondazione
          </label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.founded_year}
            onChange={(e) => setFormData({...formData, founded_year: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colori Sociali
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={formData.primary_color}
              onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
              className="w-1/2 h-10 border border-gray-300 rounded cursor-pointer"
              title="Colore primario"
            />
            <input
              type="color"
              value={formData.secondary_color}
              onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
              className="w-1/2 h-10 border border-gray-300 rounded cursor-pointer"
              title="Colore secondario"
            />
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
          {loading ? 'Creazione...' : 'Crea Squadra'}
        </button>
      </div>
    </form>
  )
}
