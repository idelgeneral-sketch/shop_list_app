import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export const AddTaskRow = forwardRef(function AddTaskRow({ onSubmitTask, onEmptyBlurClose }, ref) {
  const [title, setTitle] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function finishTask() {
    const finalTitle = title.trim()
    if (!finalTitle) return
    onSubmitTask(finalTitle)
    setTitle('')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  useImperativeHandle(ref, () => ({
    submitCurrent: finishTask,
    hasDraft: () => title.trim().length > 0,
  }))

  return (
    <div className="item-row" style={{ border: '1.5px solid var(--primary)', boxShadow: 'none' }}>
      <div className="drag-handle is-disabled" aria-hidden="true" />
      <div className="checkbox-btn" aria-hidden="true" />
      <input
        ref={inputRef}
        className="item-name"
        placeholder="משימה חדשה"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            finishTask()
          } else if (e.key === 'Escape' && !title.trim()) {
            onEmptyBlurClose?.()
          }
        }}
        onBlur={() => {
          if (!title.trim()) onEmptyBlurClose?.()
        }}
      />
      <div className="item-delete" aria-hidden="true" />
    </div>
  )
})
