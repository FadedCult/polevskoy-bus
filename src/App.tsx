import { useState } from 'react'
import type { Page } from '@/types'
import BottomNav from '@/components/BottomNav'
import HomePage from '@/pages/HomePage'
import ProfilePage from '@/pages/ProfilePage'
import RoutesPage from '@/pages/RoutesPage'
import MapPage from '@/pages/MapPage'

export default function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <div className="min-h-screen bg-[#d9d9d9] flex justify-center">
      <div
        className="w-full bg-[#d9d9d9] relative flex flex-col"
        style={{ maxWidth: '390px', minHeight: '100dvh' }}
      >
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '72px' }}>
          {page === 'home' && (
            <HomePage
              onRoutes={() => setPage('routes')}
              onMap={() => setPage('map')}
            />
          )}
          {page === 'routes' && <RoutesPage />}
          {page === 'map' && <MapPage />}
          {page === 'profile' && <ProfilePage />}
        </div>
        <BottomNav current={page} onChange={setPage} />
      </div>
    </div>
  )
}
