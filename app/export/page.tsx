"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Database,
  Download,
  FileDown,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { BackupFile, Buyer, Deal, Market, ProfileSettings } from "@/types/leadflow";
import { DEFAULT_PROFILE } from "@/types/leadflow";
import { fetchBuyers } from "@/lib/database/buyers";
import { fetchDeals } from "@/lib/database/deals";
import { fetchMarkets } from "@/lib/database/markets";
import { fetchProfile } from "@/lib/database/profile";
import toast from "react-hot-toast";

export default function ExportPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "warning" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExportData();
  }, []);

  async function loadExportData() {
    try {
      setLoading(true);
      setMessage("");

      const [fetchedDeals, fetchedBuyers, fetchedMarkets, fetchedProfile] =
        await Promise.all([
          fetchDeals(),
          fetchBuyers(),
          fetchMarkets(),
          fetchProfile(),
        ]);

      setDeals(fetchedDeals);
      setBuyers(fetchedBuyers);
      setMarkets(fetchedMarkets);
      setProfile(fetchedProfile);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Could not load export data."
      );
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const activeDeals = deals.filter(
      (deal) => deal.status !== "Closed" && deal.status !== "Dead Lead"
    ).length;

    const closedDeals = deals.filter((deal) => deal.status === "Closed").length;

    return {
      totalDeals: deals.length,
      activeDeals,
      closedDeals,
      totalBuyers: buyers.length,
      totalMarkets: markets.length,
    };
  }, [deals, buyers, markets]);

  function exportDeals() {
    if (deals.length === 0) {
      setMessageType("warning");
      toast("No saved deals to export yet.");
      return;
    }

    const rows = deals.map((deal) => ({
      Address: deal.address,
      Seller: deal.sellerName,
      Phone: deal.phone,
      Market: deal.market,
      EstimatedValue: deal.estimatedValue,
      MortgageBalance: deal.mortgageBalance,
      DealScore: deal.dealScore,
      Status: deal.status,
      NextFollowUp: deal.nextFollowUp || "",
      NextAction: deal.nextAction || "",
      Priority: deal.priority || "",
      CallOutcome: deal.callOutcome || "",
      TaskNotes: deal.taskNotes || "",
      Notes: deal.notes,
      CreatedAt: deal.createdAt,
    }));

    downloadCsv(rows, "leadflow-deals.csv");
setMessageType("success");
toast.success("Deals exported successfully.");
  }

  function exportBuyers() {
    if (deals.length === 0) {
      setMessageType("warning");
      toast("No buyers to export yet.");
      return;
    }

    const rows = buyers.map((buyer) => ({
      Name: buyer.name,
      Phone: buyer.phone,
      Email: buyer.email,
      Markets: buyer.markets,
      MinimumPrice: buyer.minPrice,
      MaximumPrice: buyer.maxPrice,
      BuyerType: buyer.buyerType,
      Notes: buyer.notes,
      CreatedAt: buyer.createdAt,
    }));

    downloadCsv(rows, "leadflow-buyers.csv");
setMessageType("success");
toast.success("Buyers exported successfully.");
  }

  function exportMarkets() {
    if (deals.length === 0) {
      setMessageType("warning");
      toast("No markets to export yet.");
      return;
    }

    const rows = markets.map((market) => ({
      Name: market.name,
      Zip: market.zip,
      AveragePrice: market.averagePrice,
      AverageDOM: market.averageDom,
      InvestorActivity: market.investorActivity,
      CompetitionScore: market.competitionScore,
      PersonalRating: market.personalRating,
      Notes: market.notes,
      CreatedAt: market.createdAt,
    }));

    downloadCsv(rows, "leadflow-markets.csv");
setMessageType("success");
toast.success("Markets exported successfully.");
  }

  function exportEverything() {
    if (deals.length === 0 && buyers.length === 0 && markets.length === 0) {
      setMessageType("warning");
      toast("No data to export yet.");
      return;
    }

    const backup: BackupFile = {
      exportedAt: new Date().toISOString(),
      deals,
      buyers,
      markets,
      profile,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "leadflow-supabase-backup.json";
    anchor.click();

    URL.revokeObjectURL(url);
  
    setMessageType("success");
    toast.success("Full Supabase backup exported successfully.");
  }

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
            Export
          </p>

          <h1 className="text-4xl font-black md:text-6xl">Backup Center</h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Export your Supabase deals, buyers, markets, and profile settings.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
            <p className="font-bold text-zinc-400">Loading export data...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <StatCard title="Total Deals" value={String(stats.totalDeals)} icon={Building2} />
              <StatCard title="Active Deals" value={String(stats.activeDeals)} icon={Database} />
              <StatCard title="Closed Deals" value={String(stats.closedDeals)} icon={ShieldCheck} />
              <StatCard title="Total Buyers" value={String(stats.totalBuyers)} icon={Users} />
              <StatCard title="Total Markets" value={String(stats.totalMarkets)} icon={MapPin} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ActionCard
                title="Export Deals"
                text="Download your Supabase lead pipeline as a CSV file."
                icon={Building2}
                buttonText="Download Deals CSV"
                onClick={exportDeals}
              />

              <ActionCard
                title="Export Buyers"
                text="Download your Supabase buyer database as a CSV file."
                icon={Users}
                buttonText="Download Buyers CSV"
                onClick={exportBuyers}
              />

              <ActionCard
                title="Export Markets"
                text="Download your Supabase market watchlist as a CSV file."
                icon={MapPin}
                buttonText="Download Markets CSV"
                onClick={exportMarkets}
              />

              <ActionCard
                title="Full Backup"
                text="Download deals, buyers, markets, and profile settings."
                icon={FileDown}
                buttonText="Download Backup"
                onClick={exportEverything}
              />
            </div>

            <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6">
              <div className="flex items-center gap-3">
                <Download className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-black">Supabase Export Notes</h2>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                This page now exports live data from Supabase. Import/restore is
                not included here yet because restoring database records safely
                needs a separate controlled importer.
              </p>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function downloadCsv(rows: Record<string, string>[], fileName: string) {
  const headers = Object.keys(rows[0]);

  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          return `"${String(value).replaceAll('"', '""')}"`;
        })
        .join(",")
    ),
  ];

  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-zinc-950 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-500">{title}</p>
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  text,
  icon: Icon,
  buttonText,
  onClick,
}: {
  title: string;
  text: string;
  icon: React.ElementType;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
        <Icon className="h-6 w-6" />
      </div>

      <h2 className="text-2xl font-black text-white">{title}</h2>
      <p className="mt-3 min-h-[72px] text-sm leading-6 text-zinc-500">
        {text}
      </p>

      <button
        onClick={onClick}
        className="mt-6 w-full rounded-2xl bg-cyan-400 px-5 py-4 font-black text-black transition hover:bg-green-400"
      >
        {buttonText}
      </button>
    </div>
  );
}