'use client'

import Link from 'next/link'
import { Users, MapPin, Calendar, Shield } from 'lucide-react'

interface Team {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  sport_type: string
  level: string
  city?: string
  founded_year?: number
  is_verified: boolean
  member_count?: number
  role?: string
}

interface TeamListProps {
  teams: Team[]
  userTeams?: boolean
}

export default function TeamList({ teams, userTeams = false }: TeamListProps) {
  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Users className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {userTeams ? 'Non fai parte di nessun team' : 'Nessun team trovato'}
        </h3>
        <p className="text-gray-600 mb-4">
          {userTeams 
            ? 'Crea il tuo primo team o unisciti a uno esistente!'
            : 'Sii il primo a creare un team!'}
        </p>
        <Link 
          href="/teams/new"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Crea un Team
        </Link>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <Link 
          key={team.id}
          href={`/teams/${team.id}`}
          className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          {team.logo_url ? (
            <div className="h-32 bg-gray-100 flex items-center justify-center">
              <img 
                src={team.logo_url} 
                alt={team.name}
                className="h-24 w-24 object-contain"
              />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Users className="w-16 h-16 text-white" />
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">{team.name}</h3>
              {team.is_verified && (
                <Shield className="w-5 h-5 text-blue-500" />
              )}
            </div>
            
            {team.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {team.description}
              </p>
            )}
            
            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium mr-2">Sport:</span>
                {team.sport_type} - {team.level}
              </div>
              
              {team.city && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {team.city}
                </div>
              )}
              
              {team.founded_year && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Fondato nel {team.founded_year}
                </div>
              )}
              
              {team.member_count !== undefined && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {team.member_count} membri
                </div>
              )}
              
              {team.role && (
                <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {team.role}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
