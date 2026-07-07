import { useMemo, useRef, useState } from 'react'
import { useItems } from '../hooks/useItems'
import { useSettings } from '../context/SettingsContext'
import { ItemRow } from './ItemRow'
import { ItemRowSkeleton } from './Skeletons'
import { AddItemRow } from './AddItemRow'
import { ConfirmDialog } from './ConfirmDialog'
import { IconEye, IconEyeOff, IconPlus } from './Icons'

export function StoreScreen({ store, onBack }) {
  const { items, loading, addItem, updateItem, togglePurchased, deleteItem, reorderItems } = useItems(store.id)
  const { settings } = useSettings()

  const [hidePurchased, setHidePurchased] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)
  const addItemRowRef = useRef(null)

  const [draggingId, setDraggingId] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)

  const activeItems = useMemo(
    () => items.filter((i) => !i.is_purchased).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [items]
  )
  const purchasedItems = useMemo(
    () =>
      items
        .filter((i) => i.is_purchased)
        .sort((a, b) => new Date(b.purchased_at || 0) - new Date(a.purchased_at || 0)),
    [items]
  )

  const visibleItems = hidePurchased ? activeItems : [...activeItems, ...purchasedItems]

  function requestDelete(item) {
    if (settings.confirmBeforeDelete) {
      setDeletingItem(item)
    } else {
      deleteItem(item.id)
    }
  }

  // ---- drag & drop reorder (active items only) ----
  function onDragStart(id) {
    setDraggingId(id)
  }
  function onDragOverItem(e, id) {
    e.preventDefault()
    if (id !== draggingId) setDropTargetId(id)
  }
  function onDropItem(targetId) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDropTargetId(null)
      return
    }
    const ids = activeItems.map((i) => i.id)
    const from = ids.indexOf(draggingId)
    const to = ids.indexOf(targetId)
    if (from === -1 || to === -1) {
      setDraggingId(null)
      setDropTargetId(null)
      return
    }
    ids.splice(from, 1)
    ids.splice(to, 0, draggingId)
    reorderItems(ids)
    setDraggingId(null)
    setDropTargetId(null)
  }
  function onDragEnd() {
    setDraggingId(null)
    setDropTargetId(null)
  }

  function handleFabClick() {
    if (adding) {
      // A row is already open — commit whatever's typed (defaulting quantity
      // to 1, same as pressing Enter) and let AddItemRow open a fresh one.
      addItemRowRef.current?.submitCurrent()
    } else {
      setAdding(true)
    }
  }

  return (
    <div className="screen-fade">
      <div className="store-header">
        <button className="icon-btn" onClick={onBack} aria-label="חזרה">
          <span className="back-arrow-char">→</span>
        </button>
        <div className="store-header-title">{store.name}</div>
        <button
          className={`icon-btn ${hidePurchased ? 'is-active' : ''}`}
          onClick={() => setHidePurchased((v) => !v)}
          aria-label="הצגה/הסתרה של פריטים שנקנו"
        >
          {hidePurchased ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="items-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <ItemRowSkeleton key={i} />
          ))}
        </div>
      ) : visibleItems.length === 0 && !adding ? (
        <div className="empty-state">
          הרשימה ריקה.
          <br />
          לוחצים על הכפתור הסגול למטה כדי להוסיף מוצר.
        </div>
      ) : (
        <div className="items-list">
          {visibleItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={togglePurchased}
              onUpdate={updateItem}
              onRequestDelete={requestDelete}
              isDragging={draggingId === item.id}
              isDropTarget={dropTargetId === item.id}
              dragHandlers={
                item.is_purchased
                  ? null
                  : {
                      onDragStart: () => onDragStart(item.id),
                      onDragOver: (e) => onDragOverItem(e, item.id),
                      onDrop: () => onDropItem(item.id),
                      onDragEnd,
                    }
              }
            />
          ))}
          {adding && (
            <AddItemRow
              ref={addItemRowRef}
              smartSearchEnabled={settings.smartSearch}
              onSubmitItem={addItem}
              onEmptyBlurClose={() => setAdding(false)}
            />
          )}
        </div>
      )}

      <div className="fab-wrap">
        <div className="app-shell-align">
          <button className="fab" onClick={handleFabClick} aria-label="הוספת מוצר">
            <IconPlus />
          </button>
        </div>
      </div>

      {deletingItem && (
        <ConfirmDialog
          title="מחיקת מוצר"
          description={`למחוק את "${deletingItem.name}"?`}
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            deleteItem(deletingItem.id)
            setDeletingItem(null)
          }}
        />
      )}
    </div>
  )
}
