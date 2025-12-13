'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddIdeaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [manualTag, setManualTag] = useState('');
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | 'new' | ''>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) loadFolders();
  }, [user]);

  useEffect(() => {
    const found = Array.from(
      new Set(
        (description.match(/#\w+/g) || []).map((t) => t.replace('#', ''))
      )
    );
    setTagsArray(found);
  }, [description]);

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) router.push('/login');
    else setUser(data.user);
  }

  async function loadFolders() {
    const { data } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (data) setFolders(data);
  }

  function addManualTag() {
    const tag = manualTag.trim().replace(/^#/, '');
    if (!tag) return;
    if (!tagsArray.includes(tag)) setTagsArray((prev) => [...prev, tag]);
    setManualTag('');
  }

  function removeTag(tag: string) {
    setTagsArray((prev) => prev.filter((x) => x !== tag));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let folderId = selectedFolder === 'new' ? null : selectedFolder || null;

      if (selectedFolder === 'new' && newFolderName.trim()) {
        const { data: newFolder, error: folderErr } = await supabase
          .from('folders')
          .insert([{ name: newFolderName.trim(), user_id: user.id }])
          .select()
          .single();

        if (folderErr) throw folderErr;
        folderId = newFolder.id;
        setFolders((prev) => [...prev, newFolder]);
      }

      const localTime = new Date().toISOString();

      const { error } = await supabase.from('ideas').insert([
        {
          user_id: user.id,
          title: title || null,
          description,
          tags: tagsArray,
          folder_id: folderId,
          created_at: localTime,
        },
      ]);

      if (error) throw error;

      setTitle('');
      setDescription('');
      setTagsArray([]);
      setSelectedFolder('');
      setNewFolderName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);

      router.push('/dashboard/ideas');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save idea: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

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
              <a href="/dashboard" className="hover:text-gray-600 transition-colors">
                Home
              </a>
              <a href="/dashboard/add" className="hover:text-gray-600 transition-colors font-semibold">
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
            <a href="/dashboard/add" className="hover:text-gray-600 transition-colors font-semibold">
              Add Idea
            </a>
            <a href="/dashboard/ideas" className="hover:text-gray-600 transition-colors">
              Idea Box
            </a>
          </nav>

          {/* Main Content */}
          <main className="max-w-2xl mx-auto py-10">
            <h1 className="text-3xl font-modern font-bold mb-2">Add Idea</h1>
            <p className="font-classic italic text-gray-600 mb-8">
              Capture your thoughts before they slip away
            </p>

            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm font-modern">
                Idea saved successfully!
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-modern font-semibold mb-2">
                  Title <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your idea a title..."
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-modern font-semibold mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Write your idea... (use #tag for hashtags)"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500 resize-none"
                />
              </div>

              {tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagsArray.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-xs font-modern"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={manualTag}
                  onChange={(e) => setManualTag(e.target.value)}
                  placeholder="Add tag manually"
                  className="flex-1 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500"
                />
                <button
                  type="button"
                  onClick={addManualTag}
                  className="px-4 py-2 bg-blue-600 text-white font-modern font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Tag
                </button>
              </div>

              <div>
                <label htmlFor="folder" className="block text-sm font-modern font-semibold mb-2">
                  Folder <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <select
                  id="folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors"
                >
                  <option value="">Select folder (optional)</option>
                  <option value="new">+ Create new folder</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFolder === 'new' && (
                <div>
                  <label htmlFor="newFolder" className="block text-sm font-modern font-semibold mb-2">
                    New Folder Name
                  </label>
                  <input
                    id="newFolder"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-sm font-modern focus:outline-none focus:border-black transition-colors placeholder-neutral-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !description.trim()}
                  className="flex-1 py-3 bg-black text-white font-modern font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Idea'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-gray-200 text-black font-modern font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}