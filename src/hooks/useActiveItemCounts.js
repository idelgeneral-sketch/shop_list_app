import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useActiveItemCounts() {
  const [counts, setCounts] = useState({})

  const fetchCounts = useCallback(async () => {
    const { data, error } = await supabase.from('items').select('store_id, is_purchased')
    if (error || !data) return
    const next = {}
    for (const row of data) {
      if (row.is_purchased) continue
      next[row.store_id] = (next[row.store_id] || 0) + 1
    }
    setCounts(next)
  }, [])

  useEffect(() => {
    fetchCounts()

    const channel = supabase
      .channel('items-counts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchCounts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCounts])

  return counts
}
