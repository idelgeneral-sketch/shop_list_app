import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Surface a clear error instead of a cryptic network failure.
  console.error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      '(see .env.example) — locally in a .env file, on Render in the service Environment tab.'
  )
}

export const supabase = createClient(url, anonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})
