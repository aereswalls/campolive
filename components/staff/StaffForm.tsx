'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

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
]

export default function StaffForm({ teamId }: { teamId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'allenatore',
    email: '',
    phone: '',
    date_of_birth: '',
    qualifications: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase
      .from('team_staff')
      .insert({
        ...formData,
        team_id: teamId
      })
    
    if (!error) {
      setFormData({
        first_name: '',
        last_name: '',
        role: 'allenatore',
        email: '',
        phone: '',
        date_of_birth: '',
        qualifications: ''
      })
      router.refresh()
    }
    
    setLoading(false)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cognome *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ruolo *
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Qualifiche
        </label>
        <textarea
          value={formData.qualifications}
          onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="es. Patentino UEFA B, Laurea in Scienze Motorie..."
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Aggiunta...' : 'Aggiungi Staff'}
      </button>
    </form>
  )
}
