import { useEffect, useRef, useState } from 'react'
import { IconCheck, IconDragHandle, IconTrash } from './Icons'

const LONG_PRESS_MS = 500

export function TaskRow({ task, onToggle, onUpdate, onRequestDelete, isDragging, isDropTarget, dragHandlers }) {
  const [title, setTitle] = useState(task.title)
  const [draggable, setDraggable] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const pressTimer = useRef(null)
  const longPressTriggered = useRef(false)

  function commitTitle() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed })
    } else {
      setTitle(task.title)
    }
  }

  const canReorder = !task.is_done && dragHandlers

  function startPress(e) {
    if (e.target.closest('.drag-handle')) return

    longPressTriggered.current = false
    if (e.target.tagName === 'INPUT') {
      e.preventDefault()
    }

    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      if (navigator.vibrate) navigator.vibrate(12)
      document.activeElement?.blur()
      setDeleteMode(true)
    }, LONG_PRESS_MS)
  }

  function cancelPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  function endPress(e) {
    cancelPress()
    if (!longPressTriggered.current && e.target.tagName === 'INPUT') {
      e.target.focus()
    }
  }

  useEffect(() => {
    if (!deleteMode) return
    function handleOutsideClick() {
      setDeleteMode(false)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [deleteMode])

  const classes = [
    'item-row',
    task.is_done ? 'is-purchased' : '',
    isDragging ? 'is-dragging' : '',
    isDropTarget ? 'is-drop-target' : '',
    deleteMode ? 'is-delete-mode' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (deleteMode) {
    return (
      <div className={classes}>
        <div className="drag-handle is-disabled" aria-hidden="true">
          <IconDragHandle />
        </div>
        <div className={`checkbox-btn ${task.is_done ? 'is-checked' : ''}`} style={{ opacity: 0.4 }}>
          {task.is_done && <IconCheck />}
        </div>
        <div className="item-name-display">{task.title}</div>
        <button
          className="delete-confirm-btn"
          onClick={(e) => {
            e.stopPropagation()
            onRequestDelete(task)
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
      onPointerUp={endPress}
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
