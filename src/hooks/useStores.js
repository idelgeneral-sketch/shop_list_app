import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// Module-scoped cache: survives across StoresScreen re-mounts within the same
// page session, so switching back to this screen shows the last-known list
// immediately instead of flashing empty while it re-fetches in the background.
let storesCache = null

export function useStores() {
  const [stores, setStores] = useState(() => storesCache || [])
  const [loading, setLoading] = useState(() => storesCache === null)

  const fetchStores = useCallback(async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('order_index', { ascending: true })
    if (!error && data) {
      setStores(data)
      storesCache = data
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStores()

    const channel = supabase
      .channel('stores-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, () => {
        fetchStores()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStores])

  async function addStore(name) {
    const nextOrder = stores.length
      ? Math.max(...stores.map((s) => s.order_index)) + 1
      : 0
    const { error } = await supabase
      .from('stores')
      .insert({ name, order_index: nextOrder })
    if (error) console.error('addStore failed', error)
  }

  async function renameStore(id, name) {
    const { error } = await supabase.from('stores').update({ name }).eq('id', id)
    if (error) console.error('renameStore failed', error)
  }

  async function deleteStore(id) {
    const { error } = await supabase.from('stores').delete().eq('id', id)
    if (error) console.error('deleteStore failed', error)
  }

  async function reorderStores(orderedIds) {
    // Optimistic local update so the drag feels instant.
    setStores((prev) => {
      const byId = new Map(prev.map((s) => [s.id, s]))
      const next = orderedIds.map((id) => byId.get(id)).filter(Boolean)
      storesCache = next
      return next
    })
    const updates = orderedIds.map((id, index) =>
      supabase.from('stores').update({ order_index: index }).eq('id', id)
    )
    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed) console.error('reorderStores failed', failed.error)
  }

  return { stores, loading, addStore, renameStore, deleteStore, reorderStores }
}
