'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';

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

type Folder = { id: string; name: string };
type Idea = {
  id: string;
  title: string | null;
  description: string;
  folder_id: string | null;
  tags: string[] | null;
  created_at: string;
};

export default function FolderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingIdea, setDeletingIdea] = useState<Idea | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) load();
  }, [id, user]);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) router.push('/login');
    else setUser(data.user);
  }

  async function load() {
    if (!id) return;
    setLoading(true);

    if (id === 'uncategorized') {
      setFolder({ id: 'uncategorized', name: 'Uncategorized' });

      const { data } = await supabase
        .from('ideas')
        .select('*')
        .is('folder_id', null)
        .order('created_at', { ascending: false });

      setIdeas(data || []);
      setLoading(false);
      return;
    }

    const { data: folderData } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .single();

    setFolder(folderData || null);
    setNewFolderName(folderData?.name || '');

    const { data: ideasData } = await supabase
      .from('ideas')
      .select('*')
      .eq('folder_id', id)
      .order('created_at', { ascending: false });

    setIdeas(ideasData || []);
    setLoading(false);
  }

  async function handleDeleteIdea() {
    if (!deletingIdea) return;
    await supabase.from('ideas').delete().eq('id', deletingIdea.id);
    setShowDeleteModal(false);
    setDeletingIdea(null);
    await load();
  }

  async function handleRenameFolder() {
    if (!folder || folder.id === 'uncategorized' || !newFolderName.trim()) return;

    const { error } = await supabase
      .from('folders')
      .update({ name: newFolderName.trim() })
      .eq('id', folder.id);

    if (!error) {
      setShowRenameModal(false);
      await load();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const filteredIdeas = ideas.filter((idea) => {
    const q = search.toLowerCase();
    return (
      idea.title?.toLowerCase().includes(q) ||
      idea.description?.toLowerCase().includes(q) ||
      idea.tags?.join(' ').toLowerCase().includes(q)
    );
  });

  const groups: Record<string, Idea[]> = {};
  filteredIdeas.forEach((idea) => {
    const label = new Date(idea.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    groups[label] = groups[label] || [];
    groups[label].push(idea);
  });

  const folderColor = folder?.name ? stringToColorHex(folder.name) : '#666';
  const textColor = readableTextColor(folderColor);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black px-6 py-10">
        <div className="font-modern">Loading...</div>
      </div>
    );
  }

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
              <a href="/dashboard/ideas" className="hover:text-gray-600 transition-colors">
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
            <a href="/dashboard/ideas" className="hover:text-gray-600 transition-colors">
              Idea Box
            </a>
          </nav>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto py-10">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-black mb-6 flex items-center gap-2 font-modern text-sm transition-colors"
            >
              ← Back to Dashboard
            </button>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: folderColor }}
                />
                <h1 className="text-3xl font-modern font-bold">{folder?.name}</h1>
              </div>

              {folder && folder.id !== 'uncategorized' && (
                <button
                  onClick={() => setShowRenameModal(true)}
                  className="text-sm font-modern text-gray-600 hover:text-black underline underline-offset-2 transition-colors"
                >
                  Rename
                </button>
              )}
            </div>

            <p className="text-sm font-modern text-gray-600 mb-6">
              {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'} in this folder
            </p>

            <div className="flex gap-3 mb-8">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-lg font-modern text-sm focus:outline-none focus:border-black transition-colors placeholder-neutral-500"
                placeholder="Search ideas..."
              />
              <button
                onClick={() => router.push('/dashboard/add')}
                className="px-6 py-3 bg-blue-600 text-white font-modern font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add
              </button>
            </div>

            {Object.keys(groups).length === 0 ? (
              <div className="text-center text-gray-500 py-10 font-modern">
                No ideas in this folder.
              </div>
            ) : (
              Object.entries(groups).map(([date, items]) => (
                <div key={date} className="mb-10">
                  <h3 className="text-sm text-gray-500 font-modern font-semibold mb-4 tracking-wide uppercase">
                    {date}
                  </h3>

                  {items.map((idea) => (
                    <div
                      key={idea.id}
                      className="group relative bg-white border border-neutral-300 p-6 rounded-xl mb-5 hover:border-black transition-all"
                    >
                      <span
                        className="px-3 py-1 rounded-full text-xs font-modern font-bold"
                        style={{ backgroundColor: folderColor, color: textColor }}
                      >
                        {folder?.name}
                      </span>

                      <h2 className="text-xl font-modern font-bold mt-3">
                        {idea.title || '(No Title)'}
                      </h2>

                      <p className="text-gray-700 font-modern mt-2 whitespace-pre-line">
                        {idea.description}
                      </p>

                      {idea.tags?.length ? (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {idea.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-1 bg-gray-200 rounded-lg text-xs font-modern"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <p className="text-xs text-gray-500 mt-3 font-modern">
                        {new Date(idea.created_at).toLocaleString()}
                      </p>

                      <button
                        onClick={() => {
                          setDeletingIdea(idea);
                          setShowDeleteModal(true);
                        }}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all text-sm"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </main>

        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && deletingIdea && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="bg-white p-8 rounded-2xl border border-neutral-300 w-full max-w-md">
            <h3 className="text-xl font-modern font-bold mb-3">Delete idea?</h3>
            <p className="text-gray-700 font-modern mb-6">
              Are you sure you want to delete{' '}
              <span className="font-bold">{deletingIdea.title || 'this idea'}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-3 bg-gray-200 text-black font-modern font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteIdea}
                className="px-4 py-3 bg-red-600 text-white font-modern font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && folder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="bg-white p-8 rounded-2xl border border-neutral-300 w-full max-w-md">
            <h3 className="text-xl font-modern font-bold mb-4">Rename Folder</h3>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500 mb-6"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-3 bg-gray-200 text-black font-modern font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameFolder}
                className="px-4 py-3 bg-black text-white font-modern font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}