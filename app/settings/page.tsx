"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Database,
  Download,
  HardDrive,
  RotateCcw,
  Settings2,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
            Settings
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            System Settings
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            LeadFlow is now powered by Supabase. Data is connected to your
            logged-in account instead of only living in browser storage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <SettingCard
            title="Database"
            text="Deals, buyers, markets, and profile data now save to Supabase."
            icon={Database}
          />

          <SettingCard
            title="Authentication"
            text="Your app uses Supabase Auth for login, signup, and sessions."
            icon={Shield}
          />

          <SettingCard
            title="Exports"
            text="Download CSV files and full backups from the Export page."
            icon={Download}
            href="/export"
          />

          <SettingCard
            title="Profile"
            text="Update your name, role, image path, and tagline."
            icon={Settings2}
            href="/personalization"
          />
        </div>

        <section className="mt-8 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-black text-yellow-300">
              Local storage cleanup
            </h2>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
            Since Supabase is now the main database, old browser storage is no
            longer the source of truth. Do not factory reset Supabase data from
            this page yet. Deleting live database records should be handled with
            a safer admin panel later.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center gap-3">
            <HardDrive className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-black">Current storage mode</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <StatusBox title="Deals" value="Supabase" />
            <StatusBox title="Buyers" value="Supabase" />
            <StatusBox title="Markets" value="Supabase" />
            <StatusBox title="Profile" value="Supabase" />
            <StatusBox title="Auth" value="Supabase" />
            <StatusBox title="Backups" value="Export only" />
          </div>
        </section>
        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
  <div className="flex items-center gap-3">
    <Settings2 className="h-6 w-6 text-cyan-400" />
    <h2 className="text-2xl font-black">Future controls</h2>
  </div>

  <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
    These systems are not active yet, but this is where future automation
    settings can live once the core app is stable.
  </p>

  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <DisabledFeature title="AI Calling" />
    <DisabledFeature title="SMS Follow-Ups" />
    <DisabledFeature title="Comp Pulling" />
    <DisabledFeature title="Skip Tracing" />
  </div>
</section>
        <section className="mt-8 rounded-3xl border border-red-400/20 bg-red-400/10 p-6">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-6 w-6 text-red-400" />
            <h2 className="text-2xl font-black text-red-300">
              Reset controls disabled
            </h2>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
            The old local reset buttons were removed because they only cleared
            browser storage. Now that the app uses Supabase, reset/delete tools
            should be built carefully with confirmations, account ownership
            checks, and database-safe delete functions.
          </p>
        </section>
      </section>
    </main>
  );
}

function SettingCard({
  title,
  text,
  icon: Icon,
  href,
}: {
  title: string;
  text: string;
  icon: React.ElementType;
  href?: string;
}) {
  const content = (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
        <Icon className="h-6 w-6" />
      </div>

      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function StatusBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-sm font-bold text-zinc-500">{title}</p>
      <p className="mt-2 text-xl font-black text-cyan-400">{value}</p>
    </div>
  );
}
function DisabledFeature({ title }: { title: string }) {
  return (
    <div className="cursor-not-allowed rounded-2xl border border-zinc-800 bg-black p-4 opacity-50">
      <p className="font-black text-white">{title}</p>
      <p className="mt-2 text-sm text-zinc-600">Coming soon</p>
    </div>
  );
}