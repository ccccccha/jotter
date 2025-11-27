import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: confirm env loaded in server console and browser devtools
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!supabaseAnonKey)

function makeMissingClient(message: string) {
  // Minimal stub so imports don't throw; methods will throw a clear error when used.
  const handler = {
    from: () => ({ select: async () => { throw new Error(message) } }),
    auth: {
      signUp: async () => { throw new Error(message) },
      signInWithPassword: async () => { throw new Error(message) },
      signIn: async () => { throw new Error(message) },
    },
  }
  return handler as unknown as SupabaseClient
}

let supabase: SupabaseClient

if (!supabaseUrl || !supabaseAnonKey) {
  const msg =
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Place .env.local in the Next project root (where you run npm run dev) and restart the dev server.'
  console.warn(msg)
  supabase = makeMissingClient(msg)
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }