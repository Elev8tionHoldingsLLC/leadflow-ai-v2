"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Flame,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import type { Buyer, Deal, Market, ProfileSettings } from "@/types/leadflow";
import { DEFAULT_PROFILE } from "@/types/leadflow";
import { fetchDeals } from "@/lib/database/deals";
import { fetchBuyers } from "@/lib/database/buyers";
import { fetchMarkets } from "@/lib/database/markets";
import { fetchProfile } from "@/lib/database/profile";
import {
  calculateSystemScore,
  getDateOnly,
  getHighestDeal,
  getHighestMarket,
} from "@/lib/scoring";

export default function HomePage() {
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadHomeData() {
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
          error instanceof Error ? error.message : "Could not load home data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const homeData = useMemo(() => {
    const activeDeals = deals.filter(
      (deal) => deal.status !== "Closed" && deal.status !== "Dead Lead"
    );

    const closedDeals = deals.filter((deal) => deal.status === "Closed");
    const today = getDateOnly(new Date());

    const overdueTasks = deals.filter((deal) => {
      if (!deal.nextFollowUp) return false;
      return deal.nextFollowUp < today;
    });

    const dueToday = deals.filter((deal) => deal.nextFollowUp === today);

    const bestLead = getHighestDeal(deals);
    const recentLead = deals[0] || null;
    const bestMarket = getHighestMarket(markets, "personalRating");

    const systemScore = calculateSystemScore({
      deals: deals.length,
      buyers: buyers.length,
      markets: markets.length,
      tasks: deals.filter((deal) => deal.nextFollowUp || deal.nextAction).length,
    });

    return {
      activeDeals,
      closedDeals,
      overdueTasks,
      dueToday,
      bestLead,
      recentLead,
      bestMarket,
      systemScore,
    };
  }, [deals, buyers, markets]);

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        {message && (
          <div className="mb-8 rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-red-400">
            <p className="font-bold">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
            <p className="font-bold text-zinc-400">Loading launchpad...</p>
          </div>
        ) : (
          <>
            <div className="grid min-h-[calc(100vh-80px)] gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
              <section>
              <div className="mb-5 inline-flex items-center">
  <img
    src="/logo.png"
    alt="LeadFlow AI Logo"
    className="h-10 w-auto object-contain"
  />
</div>

                <h1 className="text-5xl font-black tracking-tight md:text-7xl">
                  Welcome back, {getFirstName(profile.displayName)}.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                  Your wholesale operating system is ready. Analyze deals, track
                  leads, match buyers, manage follow-ups, and keep your pipeline
                  moving.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/analyzer"
                    className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-7 py-4 font-black text-black transition hover:scale-[1.02] hover:bg-green-400"
                  >
                    Analyze New Property
                    <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-7 py-4 font-bold text-zinc-300 transition hover:border-cyan-400/40 hover:text-cyan-400"
                  >
                    Search Command Center
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  <MiniStatus
                    title="Active Deals"
                    value={String(homeData.activeDeals.length)}
                    icon={Building2}
                  />

                  <MiniStatus
                    title="Due Today"
                    value={String(homeData.dueToday.length)}
                    icon={CalendarClock}
                  />

                  <MiniStatus
                    title="System Score"
                    value={`${homeData.systemScore}/100`}
                    icon={ShieldCheck}
                  />
                </div>
              </section>

              <aside className="rounded-[2rem] border border-cyan-400/20 bg-zinc-950 p-6 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full border border-cyan-400/30">
                    <img
                      src={profile.profileImage || DEFAULT_PROFILE.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-black text-white">
                      {profile.displayName}
                    </h2>
                    <p className="truncate text-sm font-bold text-cyan-400">
                      {profile.role}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <LaunchCard
                    href="/dashboard"
                    icon={LayoutDashboard}
                    title="Dashboard"
                    text="View your full business command center."
                  />

                  <LaunchCard
                    href="/deals"
                    icon={Building2}
                    title="Deals Pipeline"
                    text="Review and move saved leads through stages."
                  />

                  <LaunchCard
                    href="/tasks"
                    icon={ClipboardList}
                    title="Follow-Up Tasks"
                    text="Check overdue tasks, today’s actions, and priority leads."
                  />

                  <LaunchCard
                    href="/insights"
                    icon={Brain}
                    title="AI Insights"
                    text="See system recommendations based on saved data."
                  />
                </div>
              </aside>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">
                      Continue Where You Left Off
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Jump back into your latest or strongest opportunity.
                    </p>
                  </div>

                  <Flame className="h-6 w-6 text-green-400" />
                </div>

                {homeData.recentLead ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <ContinueCard
                      title="Most Recent Lead"
                      href={`/deals/${homeData.recentLead.id}`}
                      name={homeData.recentLead.address}
                      detail={`${homeData.recentLead.market} • ${homeData.recentLead.status}`}
                      score={`${homeData.recentLead.dealScore}/100`}
                    />

                    {homeData.bestLead && (
                      <ContinueCard
                        title="Best Lead"
                        href={`/deals/${homeData.bestLead.id}`}
                        name={homeData.bestLead.address}
                        detail={`${homeData.bestLead.market} • Highest score`}
                        score={`${homeData.bestLead.dealScore}/100`}
                      />
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="No saved leads yet"
                    text="Start with the Property Analyzer and save your first deal into the pipeline."
                    href="/analyzer"
                    buttonText="Open Analyzer"
                  />
                )}
              </section>

              <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">System Status</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Quick health check across your workflow.
                    </p>
                  </div>

                  <BarChart3 className="h-6 w-6 text-cyan-400" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <StatusTile
                    title="Deals"
                    value={String(deals.length)}
                    text={`${homeData.closedDeals.length} closed`}
                    icon={Target}
                  />

                  <StatusTile
                    title="Buyers"
                    value={String(buyers.length)}
                    text="Buyer database"
                    icon={Users}
                  />

                  <StatusTile
                    title="Markets"
                    value={String(markets.length)}
                    text={
                      homeData.bestMarket
                        ? `Best: ${homeData.bestMarket.name}`
                        : "No best market yet"
                    }
                    icon={MapPin}
                  />

                  <StatusTile
                    title="Task Pressure"
                    value={String(homeData.overdueTasks.length)}
                    text="Overdue follow-ups"
                    icon={CalendarClock}
                  />
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-black">Suggested next move</h2>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                {getSuggestedMove({
                  deals: deals.length,
                  buyers: buyers.length,
                  markets: markets.length,
                  overdueTasks: homeData.overdueTasks.length,
                  dueToday: homeData.dueToday.length,
                })}
              </p>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function getFirstName(name: string) {
  return name.trim().split(" ")[0] || "Operator";
}

function getSuggestedMove({
  deals,
  buyers,
  markets,
  overdueTasks,
  dueToday,
}: {
  deals: number;
  buyers: number;
  markets: number;
  overdueTasks: number;
  dueToday: number;
}) {
  if (overdueTasks > 0) {
    return `You have ${overdueTasks} overdue follow-up(s). Handle those first before adding more leads.`;
  }

  if (dueToday > 0) {
    return `You have ${dueToday} follow-up(s) due today. Keep those conversations alive.`;
  }

  if (deals === 0) {
    return "Analyze your first property and save it to the pipeline. That gives the rest of the system something to work with.";
  }

  if (buyers < 5) {
    return "Build your buyer database next. A strong deal is easier to move when you already know who might buy it.";
  }

  if (markets < 3) {
    return "Add more markets to your watchlist so you can compare where the best hunting ground is.";
  }

  return "Your foundation is solid. Keep adding leads, updating follow-ups, and reviewing AI Insights daily.";
}

function MiniStatus({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
          {title}
        </p>
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>

      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function LaunchCard({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-cyan-400/40"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black text-white">{title}</h3>
            <ArrowUpRight className="h-4 w-4 text-zinc-600 transition group-hover:text-cyan-400" />
          </div>
          <p className="mt-1 text-sm leading-6 text-zinc-500">{text}</p>
        </div>
      </div>
    </Link>
  );
}

function ContinueCard({
  title,
  href,
  name,
  detail,
  score,
}: {
  title: string;
  href: string;
  name: string;
  detail: string;
  score: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-800 bg-black p-5 transition hover:-translate-y-1 hover:border-cyan-400/40"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
        {title}
      </p>

      <h3 className="text-xl font-black text-white">{name}</h3>
      <p className="mt-2 text-sm text-zinc-600">{detail}</p>

      <div className="mt-5 flex items-center justify-between">
        <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-black text-cyan-300">
          {score}
        </span>

        <ArrowUpRight className="h-5 w-5 text-cyan-400" />
      </div>
    </Link>
  );
}

function StatusTile({
  title,
  value,
  text,
  icon: Icon,
}: {
  title: string;
  value: string;
  text: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-zinc-500">{title}</p>
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-600">{text}</p>
    </div>
  );
}

function EmptyState({
  title,
  text,
  href,
  buttonText,
}: {
  title: string;
  text: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/40 p-6">
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-cyan-400 px-5 py-3 font-black text-black transition hover:bg-green-400"
      >
        {buttonText}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}