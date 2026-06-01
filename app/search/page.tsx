"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import type { Buyer, Deal, Market } from "@/types/leadflow";
import { fetchDeals } from "@/lib/database/deals";
import { fetchBuyers } from "@/lib/database/buyers";
import { fetchMarkets } from "@/lib/database/markets";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSearchData() {
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
          error instanceof Error ? error.message : "Could not load search data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSearchData();
  }, []);

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return {
        deals: [],
        buyers: [],
        markets: [],
        tasks: [],
        total: 0,
      };
    }

    const dealResults = deals.filter((deal) =>
      [
        deal.address,
        deal.sellerName,
        deal.phone,
        deal.market,
        deal.estimatedValue,
        deal.mortgageBalance,
        deal.dealScore,
        deal.status,
        deal.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );

    const buyerResults = buyers.filter((buyer) =>
      [
        buyer.name,
        buyer.phone,
        buyer.email,
        buyer.markets,
        buyer.minPrice,
        buyer.maxPrice,
        buyer.buyerType,
        buyer.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );

    const marketResults = markets.filter((market) =>
      [
        market.name,
        market.zip,
        market.averagePrice,
        market.averageDom,
        market.investorActivity,
        market.competitionScore,
        market.personalRating,
        market.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );

    const taskResults = deals.filter((deal) =>
      [
        deal.address,
        deal.sellerName,
        deal.market,
        deal.nextFollowUp,
        deal.nextAction,
        deal.priority,
        deal.callOutcome,
        deal.taskNotes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );

    return {
      deals: dealResults,
      buyers: buyerResults,
      markets: marketResults,
      tasks: taskResults,
      total:
        dealResults.length +
        buyerResults.length +
        marketResults.length +
        taskResults.length,
    };
  }, [query, deals, buyers, markets]);

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
            Search
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            Command Center Search
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Search across saved deals, buyers, markets, and follow-up tasks
            from one place.
          </p>
        </div>

        {message && (
          <div className="mb-8 rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-red-400">
            <p className="font-bold">{message}</p>
          </div>
        )}

        <div className="mb-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black px-5 py-4 focus-within:border-cyan-400">
            <Search className="h-6 w-6 text-cyan-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder="Search address, seller, buyer, market, task, phone, status..."
              className="w-full bg-transparent text-lg text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <CountCard label="Deals" value={String(results.deals.length)} />
            <CountCard label="Buyers" value={String(results.buyers.length)} />
            <CountCard label="Markets" value={String(results.markets.length)} />
            <CountCard label="Tasks" value={String(results.tasks.length)} />
          </div>
        </div>

        {loading ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
            <h2 className="text-2xl font-black">Loading search data...</h2>
          </section>
        ) : !query.trim() ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
            <h2 className="text-2xl font-black">Start typing to search</h2>
            <p className="mt-2 text-zinc-500">
              Try a city, address, buyer name, task, score, or status.
            </p>
          </section>
        ) : results.total === 0 ? (
          <section className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 p-8 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
            <h2 className="text-2xl font-black">No results found</h2>
            <p className="mt-2 text-zinc-500">
              Try a different keyword or check your saved data.
            </p>
          </section>
        ) : (
          <div className="space-y-8">
            <ResultSection
              title="Deals"
              description="Saved property leads and pipeline records."
              count={results.deals.length}
              icon={Building2}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.deals.map((deal) => (
                  <DealResult key={deal.id} deal={deal} />
                ))}
              </div>
            </ResultSection>

            <ResultSection
              title="Buyers"
              description="Saved investors and buyer contacts."
              count={results.buyers.length}
              icon={Users}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.buyers.map((buyer) => (
                  <BuyerResult key={buyer.id} buyer={buyer} />
                ))}
              </div>
            </ResultSection>

            <ResultSection
              title="Markets"
              description="Saved market watchlist entries."
              count={results.markets.length}
              icon={MapPin}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.markets.map((market) => (
                  <MarketResult key={market.id} market={market} />
                ))}
              </div>
            </ResultSection>

            <ResultSection
              title="Tasks"
              description="Follow-up tasks connected to saved deals."
              count={results.tasks.length}
              icon={CalendarClock}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.tasks.map((deal) => (
                  <TaskResult key={deal.id} deal={deal} />
                ))}
              </div>
            </ResultSection>
          </div>
        )}
      </section>
    </main>
  );
}

function CountCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function ResultSection({
  title,
  description,
  count,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  count: number;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  if (count === 0) return null;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          </div>
        </div>

        <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-300">
          {count}
        </span>
      </div>

      {children}
    </section>
  );
}

function DealResult({ deal }: { deal: Deal }) {
  const score = Number(deal.dealScore || 0);

  const scoreStyle =
    score >= 75
      ? "border-green-400/30 bg-green-400/10 text-green-400"
      : score >= 50
      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400"
      : "border-red-400/30 bg-red-400/10 text-red-400";

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="rounded-2xl border border-zinc-800 bg-black p-5 transition hover:-translate-y-1 hover:border-cyan-400/40"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-white">{deal.address}</h3>
          <p className="mt-1 text-sm text-zinc-600">{deal.market}</p>
        </div>

        <span
          className={`rounded-xl border px-3 py-1 text-xs font-black ${scoreStyle}`}
        >
          {deal.dealScore}/100
        </span>
      </div>

      <p className="text-sm text-zinc-500">Status: {deal.status}</p>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
        {deal.notes}
      </p>

      <ResultLinkLabel />
    </Link>
  );
}

function BuyerResult({ buyer }: { buyer: Buyer }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <h3 className="font-black text-white">{buyer.name}</h3>
      <p className="mt-1 text-sm text-zinc-600">{buyer.markets}</p>

      <div className="mt-4 space-y-2 text-sm text-zinc-500">
        <p>Phone: {buyer.phone}</p>
        <p>Email: {buyer.email}</p>
        <p>Type: {buyer.buyerType}</p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">
        {buyer.notes}
      </p>
    </div>
  );
}

function MarketResult({ market }: { market: Market }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <h3 className="font-black text-white">{market.name}</h3>
      <p className="mt-1 text-sm text-zinc-600">ZIP / Area: {market.zip}</p>

      <div className="mt-4 grid gap-2 text-sm text-zinc-500">
        <p>Rating: {market.personalRating}/100</p>
        <p>Investor Activity: {market.investorActivity}/100</p>
        <p>Competition: {market.competitionScore}/100</p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">
        {market.notes}
      </p>
    </div>
  );
}

function TaskResult({ deal }: { deal: Deal }) {
  const priorityStyle =
    deal.priority === "High"
      ? "border-red-400/30 bg-red-400/10 text-red-400"
      : deal.priority === "Low"
      ? "border-zinc-700 bg-zinc-900 text-zinc-400"
      : "border-cyan-400/30 bg-cyan-400/10 text-cyan-400";

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="rounded-2xl border border-zinc-800 bg-black p-5 transition hover:-translate-y-1 hover:border-cyan-400/40"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-white">{deal.address}</h3>
          <p className="mt-1 text-sm text-zinc-600">{deal.market}</p>
        </div>

        <span
          className={`rounded-xl border px-3 py-1 text-xs font-black ${priorityStyle}`}
        >
          {deal.priority || "Medium"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-zinc-500">
        <p>Follow-up: {deal.nextFollowUp || "No date"}</p>
        <p>Next action: {deal.nextAction || "No action set"}</p>
        <p>Outcome: {deal.callOutcome || "No outcome"}</p>
      </div>

      <ResultLinkLabel />
    </Link>
  );
}

function ResultLinkLabel() {
  return (
    <div className="mt-4 flex items-center justify-between text-sm font-bold text-cyan-400">
      Open
      <ArrowUpRight className="h-4 w-4" />
    </div>
  );
}