import { useRef } from 'react'
import { IconCart } from './Icons'

const LONG_PRESS_MS = 500

export function StoreCard({
  store,
  activeCount,
  isDragging,
  isDropTarget,
  onOpen,
  onLongPress,
  dragHandlers,
}) {
  const pressTimer = useRef(null)
  const suppressClick = useRef(false)

  function startPress() {
    suppressClick.current = false
    pressTimer.current = setTimeout(() => {
      suppressClick.current = true
      if (navigator.vibrate) navigator.vibrate(12)
      onLongPress(store)
    }, LONG_PRESS_MS)
  }

  function cancelPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  function handleClick() {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    onOpen(store)
  }

  const classes = [
    'store-card',
    isDragging ? 'is-dragging' : '',
    isDropTarget ? 'is-drop-target' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      draggable
      {...dragHandlers}
    >
      <div className="store-card-icon-row">
        <IconCart className="store-card-cart" />
        {activeCount > 0 && <span className="store-card-badge">{activeCount}</span>}
      </div>
      <div className="store-card-name">{store.name}</div>
    </button>
  )
}
