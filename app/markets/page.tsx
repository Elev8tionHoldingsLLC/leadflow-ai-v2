"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  Flame,
  MapPin,
  Plus,
  Search,
  Star,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import type { Market } from "@/types/leadflow";
import { createMarket, deleteMarket as deleteSupabaseMarket, fetchMarkets } from "@/lib/database/markets";
import { clampScore, getHighestMarket } from "@/lib/scoring";
import toast from "react-hot-toast";

const emptyMarketForm = {
  name: "",
  zip: "",
  averagePrice: "",
  averageDom: "",
  investorActivity: "",
  competitionScore: "",
  personalRating: "",
  notes: "",
};

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyMarketForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMarkets();
  }, []);

  async function loadMarkets() {
    try {
      setLoading(true);
      setMessage("");

      const fetchedMarkets = await fetchMarkets();
      setMarkets(fetchedMarkets);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load markets."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredMarkets = useMemo(() => {
    const search = searchTerm.toLowerCase();

    if (!search) return markets;

    return markets.filter((market) => {
      return (
        market.name.toLowerCase().includes(search) ||
        market.zip.toLowerCase().includes(search) ||
        market.notes.toLowerCase().includes(search) ||
        market.personalRating.toLowerCase().includes(search) ||
        market.investorActivity.toLowerCase().includes(search) ||
        market.competitionScore.toLowerCase().includes(search)
      );
    });
  }, [markets, searchTerm]);

  const stats = useMemo(() => {
    const highestRatedMarket = getHighestMarket(markets, "personalRating");
    const bestInvestorMarket = getHighestMarket(markets, "investorActivity");
    const mostCompetitiveMarket = getHighestMarket(markets, "competitionScore");

    return {
      totalMarkets: markets.length,
      highestRatedMarket,
      bestInvestorMarket,
      mostCompetitiveMarket,
    };
  }, [markets]);

  function updateForm(field: keyof typeof emptyMarketForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function addMarket() {
    if (!form.name.trim()) return;

    try {
      setMessage("");

      const newMarket = await createMarket({
        name: form.name.trim(),
        zip: form.zip.trim() || "No ZIP added",
        averagePrice: form.averagePrice.trim() || "$0",
        averageDom: form.averageDom.trim() || "0",
        investorActivity: clampScore(form.investorActivity),
        competitionScore: clampScore(form.competitionScore),
        personalRating: clampScore(form.personalRating),
        notes: form.notes.trim() || "No notes yet.",
      });

      setMarkets((currentMarkets) => [newMarket, ...currentMarkets]);
      setForm(emptyMarketForm);
      setShowForm(false);
      toast.success("Market saved to Supabase.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save market."
      );
    }
  }

  async function deleteMarket(id: string) {
    const confirmed = window.confirm("Delete this market?");

    if (!confirmed) return;

    try {
      setMessage("");

      await deleteSupabaseMarket(id);

      setMarkets((currentMarkets) =>
        currentMarkets.filter((market) => market.id !== id)
      );

      toast.success("Market deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete market."
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
              Markets
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Market Intelligence
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
              Track cities and ZIP codes so you know where to spend your time,
              where buyers are active, and where competition may be too heavy.
            </p>
          </div>

          <button
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:scale-[1.02] hover:bg-green-400"
          >
            <Plus className="h-5 w-5" />
            {showForm ? "Close Form" : "Add Market"}
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Markets Tracked"
            value={String(stats.totalMarkets)}
            icon={MapPin}
            detail="Saved watchlist"
          />

          <StatCard
            title="Highest Rated"
            value={stats.highestRatedMarket?.name || "None"}
            icon={Star}
            detail={
              stats.highestRatedMarket
                ? `${stats.highestRatedMarket.personalRating}/100 rating`
                : "Add markets first"
            }
          />

          <StatCard
            title="Investor Activity"
            value={stats.bestInvestorMarket?.name || "None"}
            icon={Flame}
            detail={
              stats.bestInvestorMarket
                ? `${stats.bestInvestorMarket.investorActivity}/100 activity`
                : "Add markets first"
            }
          />

          <StatCard
            title="Most Competitive"
            value={stats.mostCompetitiveMarket?.name || "None"}
            icon={Target}
            detail={
              stats.mostCompetitiveMarket
                ? `${stats.mostCompetitiveMarket.competitionScore}/100 competition`
                : "Add markets first"
            }
          />
        </div>

        {showForm && (
          <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Add Market</h2>
              <p className="mt-1 text-sm text-zinc-500">
                This market will save directly to your Supabase database.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputBox
                label="City / Market Name"
                placeholder="Miami, FL"
                value={form.name}
                onChange={(value) => updateForm("name", value)}
              />

              <InputBox
                label="ZIP / Area"
                placeholder="33101"
                value={form.zip}
                onChange={(value) => updateForm("zip", value)}
              />

              <InputBox
                label="Average Price"
                placeholder="$450,000"
                value={form.averagePrice}
                onChange={(value) => updateForm("averagePrice", value)}
              />

              <InputBox
                label="Average DOM"
                placeholder="42"
                value={form.averageDom}
                onChange={(value) => updateForm("averageDom", value)}
              />

              <InputBox
                label="Investor Activity Score"
                placeholder="85"
                value={form.investorActivity}
                onChange={(value) => updateForm("investorActivity", value)}
              />

              <InputBox
                label="Competition Score"
                placeholder="70"
                value={form.competitionScore}
                onChange={(value) => updateForm("competitionScore", value)}
              />

              <InputBox
                label="Personal Rating"
                placeholder="92"
                value={form.personalRating}
                onChange={(value) => updateForm("personalRating", value)}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-400">
                  Notes
                </span>

                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Buyer demand, seller opportunities, risk, local observations..."
                  className="h-[48px] w-full resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
                />
              </label>
            </div>

            <button
              onClick={addMarket}
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400"
            >
              Save Market
            </button>
          </section>
        )}

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <Search className="h-5 w-5 text-cyan-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search markets by city, ZIP, score, or notes..."
            className="w-full bg-transparent outline-none placeholder:text-zinc-600"
          />
        </div>

        {loading ? (
  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
    <p className="font-bold text-zinc-400">Loading markets...</p>
  </div>
) : markets.length === 0 && !searchTerm ? (
  <section className="rounded-3xl border border-dashed border-cyan-400/20 bg-zinc-950 p-10 text-center">
    <MapPin className="mx-auto mb-5 h-12 w-12 text-zinc-700" />

    <h2 className="text-3xl font-black text-white">
      No markets tracked yet
    </h2>

    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
      Add your first market so LeadFlow can help you compare investor activity,
      competition, average prices, and your personal market rating.
    </p>

    <button
      onClick={() => setShowForm(true)}
      className="mt-6 inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400"
    >
      <Plus className="h-5 w-5" />
      Add First Market
    </button>
  </section>
) : filteredMarkets.length === 0 ? (
  <section className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center">
    <Search className="mx-auto mb-5 h-12 w-12 text-zinc-700" />

    <h2 className="text-3xl font-black text-white">
      No matching markets found
    </h2>

    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
      Try searching by city, ZIP code, notes, rating, investor activity, or competition score.
    </p>
  </section>
) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onDelete={deleteMarket}
              />
            ))}
          </div>
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
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-zinc-950 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-500">{title}</p>
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <p className="truncate text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}

function InputBox({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-400">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
      />
    </label>
  );
}

function MarketCard({
  market,
  onDelete,
}: {
  market: Market;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
            <MapPin className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-black text-white">{market.name}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            ZIP / Area: {market.zip}
          </p>
        </div>

        <button
          onClick={() => onDelete(market.id)}
          className="rounded-xl p-2 text-zinc-600 transition hover:bg-red-400/10 hover:text-red-400"
          aria-label="Delete market"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MarketMetric
          icon={Building2}
          label="Avg Price"
          value={market.averagePrice}
        />

        <MarketMetric
          icon={BarChart3}
          label="Avg DOM"
          value={`${market.averageDom} days`}
        />

        <ScoreMetric
          label="Investor Activity"
          value={market.investorActivity}
        />

        <ScoreMetric
          label="Competition"
          value={market.competitionScore}
        />

        <ScoreMetric
          label="Personal Rating"
          value={market.personalRating}
        />

        <MarketMetric
          icon={TrendingUp}
          label="Created"
          value={market.createdAt}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
        <p className="text-sm font-bold text-cyan-300">Notes</p>
        <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-500">
          {market.notes}
        </p>
      </div>
    </div>
  );
}

function MarketMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <Icon className="mb-3 h-5 w-5 text-cyan-400" />
      <p className="text-xs font-bold text-zinc-600">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function ScoreMetric({ label, value }: { label: string; value: string }) {
  const score = Number(value || 0);

  const scoreColor =
    score >= 75
      ? "bg-green-400"
      : score >= 50
      ? "bg-cyan-400"
      : "bg-red-400";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-xs font-bold text-zinc-600">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <p className="font-black text-white">{value}/100</p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-900">
        <div
          className={`h-full rounded-full ${scoreColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}