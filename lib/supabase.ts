import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables exist
if (!supabaseUrl) {
  throw new Error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable.\n\n' +
    'To fix:\n' +
    '1. Create a .env.local file in your project root\n' +
    '2. Add: NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n' +
    '3. Get your URL from: https://app.supabase.com/project/_/settings/api\n' +
    '4. Restart your dev server: npm run dev\n'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.\n\n' +
    'To fix:\n' +
    '1. Create a .env.local file in your project root\n' +
    '2. Add: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n' +
    '3. Get your key from: https://app.supabase.com/project/_/settings/api\n' +
    '4. Restart your dev server: npm run dev\n'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Log success in development
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Supabase client initialized successfully')
  console.log('📍 Project URL:', supabaseUrl)
}