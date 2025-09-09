import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'

export default function TestVideoPage() {
  // URL di test - puoi usare un video pubblico per test
  const testVideoUrl = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"
  const testThumbnail = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.jpg"
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              🎬 Test Video Player
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
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Test Video Player Component</h2>
          <p className="text-gray-600 mb-6">
            Questo è un test del componente VideoPlayer con un video di esempio.
          </p>
          
          <VideoPlayer
            videoUrl={testVideoUrl}
            thumbnailUrl={testThumbnail}
            title="Test Video - Big Buck Bunny"
          />
          
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Features del Player:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Play/Pause</li>
              <li>✓ Skip avanti/indietro 10 secondi</li>
              <li>✓ Controllo volume</li>
              <li>✓ Progress bar con seek</li>
              <li>✓ Fullscreen</li>
              <li>✓ Download video</li>
              <li>✓ Tempo corrente/durata</li>
              <li>✓ Thumbnail preview</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
