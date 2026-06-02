"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Flame,
  MapPin,
  Shield,
  Target,
  User,
  Users,
} from "lucide-react";
import type { Buyer, Deal, Market, ProfileSettings } from "@/types/leadflow";
import { DEFAULT_PROFILE } from "@/types/leadflow";
import { fetchBuyers } from "@/lib/database/buyers";
import { fetchDeals } from "@/lib/database/deals";
import { fetchMarkets } from "@/lib/database/markets";
import { fetchProfile } from "@/lib/database/profile";
import {
  calculateSystemScore,
  getHighestDeal,
  getHighestMarket,
} from "@/lib/scoring";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfilePage() {
      try {
        setLoading(true);
        setMessage("");

        const [fetchedProfile, fetchedDeals, fetchedBuyers, fetchedMarkets] =
          await Promise.all([
            fetchProfile(),
            fetchDeals(),
            fetchBuyers(),
            fetchMarkets(),
          ]);

        setProfile(fetchedProfile);
        setDeals(fetchedDeals);
        setBuyers(fetchedBuyers);
        setMarkets(fetchedMarkets);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfilePage();
  }, []);

  const stats = useMemo(() => {
    const activeDeals = deals.filter(
      (deal) => deal.status !== "Closed" && deal.status !== "Dead Lead"
    ).length;

    const closedDeals = deals.filter((deal) => deal.status === "Closed").length;

    const bestDeal = getHighestDeal(deals);

    const highPriorityTasks = deals.filter(
      (deal) => deal.priority === "High"
    ).length;

    const totalTasks = deals.filter(
      (deal) => deal.nextFollowUp || deal.nextAction || deal.priority
    ).length;

    const bestMarket = getHighestMarket(markets, "personalRating");

    const systemStrength = calculateSystemScore({
      deals: deals.length,
      buyers: buyers.length,
      markets: markets.length,
      tasks: totalTasks,
    });

    return {
      activeDeals,
      closedDeals,
      bestDeal,
      highPriorityTasks,
      totalTasks,
      bestMarket,
      systemStrength,
    };
  }, [deals, buyers, markets]);

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
            Profile
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            Operator Profile
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Your personal command profile and business system overview.
          </p>
        </div>

        {message && (
          <div className="mb-8 rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-red-400">
            <p className="font-bold">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
            <p className="font-bold text-zinc-400">Loading profile...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <section className="rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                <div className="flex flex-col items-center text-center">
                  <div className="h-32 w-32 overflow-hidden rounded-full border border-cyan-400/30 shadow-[0_0_35px_rgba(34,211,238,0.2)]">
                    <img
                      src={profile.profileImage || DEFAULT_PROFILE.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <h2 className="mt-6 text-3xl font-black text-white">
                    {profile.displayName}
                  </h2>

                  <p className="mt-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
                    {profile.role}
                  </p>

                  <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-500">
                    {profile.tagline}
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  <ProfileLink
                    href="/personalization"
                    title="Edit Profile"
                    text="Change your name, role, image, and tagline."
                  />

                  <ProfileLink
                    href="/dashboard"
                    title="Open Dashboard"
                    text="View your business command center."
                  />
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                <StatCard
                  title="Total Deals"
                  value={String(deals.length)}
                  detail="Saved pipeline records"
                  icon={Building2}
                  color="cyan"
                />

                <StatCard
                  title="Active Deals"
                  value={String(stats.activeDeals)}
                  detail="Currently being worked"
                  icon={Target}
                  color="green"
                />

                <StatCard
                  title="Buyers Saved"
                  value={String(buyers.length)}
                  detail="Buyer database size"
                  icon={Users}
                  color="cyan"
                />

                <StatCard
                  title="Markets Tracked"
                  value={String(markets.length)}
                  detail="Market intelligence entries"
                  icon={MapPin}
                  color="green"
                />

                <StatCard
                  title="Follow-Up Tasks"
                  value={String(stats.totalTasks)}
                  detail={`${stats.highPriorityTasks} high priority`}
                  icon={CheckCircle2}
                  color="cyan"
                />

                <StatCard
                  title="System Strength"
                  value={`${stats.systemStrength}/100`}
                  detail="Based on saved app data"
                  icon={Shield}
                  color="green"
                />
              </section>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <section className="rounded-3xl border border-green-400/20 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Best Deal</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Highest score in your saved pipeline.
                    </p>
                  </div>

                  <Flame className="h-6 w-6 text-green-400" />
                </div>

                {stats.bestDeal ? (
                  <Link
                    href={`/deals/${stats.bestDeal.id}`}
                    className="block rounded-2xl border border-zinc-800 bg-black p-5 transition hover:-translate-y-1 hover:border-green-400/40"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black text-white">
                          {stats.bestDeal.address}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600">
                          {stats.bestDeal.market}
                        </p>
                      </div>

                      <span className="rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-2 text-lg font-black text-green-400">
                        {stats.bestDeal.dealScore}/100
                      </span>
                    </div>

                    <p className="line-clamp-3 text-sm leading-6 text-zinc-500">
                      {stats.bestDeal.notes}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm font-bold text-cyan-400">
                      Open lead
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </Link>
                ) : (
                  <EmptyState
  text="No deals saved yet. Analyze your first property or add a lead manually to start building your operator profile."
  href="/analyzer"
  buttonText="Analyze First Deal"
/>
                )}
              </section>

              <section className="rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Best Market</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Highest personal market rating.
                    </p>
                  </div>

                  <BadgeCheck className="h-6 w-6 text-cyan-400" />
                </div>

                {stats.bestMarket ? (
                  <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                    <h3 className="text-xl font-black text-white">
                      {stats.bestMarket.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      ZIP / Area: {stats.bestMarket.zip}
                    </p>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <MiniMetric
                        label="Rating"
                        value={`${stats.bestMarket.personalRating}/100`}
                      />
                      <MiniMetric
                        label="Investor Activity"
                        value={`${stats.bestMarket.investorActivity}/100`}
                      />
                      <MiniMetric
                        label="Competition"
                        value={`${stats.bestMarket.competitionScore}/100`}
                      />
                    </div>

                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-500">
                      {stats.bestMarket.notes}
                    </p>
                  </div>
                ) : (
                  <EmptyState
  text="No markets saved yet. Add your first market so LeadFlow can start tracking your strongest hunting areas."
  href="/markets"
  buttonText="Add First Market"
/>
                )}
              </section>
            </div>

            <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-black">Operator Status</h2>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                Your system is strongest when you have deals being analyzed,
                buyers saved for disposition, markets tracked for strategy, and
                follow-up tasks scheduled so leads do not go cold.
              </p>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function ProfileLink({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-zinc-800 bg-black p-4 text-left transition hover:border-cyan-400/40"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-black text-white">{title}</p>
          <p className="mt-1 text-sm text-zinc-600">{text}</p>
        </div>

        <ArrowUpRight className="h-5 w-5 text-cyan-400" />
      </div>
    </Link>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  color: "cyan" | "green";
}) {
  const accent =
    color === "green"
      ? "border-green-400/20 text-green-400"
      : "border-cyan-400/20 text-cyan-400";

  return (
    <div className={`rounded-3xl border bg-zinc-950 p-5 ${accent}`}>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-500">{title}</p>
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-4xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs font-bold text-zinc-600">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function EmptyState({
  text,
  href,
  buttonText,
}: {
  text: string;
  href?: string;
  buttonText?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/40 p-6 text-center">
      <p className="mx-auto max-w-md text-sm leading-6 text-zinc-600">
        {text}
      </p>

      {href && buttonText && (
        <Link
          href={href}
          className="mt-5 inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-5 py-3 font-black text-black transition hover:bg-green-400"
        >
          {buttonText}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}