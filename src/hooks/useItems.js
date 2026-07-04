import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useItems(storeId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    if (!storeId) return
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: true })
    if (!error && data) setItems(data)
    setLoading(false)
  }, [storeId])

  useEffect(() => {
    if (!storeId) return
    fetchItems()

    const channel = supabase
      .channel(`items-realtime-${storeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `store_id=eq.${storeId}` },
        () => fetchItems()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId, fetchItems])

  async function addItem({ name, quantity }) {
    const { error } = await supabase.from('items').insert({
      store_id: storeId,
      name,
      quantity: quantity && quantity.trim() ? quantity.trim() : '1',
      is_purchased: false,
    })
    if (error) console.error('addItem failed', error)
  }

  async function updateItem(id, patch) {
    const { error } = await supabase.from('items').update(patch).eq('id', id)
    if (error) console.error('updateItem failed', error)
  }

  async function togglePurchased(item) {
    const nextPurchased = !item.is_purchased
    const patch = {
      is_purchased: nextPurchased,
      purchased_at: nextPurchased ? new Date().toISOString() : null,
    }

    // Optimistic local update so the tap feels instant; realtime will
    // reconcile shortly after with the server-confirmed row.
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...patch } : i)))

    const { error } = await supabase.from('items').update(patch).eq('id', item.id)
    if (error) {
      console.error('togglePurchased failed', error)
      // Roll back on failure.
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
    }
  }

  async function deleteItem(id) {
    const previous = items
    // Optimistic local update — don't wait for the realtime echo.
    setItems((prev) => prev.filter((i) => i.id !== id))

    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) {
      console.error('deleteItem failed', error)
      setItems(previous) // roll back on failure
    }
  }

  return { items, loading, addItem, updateItem, togglePurchased, deleteItem }
}
