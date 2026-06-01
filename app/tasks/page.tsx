"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  Flame,
  Search,
} from "lucide-react";
import type { Deal } from "@/types/leadflow";
import { fetchDeals } from "@/lib/database/deals";
import { getDateOnly } from "@/lib/scoring";

export default function TasksPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
          error instanceof Error ? error.message : "Could not load tasks."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, []);

  const taskData = useMemo(() => {
    const today = getDateOnly(new Date());

    const dealsWithTasks = deals.filter(
      (deal) => deal.nextFollowUp || deal.nextAction || deal.priority
    );

    const filteredTasks = dealsWithTasks.filter((deal) => {
      const search = searchTerm.toLowerCase();

      if (!search) return true;

      return (
        deal.address.toLowerCase().includes(search) ||
        deal.sellerName.toLowerCase().includes(search) ||
        deal.market.toLowerCase().includes(search) ||
        (deal.nextAction || "").toLowerCase().includes(search) ||
        (deal.taskNotes || "").toLowerCase().includes(search) ||
        (deal.callOutcome || "").toLowerCase().includes(search)
      );
    });

    const overdue = filteredTasks.filter((deal) => {
      if (!deal.nextFollowUp) return false;
      return deal.nextFollowUp < today;
    });

    const todayTasks = filteredTasks.filter((deal) => {
      return deal.nextFollowUp === today;
    });

    const upcoming = filteredTasks.filter((deal) => {
      if (!deal.nextFollowUp) return false;
      return deal.nextFollowUp > today;
    });

    const highPriority = filteredTasks.filter(
      (deal) => deal.priority === "High"
    );

    return {
      filteredTasks,
      overdue,
      todayTasks,
      upcoming,
      highPriority,
    };
  }, [deals, searchTerm]);

  return (
    <main className="min-h-screen bg-black text-white pl-24 pr-8 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-400">
            Tasks
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            Follow-Up Command Center
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Track follow-ups, next actions, priority leads, and overdue seller
            tasks.
          </p>
        </div>

        {message && (
          <div className="mb-8 rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-red-400">
            <p className="font-bold">{message}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
            <p className="font-bold text-zinc-400">Loading tasks...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-5 md:grid-cols-4">
              <StatCard
                title="Overdue"
                value={String(taskData.overdue.length)}
                icon={AlertTriangle}
                color="red"
              />

              <StatCard
                title="Due Today"
                value={String(taskData.todayTasks.length)}
                icon={Clock}
                color="cyan"
              />

              <StatCard
                title="Upcoming"
                value={String(taskData.upcoming.length)}
                icon={CalendarDays}
                color="green"
              />

              <StatCard
                title="High Priority"
                value={String(taskData.highPriority.length)}
                icon={Flame}
                color="green"
              />
            </div>

            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
              <Search className="h-5 w-5 text-cyan-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search tasks by address, seller, market, notes, outcome, or next action..."
                className="w-full bg-transparent outline-none placeholder:text-zinc-600"
              />
            </div>

            <TaskSection
              title="Overdue Follow-Ups"
              description="These need attention first."
              deals={taskData.overdue}
              emptyText="No overdue tasks."
            />

            <TaskSection
              title="Due Today"
              description="Follow-ups scheduled for today."
              deals={taskData.todayTasks}
              emptyText="No tasks due today."
            />

            <TaskSection
              title="Upcoming"
              description="Future scheduled follow-ups."
              deals={taskData.upcoming}
              emptyText="No upcoming follow-ups."
            />

            <TaskSection
              title="High Priority"
              description="Leads marked as high priority."
              deals={taskData.highPriority}
              emptyText="No high-priority tasks."
            />

            <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-6">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-cyan-400" />
                <h2 className="text-2xl font-black">How to add tasks</h2>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                Open any lead from the Deals page, then fill in the Follow-Up
                Task section. Once saved, the lead will appear here.
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
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
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
    </div>
  );
}

function TaskSection({
  title,
  description,
  deals,
  emptyText,
}: {
  title: string;
  description: string;
  deals: Deal[];
  emptyText: string;
}) {
  return (
    <section className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/40 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-7 w-7 text-zinc-700" />
          <p className="text-sm text-zinc-600">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {deals.map((deal) => (
            <TaskCard key={`${title}-${deal.id}`} deal={deal} />
          ))}
        </div>
      )}
    </section>
  );
}

function TaskCard({ deal }: { deal: Deal }) {
  const priorityStyle =
    deal.priority === "High"
      ? "border-red-400/30 bg-red-400/10 text-red-400"
      : deal.priority === "Low"
      ? "border-zinc-700 bg-zinc-900 text-zinc-400"
      : "border-cyan-400/30 bg-cyan-400/10 text-cyan-400";

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="block rounded-2xl border border-zinc-800 bg-black p-5 transition hover:-translate-y-1 hover:border-cyan-400/40"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white">{deal.address}</h3>
          <p className="mt-1 text-sm text-zinc-600">{deal.market}</p>
        </div>

        <span
          className={`rounded-xl border px-3 py-1 text-xs font-black ${priorityStyle}`}
        >
          {deal.priority || "Medium"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-zinc-500">
        <p>
          <span className="font-bold text-zinc-400">Follow-up:</span>{" "}
          {deal.nextFollowUp || "No date"}
        </p>

        <p>
          <span className="font-bold text-zinc-400">Next action:</span>{" "}
          {deal.nextAction || "No action set"}
        </p>

        <p>
          <span className="font-bold text-zinc-400">Call outcome:</span>{" "}
          {deal.callOutcome || "No call outcome"}
        </p>
      </div>

      {deal.taskNotes && (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">
          {deal.taskNotes}
        </p>
      )}
    </Link>
  );
}