"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex items-center justify-between">
      {/* Logo left */}
      <Link href="/" className="font-bold text-lg tracking-tight">
        JOTTER.
      </Link>

      {/* Menu right */}
      <div className="flex items-center space-x-6 text-sm font-medium">
        <Link href="/dashboard" className="hover:opacity-70 transition">Home</Link>
        <Link href="/add" className="hover:opacity-70 transition">Add Idea</Link>
        <Link href="/ideas" className="hover:opacity-70 transition">Idea Box</Link>

        {/* Logout */}
        <button
          onClick={() => console.log("logging out...")}
          className="hover:opacity-70 transition"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
