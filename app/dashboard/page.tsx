"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
  Workflow,
} from "lucide-react";
import type { Deal, DealStatus } from "@/types/leadflow";
import { DEAL_STAGES } from "@/types/leadflow";
import { getHighestDeal } from "@/lib/scoring";
import { fetchDeals } from "@/lib/database/deals";

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true);
        setMessage("");

        const fetchedDeals = await fetchDeals();
        setDeals(fetchedDeals);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, []);

  const dashboard = useMemo(() => {
    const totalLeads = deals.length;

    const activeDeals = deals.filter(
      (deal) => deal.status !== "Closed" && deal.status !== "Dead Lead"
    ).length;

    const closedDeals = deals.filter((deal) => deal.status === "Closed").length;

    const averageScore =
      deals.length === 0
        ? 0
        : Math.round(
            deals.reduce(
              (total, deal) => total + Number(deal.dealScore || 0),
              0
            ) / deals.length
          );

    const highestScoreLead = getHighestDeal(deals);
    const recentDeals = deals.slice(0, 5);

    const stageCounts = DEAL_STAGES.map((stage) => ({
      stage,
      count: deals.filter((deal) => deal.status === stage).length,
    }));

    return {
      totalLeads,
      activeDeals,
      closedDeals,
      averageScore,
      highestScoreLead,
      recentDeals,
      stageCounts,
    };
  }, [deals]);

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
              Dashboard
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Business Command Center
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
              Track your saved leads, pipeline activity, deal scores, and
              business momentum.
            </p>
          </div>

          <Link
            href="/analyzer"
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:scale-[1.02] hover:bg-green-400"
          >
            Analyze New Deal
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

        {message && (
          <div className="mb-8 rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-red-400">
            <p className="font-bold">{message}</p>
          </div>
        )}

{loading ? (
  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
    <p className="font-bold text-zinc-400">Loading dashboard...</p>
  </div>
) : deals.length === 0 ? (
  <section className="rounded-3xl border border-dashed border-cyan-400/20 bg-zinc-950 p-10 text-center">
    <Building2 className="mx-auto mb-5 h-12 w-12 text-zinc-700" />

    <h2 className="text-3xl font-black text-white">
      No deals saved yet
    </h2>

    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
      Start by analyzing your first property, then save it into your pipeline.
      Once you do, your dashboard stats, recent leads, and pipeline breakdown
      will appear here.
    </p>

    <Link
      href="/analyzer"
      className="mt-6 inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400"
    >
      Analyze First Deal
      <ArrowUpRight className="h-5 w-5" />
    </Link>
  </section>
) : (
  <>
            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Leads"
                value={String(dashboard.totalLeads)}
                detail="Saved in pipeline"
                icon={Building2}
                color="cyan"
              />

              <StatCard
                title="Active Deals"
                value={String(dashboard.activeDeals)}
                detail="Currently being worked"
                icon={Activity}
                color="green"
              />

              <StatCard
                title="Closed Deals"
                value={String(dashboard.closedDeals)}
                detail="Marked as closed"
                icon={CheckCircle2}
                color="green"
              />

              <StatCard
                title="Average Score"
                value={`${dashboard.averageScore}/100`}
                detail="Across saved leads"
                icon={Target}
                color="cyan"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-3xl border border-green-400/20 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Highest Score Lead</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Your strongest saved opportunity.
                    </p>
                  </div>

                  <Trophy className="h-6 w-6 text-green-400" />
                </div>

                {dashboard.highestScoreLead ? (
                  <Link
                    href={`/deals/${dashboard.highestScoreLead.id}`}
                    className="block rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-green-400/40"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black text-white">
                          {dashboard.highestScoreLead.address}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {dashboard.highestScoreLead.market}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-3 text-green-400">
                        <p className="text-2xl font-black">
                          {dashboard.highestScoreLead.dealScore}/100
                        </p>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-sm leading-6 text-zinc-500">
                      {dashboard.highestScoreLead.notes}
                    </p>
                  </Link>
                ) : (
                  <EmptyState text="No saved leads yet. Analyze a property and save it to the pipeline." />
                )}
              </section>

              <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Pipeline Breakdown</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Lead count by current deal stage.
                    </p>
                  </div>

                  <Workflow className="h-6 w-6 text-cyan-400" />
                </div>

                <div className="space-y-4">
                  {dashboard.stageCounts.map((item) => (
                    <PipelineRow
                      key={item.stage}
                      stage={item.stage}
                      count={item.count}
                      total={Math.max(dashboard.totalLeads, 1)}
                    />
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Recent Leads</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Latest saved leads from your pipeline.
                  </p>
                </div>

                <Clock className="h-6 w-6 text-cyan-400" />
              </div>

              {dashboard.recentDeals.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {dashboard.recentDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:-translate-y-1 hover:border-cyan-400/40"
                    >
                      <p className="text-sm font-black text-white">
                        {deal.address}
                      </p>

                      <p className="mt-2 text-xs text-zinc-600">
                        {deal.market}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                          {deal.status}
                        </span>

                        <span className="text-sm font-black text-white">
                          {deal.dealScore}/100
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState text="No recent leads yet." />
              )}
            </section>

            <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-black">Supabase Connected</h2>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                This dashboard now reads live deal data from Supabase.
              </p>
            </section>
          </>
        )}
      </section>
    </main>
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
      ? "border-green-400/20 text-green-400 hover:border-green-400/40"
      : "border-cyan-400/20 text-cyan-400 hover:border-cyan-400/40";

  return (
    <div
      className={`rounded-3xl border bg-zinc-950 p-5 transition hover:-translate-y-1 ${accent}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-500">{title}</p>
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-4xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}

function PipelineRow({
  stage,
  count,
  total,
}: {
  stage: DealStatus;
  count: number;
  total: number;
}) {
  const width = `${Math.round((count / total) * 100)}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-white">{stage}</p>
        <p className="text-sm text-zinc-500">{count}</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-black">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all"
          style={{ width }}
        />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/40 p-6 text-center">
      <p className="text-sm text-zinc-600">{text}</p>
    </div>
  );
}