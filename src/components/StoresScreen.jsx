import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { StoreCard } from './StoreCard'
import { StoreCardSkeleton } from './Skeletons'
import { SettingsSheet } from './SettingsSheet'
import { ConfirmDialog } from './ConfirmDialog'
import { IconPlus, IconSettings } from './Icons'

export function StoresScreen({
  stores,
  loading,
  counts,
  addStore,
  renameStore,
  deleteStore,
  reorderStores,
  onOpenStore,
}) {
  const { settings } = useSettings()

  const [adding, setAdding] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const [menuStore, setMenuStore] = useState(null) // long-press action menu
  const [renamingStore, setRenamingStore] = useState(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [deletingStore, setDeletingStore] = useState(null)

  const [draggingId, setDraggingId] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)

  function startAdd() {
    setDraftName('')
    setAdding(true)
  }

  function commitAdd() {
    const name = draftName.trim()
    if (name) addStore(name)
    setAdding(false)
    setDraftName('')
  }

  function cancelAdd() {
    setAdding(false)
    setDraftName('')
  }

  function handleLongPress(store) {
    setMenuStore(store)
  }

  function requestDelete(store) {
    setMenuStore(null)
    if (settings.confirmBeforeDelete) {
      setDeletingStore(store)
    } else {
      deleteStore(store.id)
    }
  }

  function startRename(store) {
    setMenuStore(null)
    setRenamingStore(store)
    setRenameDraft(store.name)
  }

  function commitRename() {
    const name = renameDraft.trim()
    if (name && renamingStore) renameStore(renamingStore.id, name)
    setRenamingStore(null)
  }

  // ---- drag & drop reorder ----
  function onDragStart(id) {
    setDraggingId(id)
  }
  function onDragOverCard(e, id) {
    e.preventDefault()
    if (id !== draggingId) setDropTargetId(id)
  }
  function onDropCard(targetId) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDropTargetId(null)
      return
    }
    const ids = stores.map((s) => s.id)
    const from = ids.indexOf(draggingId)
    const to = ids.indexOf(targetId)
    ids.splice(from, 1)
    ids.splice(to, 0, draggingId)
    reorderStores(ids)
    setDraggingId(null)
    setDropTargetId(null)
  }
  function onDragEnd() {
    setDraggingId(null)
    setDropTargetId(null)
  }

  return (
    <div className="screen-fade">
      <div className="topbar">
        <button className="icon-btn" onClick={startAdd} aria-label="הוספת חנות">
          <IconPlus />
        </button>
        <div className="topbar-title">רשימת קניות</div>
        <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="הגדרות">
          <IconSettings />
        </button>
      </div>

      {loading && stores.length === 0 ? (
        <div className="stores-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      ) : stores.length === 0 && !adding ? (
        <div className="empty-state">
          עדיין אין חנויות ברשימה.
          <br />
          לוחצים על + למעלה כדי להוסיף חנות ראשונה.
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              activeCount={counts[store.id] || 0}
              isDragging={draggingId === store.id}
              isDropTarget={dropTargetId === store.id}
              onOpen={onOpenStore}
              onLongPress={handleLongPress}
              dragHandlers={{
                onDragStart: () => onDragStart(store.id),
                onDragOver: (e) => onDragOverCard(e, store.id),
                onDrop: () => onDropCard(store.id),
                onDragEnd,
              }}
            />
          ))}

          {adding && (
            <div className="inline-add-row in-grid">
              <input
                autoFocus
                placeholder="שם החנות"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitAdd()
                  if (e.key === 'Escape') cancelAdd()
                }}
                onBlur={() => (draftName.trim() ? commitAdd() : cancelAdd())}
              />
            </div>
          )}
        </div>
      )}

      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}

      {menuStore && (
        <div className="sheet-overlay" onClick={() => setMenuStore(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-title">{menuStore.name}</div>
            <button
              className="sheet-row"
              style={{ width: '100%', textAlign: 'right', border: 'none' }}
              onClick={() => startRename(menuStore)}
            >
              <span className="sheet-row-label">שינוי שם</span>
            </button>
            <button
              className="sheet-danger-btn"
              onClick={() => requestDelete(menuStore)}
              style={{ marginTop: 10 }}
            >
              מחיקת חנות
            </button>
          </div>
        </div>
      )}

      {renamingStore && (
        <div className="sheet-overlay" onClick={() => setRenamingStore(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-title">שינוי שם חנות</div>
            <div className="inline-add-row">
              <input
                autoFocus
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') setRenamingStore(null)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {deletingStore && (
        <ConfirmDialog
          title="מחיקת חנות"
          description={`למחוק את "${deletingStore.name}" ואת כל המוצרים שבה?`}
          onCancel={() => setDeletingStore(null)}
          onConfirm={() => {
            deleteStore(deletingStore.id)
            setDeletingStore(null)
          }}
        />
      )}
    </div>
  )
}
