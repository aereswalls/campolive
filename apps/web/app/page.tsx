import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-green-600">
            🏟️ CampoLive
          </div>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Accedi
            </Link>
            <Link 
              href="/register" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Inizia Gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Trasmetti le tue partite in diretta
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          La piattaforma definitiva per registrare, trasmettere e condividere 
          eventi sportivi amatoriali. Dai vita alle emozioni del campo!
        </p>
        <div className="space-x-4">
          <Link 
            href="/register" 
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700"
          >
            Prova Gratuita
          </Link>
          <Link 
            href="#features" 
            className="inline-block border-2 border-gray-300 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400"
          >
            Scopri di più
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tutto quello che serve per il tuo sport
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-semibold mb-2">Registrazione HD</h3>
            <p className="text-gray-600">
              Registra le partite in alta definizione direttamente dal tuo smartphone
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📡</div>
            <h3 className="text-xl font-semibold mb-2">Live Streaming</h3>
            <p className="text-gray-600">
              Trasmetti in diretta per amici e familiari ovunque si trovino
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">Highlights Automatici</h3>
            <p className="text-gray-600">
              L'AI crea automaticamente i momenti salienti della partita
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-4">
          Prezzi semplici e trasparenti
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Paga solo per quello che usi con il sistema a crediti
        </p>
        <div className="text-center">
          <Link 
            href="/register" 
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700"
          >
            Inizia con 10 crediti gratuiti
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>&copy; 2025 CampoLive. Tutti i diritti riservati.</p>
      </footer>
    </div>
  )
}