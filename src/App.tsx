import { useState } from 'react'
import type { Page } from '@/types'
import BottomNav from '@/components/BottomNav'
import HomePage from '@/pages/HomePage'
import ProfilePage from '@/pages/ProfilePage'
import RoutesPage from '@/pages/RoutesPage'
import MapPage from '@/pages/MapPage'
import { routeNumbers } from '@/data/transitData'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [hasVisitedMap, setHasVisitedMap] = useState(false)
  const [selectedMapRoutes, setSelectedMapRoutes] = useState<string[]>(routeNumbers)

  const openMap = (nextRoutes?: string[]) => {
    if (nextRoutes) {
      setSelectedMapRoutes(nextRoutes)
    }

    setHasVisitedMap(true)
    setPage('map')
  }

  const handlePageChange = (nextPage: Page) => {
    if (nextPage === 'map') {
      openMap()
      return
    }

    setPage(nextPage)
  }

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-[#d9d9d9]">
      <div className="relative flex h-full w-full max-w-[390px] flex-col bg-[#d9d9d9]">
        <div className="flex-1 overflow-y-auto overscroll-y-contain" style={{ paddingBottom: '72px' }}>
          {page === 'home' && (
            <HomePage
              onRoutes={() => setPage('routes')}
              onMap={openMap}
            />
          )}
          {page === 'routes' && <RoutesPage onOpenRouteMap={(routeNumber) => openMap([routeNumber])} />}
          {page === 'profile' && <ProfilePage />}
          {hasVisitedMap && (
            <div className={page === 'map' ? 'block h-full' : 'hidden'}>
              <MapPage
                isActive={page === 'map'}
                selectedRouteNumbers={selectedMapRoutes}
                onSelectedRouteNumbersChange={setSelectedMapRoutes}
              />
            </div>
          )}
        </div>
        <BottomNav current={page} onChange={handlePageChange} />
      </div>
    </div>
  )
}
