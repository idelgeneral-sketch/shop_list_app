import { useMemo, useRef, useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useSettings } from '../context/SettingsContext'
import { TaskRow } from './TaskRow'
import { ItemRowSkeleton } from './Skeletons'
import { AddTaskRow } from './AddTaskRow'
import { ConfirmDialog } from './ConfirmDialog'
import { IconEye, IconEyeOff, IconMenu, IconPlus } from './Icons'

export function TasksScreen({ onOpenMenu }) {
  const { tasks, loading, addTask, updateTask, toggleDone, deleteTask, reorderTasks } = useTasks()
  const { settings } = useSettings()

  const [hideDone, setHideDone] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deletingTask, setDeletingTask] = useState(null)
  const addTaskRowRef = useRef(null)

  const [draggingId, setDraggingId] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)

  const activeTasks = useMemo(
    () => tasks.filter((t) => !t.is_done).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [tasks]
  )
  const doneTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.is_done)
        .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0)),
    [tasks]
  )

  const visibleTasks = hideDone ? activeTasks : [...activeTasks, ...doneTasks]

  function requestDelete(task) {
    if (settings.confirmBeforeDelete) {
      setDeletingTask(task)
    } else {
      deleteTask(task.id)
    }
  }

  function handleFabClick() {
    if (adding) {
      addTaskRowRef.current?.submitCurrent()
    } else {
      setAdding(true)
    }
  }

  // ---- drag & drop reorder (active tasks only) ----
  function onDragStart(id) {
    setDraggingId(id)
  }
  function onDragOverTask(e, id) {
    e.preventDefault()
    if (id !== draggingId) setDropTargetId(id)
  }
  function onDropTask(targetId) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDropTargetId(null)
      return
    }
    const ids = activeTasks.map((t) => t.id)
    const from = ids.indexOf(draggingId)
    const to = ids.indexOf(targetId)
    if (from === -1 || to === -1) {
      setDraggingId(null)
      setDropTargetId(null)
      return
    }
    ids.splice(from, 1)
    ids.splice(to, 0, draggingId)
    reorderTasks(ids)
    setDraggingId(null)
    setDropTargetId(null)
  }
  function onDragEnd() {
    setDraggingId(null)
    setDropTargetId(null)
  }

  return (
    <div className="screen-fade">
      <div className="store-header">
        <div className="store-header-title">משימות</div>
        <button className="icon-btn header-btn-right" onClick={onOpenMenu} aria-label="תפריט">
          <IconMenu />
        </button>
        <button
          className={`icon-btn header-btn-left ${hideDone ? 'is-active' : ''}`}
          onClick={() => setHideDone((v) => !v)}
          aria-label="הצגה/הסתרה של משימות שבוצעו"
        >
          {hideDone ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="items-list">
          {Array.from({ length: 5 }).map((_, i) => (
            <ItemRowSkeleton key={i} />
          ))}
        </div>
      ) : visibleTasks.length === 0 && !adding ? (
        <div className="empty-state">
          אין משימות עדיין.
          <br />
          לוחצים על הכפתור הסגול למטה כדי להוסיף משימה ראשונה.
        </div>
      ) : (
        <div className="items-list">
          {visibleTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={toggleDone}
              onUpdate={updateTask}
              onRequestDelete={requestDelete}
              isDragging={draggingId === task.id}
              isDropTarget={dropTargetId === task.id}
              dragHandlers={
                task.is_done
                  ? null
                  : {
                      onDragStart: () => onDragStart(task.id),
                      onDragOver: (e) => onDragOverTask(e, task.id),
                      onDrop: () => onDropTask(task.id),
                      onDragEnd,
                    }
              }
            />
          ))}
          {adding && (
            <AddTaskRow ref={addTaskRowRef} onSubmitTask={addTask} onEmptyBlurClose={() => setAdding(false)} />
          )}
        </div>
      )}

      <div className="fab-wrap">
        <div className="app-shell-align">
          <button className="fab" onClick={handleFabClick} aria-label="הוספת משימה">
            <IconPlus />
          </button>
        </div>
      </div>

      {deletingTask && (
        <ConfirmDialog
          title="מחיקת משימה"
          description={`למחוק את "${deletingTask.title}"?`}
          onCancel={() => setDeletingTask(null)}
          onConfirm={() => {
            deleteTask(deletingTask.id)
            setDeletingTask(null)
          }}
        />
      )}
    </div>
  )
}
