"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    }
    checkUser();
  }, [router]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.email} 🎉</h1>
      <p className="mb-6">This is your dashboard. Manage your ideas here.</p>

      <a
        href="/dashboard/add"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition-colors"
      >
        💡 Add New Idea
      </a>
    </div>
  );
}
