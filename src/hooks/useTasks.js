import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// Module-scoped cache: survives across TasksScreen mount/unmount cycles
// within the same page session, so switching back to this screen shows the
// last-known list immediately instead of flashing empty while it re-fetches.
let tasksCache = null

export function useTasks() {
  const [tasks, setTasks] = useState(() => tasksCache || [])
  const [loading, setLoading] = useState(() => tasksCache === null)

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('order_index', { ascending: true })
    if (!error && data) {
      setTasks(data)
      tasksCache = data
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks])

  function setTasksAndCache(updater) {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      tasksCache = next
      return next
    })
  }

  async function addTask(title) {
    const nextOrder = tasks.length ? Math.max(...tasks.map((t) => t.order_index ?? 0)) + 1 : 0
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        is_done: false,
        order_index: nextOrder,
      })
      .select()
      .single()
    if (error) {
      console.error('addTask failed', error)
      return
    }
    setTasksAndCache((prev) => [...prev, data])
  }

  async function updateTask(id, patch) {
    const { error } = await supabase.from('tasks').update(patch).eq('id', id)
    if (error) console.error('updateTask failed', error)
  }

  async function toggleDone(task) {
    const nextDone = !task.is_done
    const patch = {
      is_done: nextDone,
      completed_at: nextDone ? new Date().toISOString() : null,
    }
    setTasksAndCache((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)))

    const { error } = await supabase.from('tasks').update(patch).eq('id', task.id)
    if (error) {
      console.error('toggleDone failed', error)
      setTasksAndCache((prev) => prev.map((t) => (t.id === task.id ? task : t)))
    }
  }

  async function deleteTask(id) {
    const previous = tasks
    setTasksAndCache((prev) => prev.filter((t) => t.id !== id))

    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      console.error('deleteTask failed', error)
      setTasksAndCache(previous)
    }
  }

  async function reorderTasks(orderedIds) {
    setTasksAndCache((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]))
      const reordered = orderedIds.map((id) => byId.get(id)).filter(Boolean)
      const rest = prev.filter((t) => !orderedIds.includes(t.id))
      return [...reordered, ...rest]
    })
    const updates = orderedIds.map((id, index) =>
      supabase.from('tasks').update({ order_index: index }).eq('id', id)
    )
    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed) console.error('reorderTasks failed', failed.error)
  }

  return { tasks, loading, addTask, updateTask, toggleDone, deleteTask, reorderTasks }
}
