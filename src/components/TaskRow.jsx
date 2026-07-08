import { useState } from 'react'
import { IconCheck, IconDragHandle, IconTrash } from './Icons'

export function TaskRow({ task, onToggle, onUpdate, onRequestDelete, isDragging, isDropTarget, dragHandlers }) {
  const [title, setTitle] = useState(task.title)
  const [draggable, setDraggable] = useState(false)

  function commitTitle() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed })
    } else {
      setTitle(task.title)
    }
  }

  const canReorder = !task.is_done && dragHandlers

  const classes = [
    'item-row',
    task.is_done ? 'is-purchased' : '',
    isDragging ? 'is-dragging' : '',
    isDropTarget ? 'is-drop-target' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} draggable={draggable} {...(canReorder ? dragHandlers : {})}>
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
        className={`checkbox-btn ${task.is_done ? 'is-checked' : ''}`}
        onClick={() => onToggle(task)}
        aria-label="סימון כבוצע"
      >
        {task.is_done && <IconCheck />}
      </button>

      <input
        className={`item-name ${task.is_done ? 'is-purchased' : ''}`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />

      <button className="item-delete" onClick={() => onRequestDelete(task)} aria-label="מחיקת משימה">
        <IconTrash />
      </button>
    </div>
  )
}
