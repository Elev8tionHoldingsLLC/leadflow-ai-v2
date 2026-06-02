"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Brain,
  Building2,
  Calculator,
  CheckCircle2,
  MapPin,
  Save,
  Search,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";
import type { Motivation } from "@/types/leadflow";
import { MOTIVATIONS } from "@/types/leadflow";
import { createDeal } from "@/lib/database/deals";
import { formatMoney, parseMoney } from "@/lib/scoring";

export default function AnalyzerPage() {
  const [propertyAddress, setPropertyAddress] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [mortgageBalance, setMortgageBalance] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [assignmentFee, setAssignmentFee] = useState("");
  const [sellerMotivation, setSellerMotivation] = useState<Motivation>("Medium");
  const [savedMessage, setSavedMessage] = useState("");
  const [savedMessageType, setSavedMessageType] = useState<"success" | "error">(
    "success"
  );
  const [saving, setSaving] = useState(false);

  const analysis = useMemo(() => {
    const value = parseMoney(estimatedValue);
    const mortgage = parseMoney(mortgageBalance);
    const repairs = parseMoney(repairCost);
    const fee = parseMoney(assignmentFee);

    const arv = value;
    const mao = Math.max(arv * 0.7 - repairs - fee, 0);
    const estimatedEquity = Math.max(value - mortgage, 0);
    const potentialProfit = Math.max(mao - mortgage, 0);

    let score = 0;

    if (value > 0) score += 10;

    const equityPercent = value > 0 ? estimatedEquity / value : 0;

    if (equityPercent >= 0.7) score += 30;
    else if (equityPercent >= 0.5) score += 22;
    else if (equityPercent >= 0.3) score += 14;
    else if (equityPercent > 0) score += 6;

    const repairPercent = value > 0 ? repairs / value : 1;

    if (repairPercent <= 0.08) score += 20;
    else if (repairPercent <= 0.15) score += 15;
    else if (repairPercent <= 0.25) score += 8;
    else score += 2;

    if (sellerMotivation === "High") score += 25;
    if (sellerMotivation === "Medium") score += 15;
    if (sellerMotivation === "Low") score += 5;

    if (potentialProfit >= 50000) score += 15;
    else if (potentialProfit >= 25000) score += 10;
    else if (potentialProfit >= 10000) score += 5;

    score = Math.min(score, 100);

    const recommendation =
      score >= 75 ? "Pursue" : score >= 50 ? "Review" : "Avoid";

    const recommendationStyle =
      recommendation === "Pursue"
        ? "text-green-400 border-green-400/30 bg-green-400/10"
        : recommendation === "Review"
        ? "text-cyan-400 border-cyan-400/30 bg-cyan-400/10"
        : "text-red-400 border-red-400/30 bg-red-400/10";

    return {
      arv,
      mao,
      estimatedEquity,
      potentialProfit,
      score,
      recommendation,
      recommendationStyle,
      equityPercent,
    };
  }, [
    estimatedValue,
    mortgageBalance,
    repairCost,
    assignmentFee,
    sellerMotivation,
  ]);

  async function saveLeadToPipeline() {
    if (!propertyAddress.trim()) {
      setSavedMessageType("error");
      setSavedMessage("Add a property address before saving.");
      return;
    }
  
    if (analysis.arv <= 0) {
      setSavedMessageType("error");
      setSavedMessage("Add an estimated value / ARV before saving.");
      return;
    }
  
    try {
      setSaving(true);
      setSavedMessage("");
      setSavedMessageType("success");
  
      await createDeal({
        address: propertyAddress.trim(),
        sellerName: "Unknown Seller",
        phone: "No phone added",
        market: "Unknown Market",
        estimatedValue: formatMoney(analysis.arv),
        mortgageBalance: formatMoney(parseMoney(mortgageBalance)),
        dealScore: String(analysis.score),
        notes: `Analyzer recommendation: ${analysis.recommendation}. ARV: ${formatMoney(
          analysis.arv
        )}. MAO: ${formatMoney(analysis.mao)}. Estimated equity: ${formatMoney(
          analysis.estimatedEquity
        )}. Potential profit room: ${formatMoney(
          analysis.potentialProfit
        )}. Seller motivation: ${sellerMotivation}. Repair cost: ${formatMoney(
          parseMoney(repairCost)
        )}. Assignment fee: ${formatMoney(parseMoney(assignmentFee))}.`,
      });
  
      setSavedMessageType("success");
      setSavedMessage("Lead saved to Supabase pipeline.");
    } catch (error) {
      setSavedMessageType("error");
      setSavedMessage(
        error instanceof Error ? error.message : "Could not save lead."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">
            LeadFlow AI
          </p>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            Property Analyzer
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            Enter the basic seller and property numbers. LeadFlow AI will
            estimate equity, MAO, profit potential, deal score, and the next
            move.
          </p>
        </div>

        <div className="mb-9 rounded-3xl border border-cyan-400/20 bg-zinc-950/70 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-zinc-800 bg-black px-5 py-4 transition focus-within:border-cyan-400">
              <Search className="h-5 w-5 text-cyan-400" />
              <input
                placeholder="Search city, ZIP code, county, or market..."
                className="w-full bg-transparent text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <button className="rounded-2xl bg-cyan-400 px-8 py-4 font-black text-black transition hover:scale-[1.02] hover:bg-green-400">
              Scan Market
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="ARV"
            value={formatMoney(analysis.arv)}
            icon={MapPin}
            detail="Estimated resale value"
            color="cyan"
          />

          <StatCard
            title="MAO"
            value={formatMoney(analysis.mao)}
            icon={Target}
            detail="Max allowable offer"
            color="green"
          />

          <StatCard
            title="Equity"
            value={formatMoney(analysis.estimatedEquity)}
            icon={Building2}
            detail={`${Math.round(analysis.equityPercent * 100)}% estimated equity`}
            color="cyan"
          />

          <StatCard
            title="Deal Score"
            value={`${analysis.score}/100`}
            icon={Brain}
            detail={analysis.recommendation}
            color="green"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Property Lead Input</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Add the deal numbers below. The analysis updates instantly.
                </p>
              </div>

              <Calculator className="h-6 w-6 text-cyan-400" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputBox
                label="Property Address"
                placeholder="123 Main St"
                value={propertyAddress}
                onChange={setPropertyAddress}
              />

              <InputBox
                label="Estimated Value / ARV"
                placeholder="$599,000"
                value={estimatedValue}
                onChange={setEstimatedValue}
              />

              <InputBox
                label="Mortgage Balance"
                placeholder="$117,683"
                value={mortgageBalance}
                onChange={setMortgageBalance}
              />

              <InputBox
                label="Repair Cost"
                placeholder="$45,000"
                value={repairCost}
                onChange={setRepairCost}
              />

              <InputBox
                label="Assignment Fee"
                placeholder="$10,000"
                value={assignmentFee}
                onChange={setAssignmentFee}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-400">
                  Seller Motivation
                </span>

                <select
                  value={sellerMotivation}
                  onChange={(event) =>
                    setSellerMotivation(event.target.value as Motivation)
                  }
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  {MOTIVATIONS.map((motivation) => (
                    <option key={motivation}>{motivation}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm font-semibold text-cyan-300">
                Current Lead
              </p>
              <p className="mt-1 text-zinc-400">
                {propertyAddress || "No property address entered yet."}
              </p>
            </div>

            <button
              onClick={saveLeadToPipeline}
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              {saving ? "Saving..." : "Save Lead to Pipeline"}
            </button>

            {savedMessage && (
  <div
    className={`mt-4 flex items-center gap-3 rounded-2xl border p-4 ${
      savedMessageType === "success"
        ? "border-green-400/20 bg-green-400/10 text-green-400"
        : "border-red-400/20 bg-red-400/10 text-red-400"
    }`}
  >
    <CheckCircle2 className="h-5 w-5" />
    <p className="text-sm font-bold">{savedMessage}</p>
  </div>
)}
          </section>

          <section className="rounded-3xl border border-green-400/20 bg-zinc-950/80 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Deal Analysis</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Offer guidance based on equity, repairs, motivation, and
                  profit room.
                </p>
              </div>

              <BadgeDollarSign className="h-6 w-6 text-green-400" />
            </div>

            <div className={`mb-5 rounded-2xl border p-5 ${analysis.recommendationStyle}`}>
              <p className="text-sm font-bold uppercase tracking-[0.25em]">
                Recommendation
              </p>
              <h3 className="mt-2 text-4xl font-black">
                {analysis.recommendation}
              </h3>
            </div>

            <div className="space-y-4">
              <ResultRow label="ARV" value={formatMoney(analysis.arv)} />
              <ResultRow label="MAO" value={formatMoney(analysis.mao)} />
              <ResultRow
                label="Estimated Equity"
                value={formatMoney(analysis.estimatedEquity)}
              />
              <ResultRow
                label="Potential Profit Room"
                value={formatMoney(analysis.potentialProfit)}
              />
              <ResultRow label="Deal Score" value={`${analysis.score}/100`} />
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-white">AI Notes</h3>
              </div>

              <p className="text-sm leading-6 text-zinc-500">
                {getDealNote(analysis.recommendation)}
              </p>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Recent Market Searches</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Track the areas you are studying.
              </p>
            </div>

            <TrendingUp className="h-6 w-6 text-cyan-400" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MarketCard city="Miami, FL" score="92" trend="Hot market" />
            <MarketCard city="Tampa, FL" score="84" trend="Good volume" />
            <MarketCard city="Atlanta, GA" score="79" trend="Watchlist" />
          </div>
        </section>
      </section>
    </main>
  );
}

function getDealNote(recommendation: string) {
  if (recommendation === "Pursue") {
    return "This lead has strong signs. Equity, motivation, or profit room may be good enough to justify deeper seller follow-up and buyer research.";
  }

  if (recommendation === "Review") {
    return "This lead is not dead, but it needs more verification. Check the property condition, seller motivation, comps, and whether buyers are active nearby.";
  }

  return "This lead currently looks weak. The numbers may be too tight, motivation may be low, or there may not be enough profit room to justify chasing it hard.";
}

function StatCard({
  title,
  value,
  icon: Icon,
  detail,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  detail: string;
  color: "cyan" | "green";
}) {
  const accent =
    color === "green"
      ? "border-green-400/20 text-green-400 shadow-[0_0_30px_rgba(74,222,128,0.06)] hover:border-green-400/40"
      : "border-cyan-400/20 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.06)] hover:border-cyan-400/40";

  return (
    <div
      className={`rounded-3xl border bg-zinc-950 p-5 transition duration-300 hover:-translate-y-1 ${accent}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-500">{title}</p>
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-3xl font-black text-white">{value}</h3>
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

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-4">
      <p className="text-sm font-semibold text-zinc-500">{label}</p>
      <p className="font-black text-white">{value}</p>
    </div>
  );
}

function MarketCard({
  city,
  score,
  trend,
}: {
  city: string;
  score: string;
  trend: string;
}) {
  return (
    <div className="group rounded-2xl border border-zinc-800 bg-black p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-white">{city}</h3>
        <ArrowUpRight className="h-4 w-4 text-zinc-600 transition group-hover:text-cyan-400" />
      </div>

      <p className="text-3xl font-black text-cyan-400">{score}</p>
      <p className="mt-1 text-sm text-zinc-500">{trend}</p>
    </div>
  );
}