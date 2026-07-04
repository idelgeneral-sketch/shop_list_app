import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useProductSuggestions(query, enabled) {
  const [suggestions, setSuggestions] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!enabled || !query || !query.trim()) {
      setSuggestions([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('product_suggestions')
        .select('*')
        .ilike('name', `%${query.trim()}%`)
        .order('usage_count', { ascending: false })
        .order('last_used_at', { ascending: false })
        .limit(8)
      if (!error && data) setSuggestions(data)
    }, 150)

    return () => clearTimeout(debounceRef.current)
  }, [query, enabled])

  return suggestions
}

// Called when an item name is committed (typed or picked from suggestions),
// so future searches get smarter over time.
export async function recordProductUsage(name) {
  const trimmed = name.trim()
  if (!trimmed) return

  const { data: existing } = await supabase
    .from('product_suggestions')
    .select('id, usage_count')
    .eq('name', trimmed)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('product_suggestions')
      .update({ usage_count: existing.usage_count + 1, last_used_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('product_suggestions').insert({ name: trimmed })
  }
}
