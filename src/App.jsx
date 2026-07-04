import { useState } from 'react'
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

  return (
    <div className="app-shell">
      {openStore ? (
        <StoreScreen store={openStore} onBack={() => setOpenStoreId(null)} />
      ) : (
        <StoresScreen
          stores={stores}
          counts={counts}
          addStore={addStore}
          renameStore={renameStore}
          deleteStore={deleteStore}
          reorderStores={reorderStores}
          onOpenStore={(store) => setOpenStoreId(store.id)}
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
