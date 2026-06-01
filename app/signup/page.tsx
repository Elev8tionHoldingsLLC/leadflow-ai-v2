"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, Mail, UserPlus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signup() {
    setLoading(true);
    setMessage("");

    const origin = window.location.origin;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your account, then log in."
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-xl items-center">
        <div className="w-full rounded-3xl border border-cyan-400/20 bg-zinc-950 p-8 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
          <div className="mb-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
              Signup
            </p>

            <h1 className="text-4xl font-black">Create Account</h1>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Create your LeadFlow AI account.
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
              onClick={signup}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-5 w-5" />
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm font-bold text-cyan-300">
              {message}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-cyan-400 hover:text-green-400">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}