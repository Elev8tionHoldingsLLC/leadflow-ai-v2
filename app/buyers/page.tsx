"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  WalletCards,
} from "lucide-react";
import type { Buyer, BuyerType } from "@/types/leadflow";
import { BUYER_TYPES } from "@/types/leadflow";
import {
  createBuyer,
  deleteBuyer as deleteSupabaseBuyer,
  fetchBuyers,
} from "@/lib/database/buyers";
import toast from "react-hot-toast";

const emptyBuyerForm = {
  name: "",
  phone: "",
  email: "",
  markets: "",
  minPrice: "",
  maxPrice: "",
  buyerType: "Cash" as BuyerType,
  notes: "",
};

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyBuyerForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBuyers();
  }, []);

  async function loadBuyers() {
    try {
      setLoading(true);
      setMessage("");

      const fetchedBuyers = await fetchBuyers();
      setBuyers(fetchedBuyers);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load buyers."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredBuyers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    if (!search) return buyers;

    return buyers.filter((buyer) => {
      return (
        buyer.name.toLowerCase().includes(search) ||
        buyer.phone.toLowerCase().includes(search) ||
        buyer.email.toLowerCase().includes(search) ||
        buyer.markets.toLowerCase().includes(search) ||
        buyer.buyerType.toLowerCase().includes(search)
      );
    });
  }, [buyers, searchTerm]);

  const stats = useMemo(() => {
    const totalBuyers = buyers.length;
    const cashBuyers = buyers.filter(
      (buyer) => buyer.buyerType === "Cash" || buyer.buyerType === "Both"
    ).length;
    const financingBuyers = buyers.filter(
      (buyer) => buyer.buyerType === "Financing" || buyer.buyerType === "Both"
    ).length;

    return {
      totalBuyers,
      cashBuyers,
      financingBuyers,
    };
  }, [buyers]);

  function updateForm(field: keyof typeof emptyBuyerForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function addBuyer() {
    if (!form.name.trim()) return;

    try {
      setMessage("");

      const newBuyer = await createBuyer({
        name: form.name.trim(),
        phone: form.phone.trim() || "No phone added",
        email: form.email.trim() || "No email added",
        markets: form.markets.trim() || "No markets added",
        minPrice: form.minPrice.trim() || "$0",
        maxPrice: form.maxPrice.trim() || "$0",
        buyerType: form.buyerType,
        notes: form.notes.trim() || "No notes yet.",
      });

      setBuyers((currentBuyers) => [newBuyer, ...currentBuyers]);
      setForm(emptyBuyerForm);
      setShowForm(false);
      toast.success("Buyer saved to Supabase.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save buyer."
      );
    }
  }

  async function deleteBuyer(id: string) {
    const confirmed = window.confirm("Delete this buyer?");

    if (!confirmed) return;

    try {
      setMessage("");

      await deleteSupabaseBuyer(id);

      setBuyers((currentBuyers) =>
        currentBuyers.filter((buyer) => buyer.id !== id)
      );

      toast.success("Buyer deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete buyer."
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
              Buyers
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Buyer Database
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
              Store cash buyers, investor contacts, target markets, price
              ranges, and notes so you can match deals faster.
            </p>
          </div>

          <button
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:scale-[1.02] hover:bg-green-400"
          >
            <Plus className="h-5 w-5" />
            {showForm ? "Close Form" : "Add Buyer"}
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <StatCard
            title="Total Buyers"
            value={String(stats.totalBuyers)}
            icon={Users}
          />

          <StatCard
            title="Cash Buyers"
            value={String(stats.cashBuyers)}
            icon={DollarSign}
          />

          <StatCard
            title="Financing Buyers"
            value={String(stats.financingBuyers)}
            icon={WalletCards}
          />
        </div>

        {showForm && (
          <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <div className="mb-6">
              <h2 className="text-2xl font-black">Add New Buyer</h2>
              <p className="mt-1 text-sm text-zinc-500">
                This buyer will save directly to your Supabase database.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputBox
                label="Buyer Name"
                placeholder="John Investor"
                value={form.name}
                onChange={(value) => updateForm("name", value)}
              />

              <InputBox
                label="Phone"
                placeholder="(555) 555-5555"
                value={form.phone}
                onChange={(value) => updateForm("phone", value)}
              />

              <InputBox
                label="Email"
                placeholder="buyer@email.com"
                value={form.email}
                onChange={(value) => updateForm("email", value)}
              />

              <InputBox
                label="Markets"
                placeholder="Miami, Tampa, Orlando"
                value={form.markets}
                onChange={(value) => updateForm("markets", value)}
              />

              <InputBox
                label="Minimum Price"
                placeholder="$150,000"
                value={form.minPrice}
                onChange={(value) => updateForm("minPrice", value)}
              />

              <InputBox
                label="Maximum Price"
                placeholder="$750,000"
                value={form.maxPrice}
                onChange={(value) => updateForm("maxPrice", value)}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-400">
                  Buyer Type
                </span>

                <select
                  value={form.buyerType}
                  onChange={(event) =>
                    updateForm("buyerType", event.target.value as BuyerType)
                  }
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  {BUYER_TYPES.map((buyerType) => (
                    <option key={buyerType}>{buyerType}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-400">
                  Notes
                </span>

                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Preferences, buying criteria, proof of funds notes..."
                  className="h-[48px] w-full resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
                />
              </label>
            </div>

            <button
              onClick={addBuyer}
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400"
            >
              Save Buyer
            </button>
          </section>
        )}

        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
          <Search className="h-5 w-5 text-cyan-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search buyers by name, market, phone, email, or type..."
            className="w-full bg-transparent outline-none placeholder:text-zinc-600"
          />
        </div>

        {loading ? (
  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
    <p className="font-bold text-zinc-400">Loading buyers...</p>
  </div>
) : buyers.length === 0 && !searchTerm ? (
  <section className="rounded-3xl border border-dashed border-cyan-400/20 bg-zinc-950 p-10 text-center">
    <Users className="mx-auto mb-5 h-12 w-12 text-zinc-700" />

    <h2 className="text-3xl font-black text-white">
      No buyers saved yet
    </h2>

    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
      Add your first buyer so LeadFlow can start matching your deals to real
      investor contacts, markets, and price ranges.
    </p>

    <button
      onClick={() => setShowForm(true)}
      className="mt-6 inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400"
    >
      <Plus className="h-5 w-5" />
      Add First Buyer
    </button>
  </section>
) : filteredBuyers.length === 0 ? (
  <section className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center">
    <Search className="mx-auto mb-5 h-12 w-12 text-zinc-700" />

    <h2 className="text-3xl font-black text-white">
      No matching buyers found
    </h2>

    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">
      Try searching by buyer name, market, phone, email, or buyer type.
    </p>
  </section>
) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBuyers.map((buyer) => (
              <BuyerCard
                key={buyer.id}
                buyer={buyer}
                onDelete={deleteBuyer}
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

function BuyerCard({
  buyer,
  onDelete,
}: {
  buyer: Buyer;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
            <User className="h-6 w-6" />
          </div>

          <h2 className="text-2xl font-black text-white">{buyer.name}</h2>
          <p className="mt-1 text-sm text-zinc-600">Added {buyer.createdAt}</p>
        </div>

        <button
          onClick={() => onDelete(buyer.id)}
          className="rounded-xl p-2 text-zinc-600 transition hover:bg-red-400/10 hover:text-red-400"
          aria-label="Delete buyer"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 text-sm text-zinc-500">
        <InfoLine icon={Phone} text={buyer.phone} />
        <InfoLine icon={MapPin} text={buyer.markets} />
        <InfoLine
          icon={DollarSign}
          text={`${buyer.minPrice} - ${buyer.maxPrice}`}
        />
        <InfoLine icon={WalletCards} text={buyer.buyerType} />
      </div>

      <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
        <p className="text-sm font-bold text-cyan-300">Notes</p>
        <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-500">
          {buyer.notes}
        </p>
      </div>
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
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-zinc-700" />
      <span>{text}</span>
    </div>
  );
}