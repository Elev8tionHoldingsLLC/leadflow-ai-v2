"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Brain,
  Building2,
  CalendarClock,
  CheckCircle2,
  Flame,
  Lightbulb,
  MapPin,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Buyer, Deal, Market } from "@/types/leadflow";
import { fetchDeals } from "@/lib/database/deals";
import { fetchBuyers } from "@/lib/database/buyers";
import { fetchMarkets } from "@/lib/database/markets";
import {
  getDateOnly,
  getHighestDeal,
  getHighestMarket,
  getLowestDeal,
} from "@/lib/scoring";

export default function InsightsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadInsightsData() {
      try {
        setLoading(true);
        setMessage("");

        const [fetchedDeals, fetchedBuyers, fetchedMarkets] =
          await Promise.all([fetchDeals(), fetchBuyers(), fetchMarkets()]);

        setDeals(fetchedDeals);
        setBuyers(fetchedBuyers);
        setMarkets(fetchedMarkets);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load insights data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInsightsData();
  }, []);

  const insights = useMemo(() => {
    const activeDeals = deals.filter(
      (deal) => deal.status !== "Closed" && deal.status !== "Dead Lead"
    );

    const closedDeals = deals.filter((deal) => deal.status === "Closed");

    const bestLead = getHighestDeal(deals);
    const weakestLead = getLowestDeal(deals);

    const today = getDateOnly(new Date());

    const overdueFollowUps = deals.filter((deal) => {
      if (!deal.nextFollowUp) return false;
      return deal.nextFollowUp < today;
    });

    const dueToday = deals.filter((deal) => deal.nextFollowUp === today);

    const highPriority = deals.filter((deal) => deal.priority === "High");

    const bestMarket = getHighestMarket(markets, "personalRating");
    const strongestInvestorMarket = getHighestMarket(markets, "investorActivity");

    const buyerCoverage =
      buyers.length === 0
        ? "No buyers saved yet"
        : buyers.length < 5
        ? "Low buyer coverage"
        : buyers.length < 15
        ? "Decent buyer coverage"
        : "Strong buyer coverage";

    const suggestedActions = generateSuggestedActions({
      deals,
      buyers,
      markets,
      overdueFollowUps,
      dueToday,
      bestLead,
      bestMarket,
    });

    return {
      activeDeals,
      closedDeals,
      bestLead,
      weakestLead,
      overdueFollowUps,
      dueToday,
      highPriority,
      bestMarket,
      strongestInvestorMarket,
      buyerCoverage,
      suggestedActions,
    };
  }, [deals, buyers, markets]);

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
            AI Insights
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            Deal Intelligence
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Review your saved deals, buyers, tasks, and markets to see where
            your attention should go next.
          </p>
        </div>

        {message && (
          <div className="mb-8 rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-red-400">
            <p className="font-bold">{message}</p>
          </div>
        )}

