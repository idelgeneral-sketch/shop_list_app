import { useMemo, useState } from 'react'
import { useItems } from '../hooks/useItems'
import { useSettings } from '../context/SettingsContext'
import { ItemRow } from './ItemRow'
import { AddItemRow } from './AddItemRow'
import { ConfirmDialog } from './ConfirmDialog'
import { IconBack, IconEye, IconEyeOff, IconPlus } from './Icons'

export function StoreScreen({ store, onBack }) {
  const { items, addItem, updateItem, togglePurchased, deleteItem } = useItems(store.id)
  const { settings } = useSettings()

  const [hidePurchased, setHidePurchased] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)

  const visibleItems = useMemo(() => {
    const active = items.filter((i) => !i.is_purchased)
    if (hidePurchased) return active
    const purchased = items
      .filter((i) => i.is_purchased)
      .sort((a, b) => new Date(b.purchased_at || 0) - new Date(a.purchased_at || 0))
    return [...active, ...purchased]
  }, [items, hidePurchased])

  function requestDelete(item) {
    if (settings.confirmBeforeDelete) {
      setDeletingItem(item)
    } else {
      deleteItem(item.id)
    }
  }

  return (
    <div className="screen-fade">
      <div className="store-header">
        <button className="icon-btn" onClick={onBack} aria-label="חזרה">
          <IconBack />
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

      {visibleItems.length === 0 && !adding ? (
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
            />
          ))}
          {adding && (
            <AddItemRow
              smartSearchEnabled={settings.smartSearch}
              onSubmitItem={addItem}
              onEmptyBlurClose={() => setAdding(false)}
            />
          )}
        </div>
      )}

      <div className="fab-wrap">
        <div className="app-shell-align">
          <button className="fab" onClick={() => setAdding(true)} aria-label="הוספת מוצר">
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
