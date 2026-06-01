"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  DollarSign,
  MapPin,
  Phone,
  Save,
  Target,
  Trash2,
  User,
  Users,
  WalletCards,
} from "lucide-react";
import type { BuyerMatch, Deal, DealStatus, Priority } from "@/types/leadflow";
import { DEAL_STAGES, PRIORITIES } from "@/types/leadflow";
import {
  deleteDeal as deleteSupabaseDeal,
  fetchDealById,
  updateDeal as updateSupabaseDeal,
} from "@/lib/database/deals";
import { fetchBuyers } from "@/lib/database/buyers";
import { scoreBuyerMatch } from "@/lib/scoring";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = String(params.id);

  const [deal, setDeal] = useState<Deal | null>(null);
  const [buyerMatches, setBuyerMatches] = useState<BuyerMatch[]>([]);
  const [buyerCount, setBuyerCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeal() {
      try {
        setLoading(true);

        const foundDeal = await fetchDealById(dealId);
        const buyers = await fetchBuyers();

        setDeal(foundDeal);
        setBuyerCount(buyers.length);

        const matches: BuyerMatch[] = buyers
          .map((buyer) => scoreBuyerMatch(foundDeal, buyer))
          .sort((a, b) => b.matchScore - a.matchScore);

        setBuyerMatches(matches);
      } catch {
        setDeal(null);
      } finally {
        setLoading(false);
      }
    }

    loadDeal();
  }, [dealId]);

  const scoreStyle = useMemo(() => {
    const score = Number(deal?.dealScore || 0);

    if (score >= 75) return "border-green-400/30 bg-green-400/10 text-green-400";
    if (score >= 50) return "border-cyan-400/30 bg-cyan-400/10 text-cyan-400";
    return "border-red-400/30 bg-red-400/10 text-red-400";
  }, [deal?.dealScore]);

  function updateDeal(field: keyof Deal, value: string) {
    setDeal((currentDeal) => {
      if (!currentDeal) return currentDeal;

      return {
        ...currentDeal,
        [field]: value,
      };
    });
  }

  async function saveDeal() {
    if (!deal) return;

    try {
      const updatedDeal = await updateSupabaseDeal(deal.id, deal);
      const buyers = await fetchBuyers();

      setDeal(updatedDeal);
      setSaveMessage("Lead updated in Supabase.");

      const updatedMatches: BuyerMatch[] = buyers
        .map((buyer) => scoreBuyerMatch(updatedDeal, buyer))
        .sort((a, b) => b.matchScore - a.matchScore);

      setBuyerMatches(updatedMatches);
      setBuyerCount(buyers.length);
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Could not update lead."
      );
    }
  }

  async function deleteDeal() {
    if (!deal) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmed) return;

    try {
      await deleteSupabaseDeal(deal.id);
      router.push("/deals");
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Could not delete lead."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
        <section className="mx-auto max-w-5xl">
          <p className="font-bold text-zinc-400">Loading lead...</p>
        </section>
      </main>
    );
  }

  if (!deal) {
    return (
      <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
        <section className="mx-auto max-w-5xl">
          <Link
            href="/deals"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-green-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Deals
          </Link>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h1 className="text-3xl font-black">Lead not found</h1>
            <p className="mt-3 text-zinc-500">
              This lead may have been deleted or does not exist in Supabase.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/deals"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-green-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deals
        </Link>

        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
              Lead Detail
            </p>
            <h1 className="text-4xl font-black md:text-6xl">{deal.address}</h1>
            <p className="mt-4 text-zinc-500">Added {deal.createdAt}</p>
          </div>

          <div className={`rounded-3xl border px-6 py-5 ${scoreStyle}`}>
            <p className="text-sm font-bold uppercase tracking-[0.25em]">
              Deal Score
            </p>
            <p className="mt-2 text-4xl font-black">{deal.dealScore}/100</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="mb-6 text-2xl font-black">Lead Information</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <InputBox label="Property Address" value={deal.address} onChange={(value) => updateDeal("address", value)} />
              <InputBox label="Seller Name" value={deal.sellerName} onChange={(value) => updateDeal("sellerName", value)} />
              <InputBox label="Phone" value={deal.phone} onChange={(value) => updateDeal("phone", value)} />
              <InputBox label="Market" value={deal.market} onChange={(value) => updateDeal("market", value)} />
              <InputBox label="Estimated Value" value={deal.estimatedValue} onChange={(value) => updateDeal("estimatedValue", value)} />
              <InputBox label="Mortgage Balance" value={deal.mortgageBalance} onChange={(value) => updateDeal("mortgageBalance", value)} />
              <InputBox label="Deal Score" value={deal.dealScore} onChange={(value) => updateDeal("dealScore", value)} />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-400">
                  Status
                </span>

                <select
                  value={deal.status}
                  onChange={(event) =>
                    updateDeal("status", event.target.value as DealStatus)
                  }
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  {DEAL_STAGES.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-zinc-400">
                Notes
              </span>

              <textarea
                value={deal.notes}
                onChange={(event) => updateDeal("notes", event.target.value)}
                className="min-h-[140px] w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </label>
          </section>

          <aside className="space-y-5">
            <InfoCard icon={Building2} label="Property" value={deal.address} />
            <InfoCard icon={User} label="Seller" value={deal.sellerName} />
            <InfoCard icon={Phone} label="Phone" value={deal.phone} />
            <InfoCard icon={MapPin} label="Market" value={deal.market} />
            <InfoCard icon={DollarSign} label="Estimated Value" value={deal.estimatedValue} />
          </aside>
        </div>

        <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6">
          <div className="mb-6 flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-cyan-400" />
            <div>
              <h2 className="text-3xl font-black">Follow-Up Task</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Track the next move so leads do not go cold.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputBox
              label="Next Action"
              value={deal.nextAction || ""}
              onChange={(value) => updateDeal("nextAction", value)}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-400">
                Next Follow-Up Date
              </span>

              <input
                type="date"
                value={deal.nextFollowUp || ""}
                onChange={(event) =>
                  updateDeal("nextFollowUp", event.target.value)
                }
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-400">
                Priority
              </span>

              <select
                value={deal.priority || "Medium"}
                onChange={(event) =>
                  updateDeal("priority", event.target.value as Priority)
                }
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>

            <InputBox
              label="Call Outcome"
              value={deal.callOutcome || ""}
              onChange={(value) => updateDeal("callOutcome", value)}
            />
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-zinc-400">
              Task Notes
            </span>

            <textarea
              value={deal.taskNotes || ""}
              onChange={(event) => updateDeal("taskNotes", event.target.value)}
              placeholder="Example: Call seller again, verify repairs, ask about timeline, send offer..."
              className="min-h-[120px] w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-400"
            />
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={saveDeal}
              className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black transition hover:bg-green-400"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </button>

            <button
              onClick={deleteDeal}
              className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-6 py-4 font-black text-red-400 transition hover:bg-red-400 hover:text-black"
            >
              <Trash2 className="h-5 w-5" />
              Delete Lead
            </button>
          </div>

          {saveMessage && (
            <p className="mt-4 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-bold text-green-400">
              {saveMessage}
            </p>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
                Buyer Matching
              </p>
              <h2 className="text-3xl font-black">Matching Buyers</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Matches are based on market overlap and whether the deal value
                fits inside the buyer&apos;s price range.
              </p>
            </div>

            <Link
              href="/buyers"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
            >
              <Users className="h-5 w-5" />
              Manage Buyers
            </Link>
          </div>

          {buyerCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/40 p-8 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
              <h3 className="text-2xl font-black">No buyers saved yet</h3>
              <p className="mt-2 text-zinc-500">
                Add buyers to your database first, then this section will show
                matching buyers for each deal.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {buyerMatches.map((buyer) => (
                <MatchingBuyerCard key={buyer.id} buyer={buyer} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function InputBox({
  label,
  value,
  onChange,
}: {
  label: string;
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
        className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-cyan-400"
      />
    </label>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-zinc-500">{label}</p>
      <p className="mt-1 break-words font-black text-white">{value}</p>
    </div>
  );
}

function MatchingBuyerCard({ buyer }: { buyer: BuyerMatch }) {
  const matchStyle =
    buyer.matchLabel === "Strong Match"
      ? "border-green-400/30 bg-green-400/10 text-green-400"
      : buyer.matchLabel === "Possible Match"
      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400"
      : "border-red-400/30 bg-red-400/10 text-red-400";

  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-5 transition hover:-translate-y-1 hover:border-cyan-400/40">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
            <User className="h-6 w-6" />
          </div>

          <h3 className="text-2xl font-black text-white">{buyer.name}</h3>
          <p className="mt-1 text-sm text-zinc-600">{buyer.markets}</p>
        </div>

        <div className={`rounded-2xl border px-3 py-2 text-xs font-black ${matchStyle}`}>
          {buyer.matchLabel}
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-zinc-400">Match Score</p>
          <p className="font-black text-white">{buyer.matchScore}/100</p>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-black">
          <div
            className="h-full rounded-full bg-cyan-400"
            style={{ width: `${buyer.matchScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm text-zinc-500">
        <BuyerInfoLine icon={Phone} text={buyer.phone} />
        <BuyerInfoLine icon={WalletCards} text={buyer.buyerType} />
        <BuyerInfoLine icon={DollarSign} text={`${buyer.minPrice} - ${buyer.maxPrice}`} />
        <BuyerInfoLine icon={MapPin} text={buyer.markets} />
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-2 flex items-center gap-2 text-cyan-400">
          <Target className="h-4 w-4" />
          <p className="text-sm font-bold">Match Reasons</p>
        </div>

        <ul className="space-y-1 text-sm text-zinc-500">
          {buyer.matchReasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      </div>

      <p className="mt-4 line-clamp-4 text-sm leading-6 text-zinc-600">
        {buyer.notes}
      </p>
    </div>
  );
}

function BuyerInfoLine({
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