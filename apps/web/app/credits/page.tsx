import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CreditPackages from '@/components/CreditPackages'

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
    .eq('is_active', true)
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
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              💰 Acquista Crediti
            </h1>
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Saldo Attuale */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Crediti Disponibili</h2>
              <p className="text-gray-600">1 credito = 1 diretta completa con highlights</p>
            </div>
            <div className="text-4xl font-bold text-green-600">
              {userCredits?.balance || 0}
            </div>
          </div>
        </div>
        
        {/* Pacchetti */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Scegli un Pacchetto</h2>
          <CreditPackages packages={packages || []} userId={user.id} />
        </div>
        
        {/* Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Come funziona</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 1 credito = 1 diretta streaming completa</li>
              <li>• Highlights degli ultimi 30 secondi inclusi</li>
              <li>• I crediti non scadono mai</li>
              <li>• Più acquisti, più risparmi!</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">🔒 Pagamento Sicuro</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Pagamenti processati da Stripe/PayPal</li>
              <li>• Certificazione PCI DSS</li>
              <li>• Crittografia SSL/TLS</li>
              <li>• Nessun dato salvato sui nostri server</li>
            </ul>
          </div>
        </div>
        
        {/* Storico Acquisti */}
        {transactions && transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Ultimi Acquisti</h3>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{Math.abs(transaction.amount)} crediti</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {transaction.metadata?.price ? `€${transaction.metadata.price}` : '-'}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.metadata?.method || 'Web'}</p>
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