{loading ? (
  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
    <p className="font-bold text-zinc-400">Loading insights...</p>
  </div>
) : deals.length === 0 && buyers.length === 0 && markets.length === 0 ? (
  <section className="rounded-3xl border border-dashed border-cyan-400/20 bg-zinc-950 p-10 text-center">
    <Brain className="mx-auto mb-5 h-12 w-12 text-zinc-700" />

    <h2 className="text-3xl font-black text-white">
      No insights yet
    </h2>

    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
      LeadFlow needs saved deals, buyers, or markets before it can generate
      useful recommendations. Start by analyzing a property or adding your first
      lead.
    </p>

    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Link
        href="/analyzer"
        className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400"
      >
        Open Analyzer
      </Link>

      <Link
        href="/deals"
        className="inline-flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-4 font-black text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
      >
        Add Lead
      </Link>
    </div>
  </section>
) : (
  <>
            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <InsightStat
                title="Active Deals"
                value={String(insights.activeDeals.length)}
                detail="Currently in motion"
                icon={Building2}
                color="cyan"
              />

              <InsightStat
                title="Overdue Follow-Ups"
                value={String(insights.overdueFollowUps.length)}
                detail="Need attention"
                icon={AlertTriangle}
                color="red"
              />

              <InsightStat
                title="Buyers Saved"
                value={String(buyers.length)}
                detail={insights.buyerCoverage}
                icon={Users}
                color="green"
              />

              <InsightStat
                title="Markets Tracked"
                value={String(markets.length)}
                detail="Watchlist size"
                icon={MapPin}
                color="cyan"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-3xl border border-green-400/20 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Best Lead</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Highest saved deal score.
                    </p>
                  </div>

                  <Flame className="h-6 w-6 text-green-400" />
                </div>

                {insights.bestLead ? (
                  <LeadInsightCard deal={insights.bestLead} variant="best" />
                ) : (
                  <EmptyState text="No saved leads yet." />
                )}
              </section>

              <section className="rounded-3xl border border-red-400/20 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Weakest Lead</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Lowest score. Review or remove weak opportunities.
                    </p>
                  </div>

                  <ShieldAlert className="h-6 w-6 text-red-400" />
                </div>

                {insights.weakestLead ? (
                  <LeadInsightCard deal={insights.weakestLead} variant="weak" />
                ) : (
                  <EmptyState text="No weak leads to review yet." />
                )}
              </section>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Market Focus</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Best saved market and investor activity signals.
                    </p>
                  </div>

                  <TrendingUp className="h-6 w-6 text-cyan-400" />
                </div>

                <div className="space-y-4">
                  {insights.bestMarket ? (
                    <MarketInsightCard
                      title="Highest Rated Market"
                      market={insights.bestMarket}
                      metric={`${insights.bestMarket.personalRating}/100 rating`}
                    />
                  ) : (
                    <EmptyState text="No markets saved yet." />
                  )}

                  {insights.strongestInvestorMarket ? (
                    <MarketInsightCard
                      title="Strongest Investor Activity"
                      market={insights.strongestInvestorMarket}
                      metric={`${insights.strongestInvestorMarket.investorActivity}/100 investor activity`}
                    />
                  ) : (
                    <EmptyState text="No investor activity data yet." />
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Suggested Next Actions</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Practical priorities based on your saved data.
                    </p>
                  </div>

                  <Lightbulb className="h-6 w-6 text-green-400" />
                </div>

                <div className="space-y-4">
                  {insights.suggestedActions.map((action) => (
                    <ActionCard key={action.title} action={action} />
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Task Pressure</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Follow-up urgency from your saved leads.
                  </p>
                </div>

                <CalendarClock className="h-6 w-6 text-cyan-400" />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <PressureCard
                  title="Overdue"
                  value={String(insights.overdueFollowUps.length)}
                  text="Follow-ups already past due."
                  href="/tasks"
                />

                <PressureCard
                  title="Due Today"
                  value={String(insights.dueToday.length)}
                  text="Tasks scheduled for today."
                  href="/tasks"
                />

                <PressureCard
                  title="High Priority"
                  value={String(insights.highPriority.length)}
                  text="Leads marked high priority."
                  href="/tasks"
                />
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-black">Real AI comes later</h2>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                This page is currently rule-based intelligence using your
                Supabase data. Later, we can connect real AI summaries, call
                notes, comp reasoning, and buyer outreach suggestions.
              </p>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function generateSuggestedActions({
  deals,
  buyers,
  markets,
  overdueFollowUps,
  dueToday,
  bestLead,
  bestMarket,
}: {
  deals: Deal[];
  buyers: Buyer[];
  markets: Market[];
  overdueFollowUps: Deal[];
  dueToday: Deal[];
  bestLead: Deal | null;
  bestMarket: Market | null;
}) {
  const actions: {
    title: string;
    text: string;
    href: string;
    icon: React.ElementType;
    color: "cyan" | "green" | "red";
  }[] = [];

  if (overdueFollowUps.length > 0) {
    actions.push({
      title: "Handle overdue follow-ups first",
      text: `${overdueFollowUps.length} lead(s) are past due. Clear those before adding new work.`,
      href: "/tasks",
      icon: AlertTriangle,
      color: "red",
    });
  }

  if (dueToday.length > 0) {
    actions.push({
      title: "Work today's follow-ups",
      text: `${dueToday.length} task(s) are scheduled for today. Keep the pipeline warm.`,
      href: "/tasks",
      icon: CalendarClock,
      color: "cyan",
    });
  }

  if (bestLead) {
    actions.push({
      title: "Prioritize your strongest lead",
      text: `${bestLead.address} has the highest saved score. Push it forward or match it with buyers.`,
      href: `/deals/${bestLead.id}`,
      icon: Target,
      color: "green",
    });
  }

  if (buyers.length < 5) {
    actions.push({
      title: "Build more buyer coverage",
      text: "Your buyer database is still light. Add more buyers before relying on matching.",
      href: "/buyers",
      icon: Users,
      color: "cyan",
    });
  }

  if (markets.length < 3) {
    actions.push({
      title: "Track more markets",
      text: "Add more market watchlist entries so you can compare where to hunt.",
      href: "/markets",
      icon: MapPin,
      color: "cyan",
    });
  }

  if (bestMarket) {
    actions.push({
      title: "Study your best market",
      text: `${bestMarket.name} is currently your highest-rated market. Look for leads there.`,
      href: "/markets",
      icon: TrendingUp,
      color: "green",
    });
  }

  if (deals.length === 0) {
    actions.push({
      title: "Analyze your first property",
      text: "Start with the Property Analyzer, then save the lead into your pipeline.",
      href: "/analyzer",
      icon: Brain,
      color: "cyan",
    });
  }

  if (actions.length === 0) {
    actions.push({
      title: "System looks clean",
      text: "No urgent alerts right now. Keep adding leads, buyers, and market data.",
      href: "/dashboard",
      icon: CheckCircle2,
      color: "green",
    });
  }

  return actions.slice(0, 5);
}

function InsightStat({
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
  color: "cyan" | "green" | "red";
}) {
  const accent =
    color === "green"
      ? "border-green-400/20 text-green-400"
      : color === "red"
      ? "border-red-400/20 text-red-400"
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

function LeadInsightCard({
  deal,
  variant,
}: {
  deal: Deal;
  variant: "best" | "weak";
}) {
  const style =
    variant === "best"
      ? "border-green-400/20 hover:border-green-400/40"
      : "border-red-400/20 hover:border-red-400/40";

  return (
    <Link
      href={`/deals/${deal.id}`}
      className={`block rounded-2xl border bg-black p-5 transition hover:-translate-y-1 ${style}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white">{deal.address}</h3>
          <p className="mt-1 text-sm text-zinc-600">{deal.market}</p>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-cyan-300">
          <p className="text-2xl font-black">{deal.dealScore}/100</p>
        </div>
      </div>

      <p className="line-clamp-3 text-sm leading-6 text-zinc-500">
        {deal.notes}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm font-bold text-cyan-400">
        Open lead
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function MarketInsightCard({
  title,
  market,
  metric,
}: {
  title: string;
  market: Market;
  metric: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm font-bold text-zinc-500">{title}</p>
      <h3 className="mt-2 text-2xl font-black text-white">{market.name}</h3>
      <p className="mt-1 text-sm text-cyan-400">{metric}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
        {market.notes}
      </p>
    </div>
  );
}

function ActionCard({
  action,
}: {
  action: {
    title: string;
    text: string;
    href: string;
    icon: React.ElementType;
    color: "cyan" | "green" | "red";
  };
}) {
  const Icon = action.icon;

  const style =
    action.color === "green"
      ? "border-green-400/20 text-green-400 hover:border-green-400/40"
      : action.color === "red"
      ? "border-red-400/20 text-red-400 hover:border-red-400/40"
      : "border-cyan-400/20 text-cyan-400 hover:border-cyan-400/40";

  return (
    <Link
      href={action.href}
      className={`block rounded-2xl border bg-black p-5 transition hover:-translate-y-1 ${style}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <h3 className="font-black text-white">{action.title}</h3>
      </div>

      <p className="text-sm leading-6 text-zinc-500">{action.text}</p>
    </Link>
  );
}

function PressureCard({
  title,
  value,
  text,
  href,
}: {
  title: string;
  value: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-800 bg-black p-5 transition hover:-translate-y-1 hover:border-cyan-400/40"
    >
      <p className="text-sm font-bold text-zinc-500">{title}</p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-600">{text}</p>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/40 p-6 text-center">
      <p className="text-sm text-zinc-600">{text}</p>
    </div>
  );
}