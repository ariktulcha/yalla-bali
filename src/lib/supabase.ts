import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars — ' +
    'set them in your hosting provider (Netlify: Site settings → Environment variables).'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
export const DESTINATION_ID =
  import.meta.env.DESTINATION_ID ?? process.env.DESTINATION_ID ?? 'bali'
