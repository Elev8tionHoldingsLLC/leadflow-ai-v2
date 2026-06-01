"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthButton({ expanded }: { expanded: boolean }) {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email || null);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  async function logout() {
    await supabase.auth.signOut();
    setEmail(null);
    window.location.href = "/login";
  }

  if (email) {
    return (
      <button
        onClick={logout}
        className={`group flex h-12 items-center border border-transparent px-3 text-zinc-400 transition-all duration-300 hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-400 ${
          expanded ? "w-full rounded-2xl" : "w-12 justify-center rounded-2xl"
        }`}
      >
        <LogOut
          className={`h-5 w-5 shrink-0 transition-all duration-300 ${
            expanded ? "mr-3" : ""
          }`}
        />

        {expanded && <span className="truncate text-sm font-semibold">Sign Out</span>}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <Link
        href="/login"
        className={`group flex h-12 items-center border border-transparent px-3 text-zinc-400 transition-all duration-300 hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-400 ${
          expanded ? "w-full rounded-2xl" : "w-12 justify-center rounded-2xl"
        }`}
      >
        <LogIn
          className={`h-5 w-5 shrink-0 transition-all duration-300 ${
            expanded ? "mr-3" : ""
          }`}
        />

        {expanded && <span className="whitespace-nowrap text-sm font-semibold">Login</span>}
      </Link>

      <Link
        href="/signup"
        className={`group flex h-12 items-center border border-transparent px-3 text-zinc-400 transition-all duration-300 hover:border-green-400/20 hover:bg-green-400/10 hover:text-green-400 ${
          expanded ? "w-full rounded-2xl" : "w-12 justify-center rounded-2xl"
        }`}
      >
        <UserPlus
          className={`h-5 w-5 shrink-0 transition-all duration-300 ${
            expanded ? "mr-3" : ""
          }`}
        />

        {expanded && <span className="whitespace-nowrap text-sm font-semibold">Signup</span>}
      </Link>
    </div>
  );
}