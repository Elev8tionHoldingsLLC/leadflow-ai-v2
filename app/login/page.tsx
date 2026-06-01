"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, LogIn, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const params = new URLSearchParams(window.location.search);
const next = params.get("next") || "/";

window.location.href = next;
  }

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-xl items-center">
        <div className="w-full rounded-3xl border border-cyan-400/20 bg-zinc-950 p-8 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
          <div className="mb-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
              Login
            </p>

            <h1 className="text-4xl font-black">Welcome Back</h1>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Sign in to your LeadFlow AI account.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-400">
                Email
              </span>

              <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black px-4 py-3 focus-within:border-cyan-400">
                <Mail className="h-5 w-5 text-cyan-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-transparent text-white outline-none placeholder:text-zinc-700"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-400">
                Password
              </span>

              <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black px-4 py-3 focus-within:border-cyan-400">
                <Lock className="h-5 w-5 text-cyan-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white outline-none placeholder:text-zinc-700"
                />
              </div>
            </label>

            <button
              onClick={login}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="h-5 w-5" />
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-400">
              {message}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500">
            No account yet?{" "}
            <Link href="/signup" className="font-bold text-cyan-400 hover:text-green-400">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}