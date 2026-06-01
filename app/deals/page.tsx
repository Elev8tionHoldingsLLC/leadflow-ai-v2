"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  DollarSign,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Workflow,
} from "lucide-react";
import type { Deal, DealStatus } from "@/types/leadflow";
import { DEAL_STAGES } from "@/types/leadflow";
import {
  createDeal,
  deleteDeal,
  fetchDeals,
  updateDealStatus,
} from "@/lib/database/deals";

const emptyForm = {
  address: "",
  sellerName: "",
  phone: "",
  market: "",
  estimatedValue: "",
  mortgageBalance: "",
  dealScore: "",
  notes: "",
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    try {
      setLoading(true);
      setMessage("");

      const fetchedDeals = await fetchDeals();
      setDeals(fetchedDeals);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load deals.");
    } finally {
      setLoading(false);
    }
  }

  const filteredDeals = useMemo(() => {
    const search = searchTerm.toLowerCase();

    if (!search) return deals;

    return deals.filter((deal) => {
      return (
        deal.address.toLowerCase().includes(search) ||
        deal.sellerName.toLowerCase().includes(search) ||
        deal.market.toLowerCase().includes(search) ||
        deal.phone.toLowerCase().includes(search) ||
        deal.status.toLowerCase().includes(search)
      );
    });
  }, [deals, searchTerm]);

  function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function addDeal() {
    if (!form.address.trim()) return;

    try {
      setMessage("");

      const newDeal = await createDeal({
        address: form.address.trim(),
        sellerName: form.sellerName.trim() || "Unknown Seller",
        phone: form.phone.trim() || "No phone added",
        market: form.market.trim() || "Unknown Market",
        estimatedValue: form.estimatedValue.trim() || "$0",
        mortgageBalance: form.mortgageBalance.trim() || "$0",
        dealScore: form.dealScore.trim() || "0",
        notes: form.notes.trim() || "No notes yet.",
      });

      setDeals((currentDeals) => [newDeal, ...currentDeals]);
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Lead saved to Supabase.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save lead.");
    }
  }

  async function handleStatusChange(id: string, status: DealStatus) {
    try {
      setMessage("");

      const updatedDeal = await updateDealStatus(id, status);

      setDeals((currentDeals) =>
        currentDeals.map((deal) => (deal.id === id ? updatedDeal : deal))
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update status.");
    }
  }

  async function handleDeleteDeal(id: string) {
    const confirmed = window.confirm("Delete this deal?");

    if (!confirmed) return;

    try {
      setMessage("");

      await deleteDeal(id);

      setDeals((currentDeals) => currentDeals.filter((deal) => deal.id !== id));
      setMessage("Lead deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete lead.");
    }
  }

  const totalDeals = deals.length;
  const activeDeals = deals.filter(
    (deal) => deal.status !== "Closed" && deal.status !== "Dead Lead"
  ).length;
  const closedDeals = deals.filter((deal) => deal.status === "Closed").length;
  const averageScore =
    deals.length === 0
      ? 0
      : Math.round(
          deals.reduce((total, deal) => total + Number(deal.dealScore || 0), 0) /
            deals.length
        );

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
              Deals
            </p>
            <h1 className="text-4xl font-black md:text-6xl">
              Saved Leads Pipeline
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
              Save property leads, track status, and open each lead for full
              details.
            </p>
          </div>

          <button
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:scale-[1.02] hover:bg-green-400"
          >
            <Plus className="h-5 w-5" />
            {showForm ? "Close Form" : "Add Lead"}
          </button>
        </div>

        {message && (
          <div className="mb-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-cyan-300">
            <p className="font-bold">{message}</p>
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <StatCard title="Total Leads" value={String(totalDeals)} />
          <StatCard title="Active Deals" value={String(activeDeals)} />
          <StatCard title="Closed Deals" value={String(closedDeals)} />
          <StatCard title="Avg Score" value={`${averageScore}/100`} />
        </div>

        {showForm && (
          <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Add New Lead</h2>
              <p className="mt-1 text-sm text-zinc-500">
                This lead will save directly to your Supabase database.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputBox label="Property Address" placeholder="123 Main St" value={form.address} onChange={(value) => updateForm("address", value)} />
              <InputBox label="Seller Name" placeholder="John Smith" value={form.sellerName} onChange={(value) => updateForm("sellerName", value)} />
              <InputBox label="Phone" placeholder="(555) 555-5555" value={form.phone} onChange={(value) => updateForm("phone", value)} />
              <InputBox label="Market" placeholder="Miami, FL" value={form.market} onChange={(value) => updateForm("market", value)} />
              <InputBox label="Estimated Value" placeholder="$599,000" value={form.estimatedValue} onChange={(value) => updateForm("estimatedValue", value)} />
              <InputBox label="Mortgage Balance" placeholder="$117,683" value={form.mortgageBalance} onChange={(value) => updateForm("mortgageBalance", value)} />
              <InputBox label="Deal Score" placeholder="87" value={form.dealScore} onChange={(value) => updateForm("dealScore", value)} />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-400">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Seller motivation, property condition, follow-up notes..."
                  className="h-[48px] w-full resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
                />
              </label>
            </div>

            <button
              onClick={addDeal}
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400"
            >
              Save Lead
            </button>
          </section>
        )}

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <Search className="h-5 w-5 text-cyan-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search saved leads..."
            className="w-full bg-transparent outline-none placeholder:text-zinc-600"
          />
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
            <p className="font-bold text-zinc-400">Loading deals...</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-7">
            {DEAL_STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter((deal) => deal.status === stage);

              return (
                <div key={stage} className="min-h-[320px] rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-black text-white">{stage}</h2>
                      <p className="text-xs text-zinc-600">{stageDeals.length} lead{stageDeals.length === 1 ? "" : "s"}</p>
                    </div>
                    <Workflow className="h-4 w-4 text-zinc-600" />
                  </div>

                  <div className="space-y-3">
                    {stageDeals.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/40 p-4 text-center">
                        <Building2 className="mx-auto mb-3 h-6 w-6 text-zinc-600" />
                        <p className="text-xs text-zinc-600">No leads yet</p>
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} onStatusChange={handleStatusChange} onDelete={handleDeleteDeal} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-zinc-950 p-5">
      <p className="text-sm font-semibold text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
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
      <span className="mb-2 block text-sm font-semibold text-zinc-400">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
      />
    </label>
  );
}

function DealCard({
  deal,
  onStatusChange,
  onDelete,
}: {
  deal: Deal;
  onStatusChange: (id: string, status: DealStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-cyan-400/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Link href={`/deals/${deal.id}`} className="group flex-1">
          <h3 className="text-sm font-black text-white group-hover:text-cyan-400">{deal.address}</h3>
          <p className="mt-1 text-xs text-zinc-600">Added {deal.createdAt}</p>
        </Link>

        <button
          onClick={() => onDelete(deal.id)}
          className="rounded-xl p-2 text-zinc-600 transition hover:bg-red-400/10 hover:text-red-400"
          aria-label="Delete deal"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 text-xs text-zinc-500">
        <InfoLine icon={MapPin} text={deal.market} />
        <InfoLine icon={Phone} text={deal.phone} />
        <InfoLine icon={DollarSign} text={`Value: ${deal.estimatedValue}`} />
      </div>

      <Link
        href={`/deals/${deal.id}`}
        className="mt-3 flex items-center justify-between rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
      >
        Open Details
        <ArrowUpRight className="h-4 w-4" />
      </Link>

      <p className="mt-3 line-clamp-3 text-xs leading-5 text-zinc-600">{deal.notes}</p>

      <select
        value={deal.status}
        onChange={(event) => onStatusChange(deal.id, event.target.value as DealStatus)}
        className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
      >
        {DEAL_STAGES.map((stage) => (
          <option key={stage}>{stage}</option>
        ))}
      </select>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-zinc-700" />
      <span>{text}</span>
    </div>
  );
}