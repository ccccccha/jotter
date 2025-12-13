// app/dashboard/ideas/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

function stringToColorHex(str: string) {
  const palette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#FF9FF3', '#54A0FF', '#48DBFB', '#FF6348', '#1DD1A1',
    '#FFA502', '#FF6348', '#FF4757', '#5F27CD', '#00D2D3'
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function readableTextColor(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.6 ? 'black' : 'white';
}

export default function IdeaBoxPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadFolders();
      loadIdeas();
    }
  }, [user]);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) router.push('/login');
    else setUser(data.user);
  }

  async function loadFolders() {
    const { data } = await supabase.from('folders').select('*');
    setFolders(data || []);
  }

  async function loadIdeas() {
    const { data } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });
    setIdeas(data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const getFolderInfo = (folder_id: string) => {
    const folder = folders.find((f) => f.id === folder_id);
    if (!folder) return null;
    const color = stringToColorHex(folder.name || folder.id);
    return { ...folder, color };
  };

  const filterIdea = (idea: any) => {
    if (!search.trim()) return true;
    const text = search.toLowerCase();
    return (
      idea.title?.toLowerCase().includes(text) ||
      idea.description?.toLowerCase().includes(text) ||
      (Array.isArray(idea.tags)
        ? idea.tags.join(' ').toLowerCase()
        : String(idea.tags || '')
            .toLowerCase()
      ).includes(text)
    );
  };

  const groupByDate = (filtered: any[]) => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((idea) => {
      const dateLabel = new Date(idea.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(idea);
    });
    return groups;
  };

  const filteredIdeas = ideas.filter(filterIdea);
  const grouped = groupByDate(filteredIdeas);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=Inter:wght@400;800;900&display=swap');
        
        .font-classic { font-family: 'Playfair Display', serif; }
        .font-modern { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="bg-white min-h-screen text-black pb-20">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12">
          
          {/* Header */}
          <header className="flex justify-between items-center py-8 border-b border-gray-200">
            <a href="/dashboard" className="text-xl font-modern font-bold tracking-tighter cursor-pointer hover:text-gray-600 transition-colors">
              JOTTER.
            </a>
            
            <nav className="hidden md:flex gap-8 text-sm font-modern">
              <a href="/dashboard" className="hover:text-gray-600 transition-colors">
                Home
              </a>
              <a href="/dashboard/add" className="hover:text-gray-600 transition-colors">
                Add Idea
              </a>
              <a href="/dashboard/ideas" className="hover:text-gray-600 transition-colors font-semibold">
                Idea Box
              </a>
            </nav>

            <button
              onClick={handleLogout}
              className="text-sm font-modern underline underline-offset-4 decoration-gray-700 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Log out
            </button>
          </header>

          {/* Mobile Nav */}
          <nav className="md:hidden flex justify-center gap-6 py-4 text-sm font-modern border-b border-gray-200">
            <a href="/dashboard" className="hover:text-gray-600 transition-colors">
              Home
            </a>
            <a href="/dashboard/add" className="hover:text-gray-600 transition-colors">
              Add Idea
            </a>
            <a href="/dashboard/ideas" className="hover:text-gray-600 transition-colors font-semibold">
              Idea Box
            </a>
          </nav>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-modern font-bold mb-8">Idea Box</h1>

            <input
              type="text"
              placeholder="Search ideas by title, content, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-4 rounded-xl bg-white border border-neutral-300 focus:border-black outline-none mb-8 font-modern text-sm placeholder-neutral-500 transition-colors"
            />

            {Object.keys(grouped).length === 0 ? (
              <div className="text-center text-gray-500 py-10 font-modern">
                No ideas found.{' '}
                <a href="/dashboard/add" className="text-black font-semibold underline hover:text-gray-600 transition-colors cursor-pointer">
                  Add one?
                </a>
              </div>
            ) : (
              Object.keys(grouped).map((date) => (
                <div key={date} className="mb-10">
                  <h2 className="text-sm text-gray-500 font-modern font-semibold mb-4 tracking-wide uppercase">
                    {date}
                  </h2>

                  {grouped[date].map((idea) => {
                    const folder = getFolderInfo(idea.folder_id);
                    const color = folder ? folder.color : '#71717A';
                    const textColor = readableTextColor(color);

                    return (
                      <div
                        key={idea.id}
                        className="relative bg-white border border-neutral-300 p-6 rounded-xl mb-5 hover:border-black transition-all"
                      >
                        <div className="mb-3">
                          {folder ? (
                            <span
                              className="px-3 py-1 text-xs font-modern font-bold rounded-full"
                              style={{ backgroundColor: color, color: textColor }}
                            >
                              {folder.name}
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-modern font-bold bg-gray-300 text-gray-700 rounded-full">
                              Uncategorized
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-modern font-bold mb-2">
                          {idea.title || '(No title)'}
                        </h2>

                        <p className="text-gray-700 font-modern whitespace-pre-line mb-3">
                          {idea.description}
                        </p>

                        {idea.tags && idea.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {(Array.isArray(idea.tags) ? idea.tags : []).map(
                              (tag: any, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 rounded-lg bg-gray-200 text-xs font-modern"
                                >
                                  #{tag}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        <p className="text-xs text-gray-500 mt-3 font-modern">
                          {new Date(idea.created_at).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </main>

        </div>
      </div>
    </>
  );
}