import { useRef, useState } from 'react'
import { IconCheck, IconDragHandle } from './Icons'

const LONG_PRESS_MS = 500

export function ItemRow({
  item,
  onToggle,
  onUpdate,
  onRequestDelete,
  isDragging,
  isDropTarget,
  dragHandlers,
}) {
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity)
  const [draggable, setDraggable] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const pressTimer = useRef(null)

  function commitName() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== item.name) {
      onUpdate(item.id, { name: trimmed })
    } else {
      setName(item.name)
    }
  }

  function commitQuantity() {
    const trimmed = quantity.trim() || '1'
    if (trimmed !== item.quantity) onUpdate(item.id, { quantity: trimmed })
    setQuantity(trimmed)
  }

  const canReorder = !item.is_purchased && dragHandlers

  function startPress(e) {
    // The drag handle (the dots) has its own press behavior for reordering —
    // don't also start a delete-reveal timer when the press begins there.
    if (e.target.closest('.drag-handle')) return
    pressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(12)
      document.activeElement?.blur()
      setDeleteMode(true)
    }, LONG_PRESS_MS)
  }

  function cancelPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  const classes = [
    'item-row',
    item.is_purchased ? 'is-purchased' : '',
    isDragging ? 'is-dragging' : '',
    isDropTarget ? 'is-drop-target' : '',
    deleteMode ? 'is-delete-mode' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (deleteMode) {
    return (
      <div className={classes} onClick={() => setDeleteMode(false)}>
        <div className="drag-handle is-disabled" aria-hidden="true">
          <IconDragHandle />
        </div>
        <div className={`checkbox-btn ${item.is_purchased ? 'is-checked' : ''}`} style={{ opacity: 0.4 }}>
          {item.is_purchased && <IconCheck />}
        </div>
        <div className="item-name-display">{item.name}</div>
        <button
          className="delete-confirm-btn"
          onClick={(e) => {
            e.stopPropagation()
            onRequestDelete(item)
          }}
        >
          מחיקה
        </button>
      </div>
    )
  }

  return (
    <div
      className={classes}
      draggable={draggable}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerMove={cancelPress}
      {...(canReorder ? dragHandlers : {})}
    >
      <button
        type="button"
        className={`drag-handle ${canReorder ? '' : 'is-disabled'}`}
        onPointerDown={(e) => {
          e.stopPropagation()
          if (canReorder) setDraggable(true)
        }}
        onPointerUp={() => setDraggable(false)}
        onPointerLeave={() => setDraggable(false)}
        aria-label="גרירה לשינוי מיקום"
      >
        <IconDragHandle />
      </button>

      <button
        className={`checkbox-btn ${item.is_purchased ? 'is-checked' : ''}`}
        onClick={() => onToggle(item)}
        aria-label="סימון כנקנה"
      >
        {item.is_purchased && <IconCheck />}
      </button>

      <input
        className={`item-name ${item.is_purchased ? 'is-purchased' : ''}`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />

      <input
        className={`item-quantity ${item.is_purchased ? 'is-purchased' : ''}`}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        onBlur={commitQuantity}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        disabled={item.is_purchased}
      />
    </div>
  )
}
