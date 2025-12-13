// app/login/page.tsx
'use client'

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push('/dashboard');
    } else {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@400;800;900&display=swap');
        
        .font-classic { font-family: 'Playfair Display', serif; }
        .font-modern { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="bg-white min-h-screen text-black">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12">
          
          {/* Header */}
          <header className="flex justify-between items-center py-8">
            <a href="/" className="text-xl font-modern font-bold tracking-tighter cursor-pointer hover:text-gray-600 transition-colors">
              JOTTER.
            </a>
            <a href="/signup" className="text-sm font-modern underline underline-offset-4 decoration-gray-700 hover:text-gray-600 transition-colors cursor-pointer">
              Sign up
            </a>
          </header>

          {/* Main Content */}
          <main className="max-w-md mx-auto mt-20">
            <h1 className="text-3xl font-modern font-bold mb-2 text-center">Welcome Back</h1>
            <p className="font-classic italic text-gray-600 mb-8 text-center">
              Log in to access your ideas
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-modern">
                {error}
              </div>
            )}

            <div className="bg-white border border-neutral-300 rounded-2xl p-8 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-modern font-semibold mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-modern font-semibold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-3 text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-black text-white font-modern font-extrabold uppercase tracking-wide text-sm px-6 py-4 rounded-lg hover:bg-gray-800 transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm font-modern text-gray-600">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-black font-semibold underline underline-offset-2 hover:text-gray-600 transition-colors cursor-pointer">
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}