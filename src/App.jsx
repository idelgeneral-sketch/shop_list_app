import { useEffect, useState } from 'react'
import { SettingsProvider } from './context/SettingsContext'
import { useStores } from './hooks/useStores'
import { useActiveItemCounts } from './hooks/useActiveItemCounts'
import { StoresScreen } from './components/StoresScreen'
import { StoreScreen } from './components/StoreScreen'

function AppContent() {
  const { stores, addStore, renameStore, deleteStore, reorderStores } = useStores()
  const counts = useActiveItemCounts()
  const [openStoreId, setOpenStoreId] = useState(null)

  const openStore = stores.find((s) => s.id === openStoreId) || null

  // Hardware/browser back button: while a store is open, back should close
  // it and return to the stores list. Only when already on the stores list
  // should back fall through to the browser's default behavior (exit / leave
  // the app), so we don't push any history entry for that screen.
  useEffect(() => {
    function handlePopState() {
      setOpenStoreId(null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function openStoreScreen(store) {
    window.history.pushState({ screen: 'store', storeId: store.id }, '')
    setOpenStoreId(store.id)
  }

  function closeStoreScreen() {
    // Goes through history.back() (rather than setting state directly) so
    // the pushed entry is consumed and the hardware back button stays in sync.
    window.history.back()
  }

  return (
    <div className="app-shell">
      {openStore ? (
        <StoreScreen store={openStore} onBack={closeStoreScreen} />
      ) : (
        <StoresScreen
          stores={stores}
          counts={counts}
          addStore={addStore}
          renameStore={renameStore}
          deleteStore={deleteStore}
          reorderStores={reorderStores}
          onOpenStore={openStoreScreen}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  )
}
