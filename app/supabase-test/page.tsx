"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SupabaseTestPage() {
  const [message, setMessage] = useState("Testing Supabase...");

  useEffect(() => {
    async function testSupabase() {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      setMessage(
        data.session
          ? "Supabase connected. User session found."
          : "Supabase connected. No user logged in yet."
      );
    }

    testSupabase();
  }, []);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-4xl font-black">Supabase Test</h1>
      <p className="mt-4 text-zinc-400">{message}</p>
    </main>
  );
}