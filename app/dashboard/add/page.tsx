"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AddIdeaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Check logged-in user
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/login");
      else setUser(data.user);
    }
    fetchUser();
  }, [router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.from("ideas").insert([
        {
          user_id: user.id,
          title: title || null,
          description,
          tags: tags
            .split(" ")
            .map((t) => t.trim())
            .filter((t) => t.startsWith("#")),
        },
      ]);

      if (error) throw error;

      // Clear form
      setTitle("");
      setDescription("");
      setTags("");
      setMessage({ text: "Idea saved successfully! 🎉", type: "success" });
    } catch (err: any) {
      console.error("Insert error:", err);
      setMessage({ text: `Failed to save idea: ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-2xl font-semibold text-white">💡 New Idea</h1>

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick title (optional)"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="What's your idea?"
              rows={6}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#design #feature #urgent"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !description}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {loading ? "Saving..." : "✓ Save Idea"}
          </button>

          {/* Inline message */}
          {message && (
            <p
              className={`mt-2 text-sm ${
                message.type === "success" ? "text-green-400" : "text-red-500"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
