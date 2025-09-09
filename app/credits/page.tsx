import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreditPackages from '@/components/CreditPackages'
import Navbar from '@/components/Navbar'
import { CreditCard, TrendingUp, Shield, Clock } from 'lucide-react'

export default async function CreditsPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Recupera crediti attuali
  const { data: userCredits } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()
  
  // Recupera pacchetti disponibili
  const { data: packages } = await supabase
    .from('credit_packages')
    .select('*')
    .order('sort_order')
  
  // Recupera storico acquisti
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .in('type', ['purchase_web', 'purchase_ios', 'purchase_android'])
    .order('created_at', { ascending: false })
    .limit(5)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acquista Crediti</h1>
          <p className="text-gray-600">Scegli il pacchetto perfetto per le tue esigenze</p>
        </div>
        
        {/* Saldo Attuale */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5" />
                <h2 className="text-lg font-medium">Crediti Disponibili</h2>
              </div>
              <p className="text-green-100 text-sm">
                1 credito = 1 diretta completa con highlights inclusi
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{userCredits?.balance || 0}</div>
              <div className="text-green-100 text-sm mt-1">crediti</div>
            </div>
          </div>
        </div>
        
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Risparmia di più</h3>
                <p className="text-sm text-gray-600">Fino al 50% di sconto</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pagamento sicuro</h3>
                <p className="text-sm text-gray-600">Stripe & PayPal</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nessuna scadenza</h3>
                <p className="text-sm text-gray-600">Usa quando vuoi</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pacchetti */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Scegli il tuo pacchetto</h2>
          <CreditPackages packages={packages || []} userId={user.id} />
        </div>
        
        {/* Storico Acquisti */}
        {transactions && transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Acquisti Recenti</h3>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{Math.abs(transaction.amount)} crediti</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {transaction.metadata?.price ? `€${transaction.metadata.price}` : '-'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.metadata?.method || 'Web'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
