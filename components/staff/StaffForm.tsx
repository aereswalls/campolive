'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Valori ESATTI dall'ENUM staff_role nel database
const STAFF_ROLES = [
  { value: 'allenatore', label: 'Allenatore' },
  { value: 'vice_allenatore', label: 'Vice Allenatore' },
  { value: 'preparatore_atletico', label: 'Preparatore Atletico' },
  { value: 'preparatore_portieri', label: 'Preparatore Portieri' },
  { value: 'medico', label: 'Medico' },
  { value: 'fisioterapista', label: 'Fisioterapista' },
  { value: 'massaggiatore', label: 'Massaggiatore' },
  { value: 'dirigente', label: 'Dirigente' },
  { value: 'team_manager', label: 'Team Manager' },
  { value: 'magazziniere', label: 'Magazziniere' }
]

export default function StaffForm({ teamId }: { teamId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'allenatore',
    email: '',
    phone: '',
    date_of_birth: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const staffData = {
        team_id: teamId,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        is_active: true
      }
      
      const { data, error } = await supabase
        .from('team_staff')
        .insert(staffData)
        .select()
        .single()
      
      if (error) throw error
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        role: 'allenatore',
        email: '',
        phone: '',
        date_of_birth: ''
      })
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      router.refresh()
      
    } catch (err: any) {
      console.error('Error creating staff:', err)
      setError(err.message || 'Errore durante l\'aggiunta del membro dello staff')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          Membro dello staff aggiunto con successo!
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cognome *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Ruolo *
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
          disabled={loading}
          required
        >
          {STAFF_ROLES.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email (opzionale)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Telefono (opzionale)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Aggiunta in corso...' : 'Aggiungi Staff'}
      </button>
    </form>
  )
}
