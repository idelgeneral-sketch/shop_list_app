import { useState } from 'react'
import { IconCheck, IconDragHandle, IconTrash } from './Icons'

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

  const classes = [
    'item-row',
    item.is_purchased ? 'is-purchased' : '',
    isDragging ? 'is-dragging' : '',
    isDropTarget ? 'is-drop-target' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      draggable={draggable}
      {...(canReorder ? dragHandlers : {})}
    >
      <button
        type="button"
        className={`drag-handle ${canReorder ? '' : 'is-disabled'}`}
        onPointerDown={() => canReorder && setDraggable(true)}
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

      <button className="item-delete" onClick={() => onRequestDelete(item)} aria-label="מחיקת מוצר">
        <IconTrash />
      </button>
    </div>
  )
}
