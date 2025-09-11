import { Users, Crown, UserCheck } from 'lucide-react'

interface Collaborator {
  id: string
  role: string
  status: string
  user_profiles: {
    email: string
    full_name: string
  }
}

export default function CollaboratorsList({ 
  collaborators,
  ownerId,
  ownerEmail
}: { 
  collaborators: Collaborator[]
  ownerId: string
  ownerEmail?: string
}) {
  if (!collaborators || collaborators.length === 0) {
    return null
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold">Organizzatori</h2>
      </div>
      
      <div className="space-y-2">
        {/* Owner */}
        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium">{ownerEmail || 'Organizzatore principale'}</span>
          </div>
          <span className="text-xs text-yellow-600">Owner</span>
        </div>
        
        {/* Co-organizzatori */}
        {collaborators.map((collab) => (
          <div key={collab.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm">
                {collab.user_profiles?.full_name || collab.user_profiles?.email}
              </span>
            </div>
            <span className="text-xs text-gray-600">Co-organizzatore</span>
          </div>
        ))}
      </div>
    </div>
  )
}
