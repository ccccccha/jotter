'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

// Color utilities
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

type Folder = { id: string; name: string; idea_count: number };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uncategorizedCount, setUncategorizedCount] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadFolders();
    }
  }, [user]);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      router.push('/login');
    } else {
      setUser(data.user);
    }
  }

  async function loadFolders() {
    const { data: foldersData } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (foldersData) {
      const foldersWithCounts = await Promise.all(
        foldersData.map(async (folder) => {
          const { count } = await supabase
            .from('ideas')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', folder.id);
          return { ...folder, idea_count: count || 0 };
        })
      );
      setFolders(foldersWithCounts);
    }

    const { count } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .is('folder_id', null);
    setUncategorizedCount(count || 0);
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;

    const { error } = await supabase
      .from('folders')
      .insert([{ name: newFolderName.trim(), user_id: user.id }]);

    if (!error) {
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadFolders();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <header className="flex justify-between items-center py-8 border-b border-gray-200">
            <a href="/dashboard" className="text-xl font-modern font-bold tracking-tighter cursor-pointer hover:text-gray-600 transition-colors">
              JOTTER.
            </a>
            
            <nav className="hidden md:flex gap-8 text-sm font-modern">
              <a href="/dashboard" className="hover:text-gray-600 transition-colors font-semibold">
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
            <a href="/dashboard" className="hover:text-gray-600 transition-colors font-semibold">
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
          <main className="max-w-6xl mx-auto py-10">
            <h1 className="text-3xl font-modern font-bold mb-8">Dashboard</h1>

            {/* Search & Add Folder */}
            <div className="flex gap-3 mb-8">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search folders..."
                className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500"
              />
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="px-6 py-3 bg-blue-600 text-white font-modern font-bold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                + Add folder
              </button>
            </div>

            {/* Folders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFolders.map((folder) => {
                const color = stringToColorHex(folder.name);
                return (
                  <a
                    key={folder.id}
                    href={`/dashboard/folder/${folder.id}`}
                    className="p-6 bg-white border border-neutral-300 rounded-xl hover:border-black transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <h2 className="text-lg font-modern font-semibold group-hover:text-gray-600 transition-colors">
                          {folder.name}
                        </h2>
                      </div>
                      <span className="text-sm font-modern text-gray-500">
                        {folder.idea_count} {folder.idea_count === 1 ? 'idea' : 'ideas'}
                      </span>
                    </div>
                  </a>
                );
              })}

              {/* Uncategorized */}
              <a
                href="/dashboard/folder/uncategorized"
                className="p-6 bg-white border border-neutral-300 rounded-xl hover:border-black transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full bg-gray-400" />
                    <h2 className="text-lg font-modern font-semibold group-hover:text-gray-600 transition-colors">
                      Uncategorized
                    </h2>
                  </div>
                  <span className="text-sm font-modern text-gray-500">
                    {uncategorizedCount} {uncategorizedCount === 1 ? 'idea' : 'ideas'}
                  </span>
                </div>
              </a>
            </div>
          </main>

        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-neutral-300">
            <h3 className="text-xl font-modern font-bold mb-4">Create New Folder</h3>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-black font-modern font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-4 py-3 bg-black text-white font-modern font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}