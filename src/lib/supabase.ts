import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.warn(
    'Supabase credentials missing. Copy .env.example to .env and fill in your project values.',
  )
}

export const supabase = createClient(url ?? '', key ?? '')
