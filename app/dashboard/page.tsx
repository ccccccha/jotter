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

function readableTextColor(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.6 ? 'black' : 'white';
}

type Folder = { id: string; name: string; idea_count: number };
type Idea = {
  id: string;
  title: string | null;
  description: string;
  tags: string[] | null;
  folder_id: string | null;
  created_at: string;
};

const DAILY_PROMPTS = [
  "What idea has been floating around in your head all day?",
  "What random thought made you pause today?",
  "What's one thing you want to remember from today?",
  "What sparked your curiosity today?",
  "What would you tell your future self about today?",
  "What's a fleeting thought worth capturing?",
  "What problem did you notice today that no one's solving?"
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);
  const [search, setSearch] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const [dailyPrompt, setDailyPrompt] = useState('');

  useEffect(() => {
    loadUser();
    // Set daily prompt based on day of week (0-6)
    const dayOfWeek = new Date().getDay();
    setDailyPrompt(DAILY_PROMPTS[dayOfWeek]);
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
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

  async function loadDashboardData() {
    // Load folders
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
            .eq('folder_id', folder.id)
            .eq('user_id', user.id);
          return { ...folder, idea_count: count || 0 };
        })
      );
      setFolders(foldersWithCounts);
    }

    // Load uncategorized count
    const { count } = await supabase
      .from('ideas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('folder_id', null);
    setUncategorizedCount(count || 0);

    // Load recent ideas (last 5)
    const { data: ideasData } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ideasData) {
      setRecentIdeas(ideasData);
    }

    // Calculate popular tags from ALL user's ideas
    const { data: allIdeas } = await supabase
      .from('ideas')
      .select('tags')
      .eq('user_id', user.id);

    if (allIdeas && allIdeas.length > 0) {
      const tagCount: { [key: string]: number } = {};
      
      allIdeas.forEach((idea) => {
        if (idea.tags && Array.isArray(idea.tags)) {
          idea.tags.forEach((tag) => {
            if (tag && tag.trim()) {
              const normalizedTag = tag.trim().toLowerCase();
              tagCount[normalizedTag] = (tagCount[normalizedTag] || 0) + 1;
            }
          });
        }
      });

      const sortedTags = Object.entries(tagCount)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setPopularTags(sortedTags);
    } else {
      setPopularTags([]);
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;

    const { error } = await supabase
      .from('folders')
      .insert([{ name: newFolderName.trim(), user_id: user.id }]);

    if (!error) {
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadDashboardData();
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
          <main className="max-w-6xl mx-auto py-6 md:py-10 space-y-8 md:space-y-12">
            
            {/* Daily Prompt Section */}
            <section className="text-center py-6 md:py-8 border-b border-gray-200">
              <p className="text-xs md:text-sm font-modern text-gray-500 uppercase tracking-wide mb-2 md:mb-3">Today's Prompt</p>
              <h1 className="text-2xl md:text-4xl font-classic italic text-gray-800 mb-4 md:mb-6 leading-relaxed px-4">
                {dailyPrompt}
              </h1>
              <button
                onClick={() => router.push('/dashboard/add')}
                className="px-6 md:px-8 py-3 md:py-4 bg-pink-600 text-white font-modern font-bold text-base md:text-lg rounded-xl hover:bg-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Capture This Moment
              </button>
            </section>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <section>
                <h2 className="text-lg md:text-xl font-modern font-bold mb-3 md:mb-4">Your Popular Tags</h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {popularTags.map(({ tag, count }) => (
                    <a
                      key={tag}
                      href={`/dashboard/ideas?tag=${encodeURIComponent(tag)}`}
                      className="px-3 md:px-4 py-2 bg-black text-white font-modern font-bold text-xs md:text-sm rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 cursor-pointer"
                    >
                      #{tag} <span className="opacity-75">({count})</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Folders Section */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3">
                <h2 className="text-lg md:text-xl font-modern font-bold">Your Folders</h2>
                <div className="flex gap-2 md:gap-3">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search folders..."
                    className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500"
                  />
                  <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="px-3 md:px-4 py-2 bg-black text-white font-modern font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap text-sm"
                  >
                    + New
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredFolders.map((folder) => {
                  const color = stringToColorHex(folder.name);
                  return (
                    <a
                      key={folder.id}
                      href={`/dashboard/folder/${folder.id}`}
                      className="p-3 md:p-4 bg-white border border-neutral-300 rounded-xl hover:border-black transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <h3 className="text-sm font-modern font-semibold truncate group-hover:text-gray-600 transition-colors">
                          {folder.name}
                        </h3>
                      </div>
                      <p className="text-xs font-modern text-gray-500">
                        {folder.idea_count} {folder.idea_count === 1 ? 'idea' : 'ideas'}
                      </p>
                    </a>
                  );
                })}

                {/* Uncategorized */}
                <a
                  href="/dashboard/folder/uncategorized"
                  className="p-3 md:p-4 bg-white border border-neutral-300 rounded-xl hover:border-black transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
                    <h3 className="text-sm font-modern font-semibold truncate group-hover:text-gray-600 transition-colors">
                      Uncategorized
                    </h3>
                  </div>
                  <p className="text-xs font-modern text-gray-500">
                    {uncategorizedCount} {uncategorizedCount === 1 ? 'idea' : 'ideas'}
                  </p>
                </a>
              </div>
            </section>

            {/* Recent Ideas */}
            {recentIdeas.length > 0 && (
              <section className="pb-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-lg md:text-xl font-modern font-bold">Recent Ideas</h2>
                  <a
                    href="/dashboard/ideas"
                    className="text-sm font-modern text-pink-600 hover:text-pink-700 font-semibold"
                  >
                    View All →
                  </a>
                </div>

                <div className="space-y-3">
                  {recentIdeas.map((idea) => {
                    const folder = folders.find((f) => f.id === idea.folder_id);
                    const folderColor = folder ? stringToColorHex(folder.name) : '#71717A';
                    const textColor = readableTextColor(folderColor);

                    return (
                      <div
                        key={idea.id}
                        className="p-3 md:p-4 bg-gray-50 border border-neutral-200 rounded-xl hover:border-neutral-400 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                          <div className="flex-1 min-w-0">
                            {folder && (
                              <span
                                className="inline-block px-2 py-1 text-xs font-modern font-bold rounded mb-2"
                                style={{ backgroundColor: folderColor, color: textColor }}
                              >
                                {folder.name}
                              </span>
                            )}
                            <h3 className="text-sm md:text-base font-modern font-semibold mb-1">
                              {idea.title || '(No title)'}
                            </h3>
                            <p className="text-xs md:text-sm font-classic text-gray-600 line-clamp-2">
                              {idea.description}
                            </p>
                            {idea.tags && idea.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {idea.tags.slice(0, 3).map((tag, i) => (
                                  <span key={i} className="text-xs font-modern text-gray-500">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-modern text-gray-400 whitespace-nowrap">
                            {new Date(idea.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </main>

        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md border border-neutral-300">
            <h3 className="text-lg md:text-xl font-modern font-bold mb-4">Create New Folder</h3>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
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