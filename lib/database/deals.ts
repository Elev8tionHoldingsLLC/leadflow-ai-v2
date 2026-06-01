import type { Deal, DealStatus } from "@/types/leadflow";
import type { DatabaseDeal } from "@/types/database";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapDatabaseDeal } from "@/lib/database/mappers";

function getSupabase() {
  return createSupabaseBrowserClient();
}

export async function fetchDeals() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DatabaseDeal[]).map(mapDatabaseDeal);
}

export async function createDeal(input: {
  address: string;
  sellerName: string;
  phone: string;
  market: string;
  estimatedValue: string;
  mortgageBalance: string;
  dealScore: string;
  notes: string;
}) {
  const supabase = getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to create a deal.");
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      address: input.address,
      seller_name: input.sellerName,
      phone: input.phone,
      market: input.market,
      estimated_value: input.estimatedValue,
      mortgage_balance: input.mortgageBalance,
      deal_score: input.dealScore,
      status: "New Lead",
      notes: input.notes,
      priority: "Medium",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseDeal(data as DatabaseDeal);
}

export async function updateDealStatus(id: string, status: DealStatus) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("deals")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseDeal(data as DatabaseDeal);
}

export async function updateDeal(id: string, deal: Deal) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("deals")
    .update({
      address: deal.address,
      seller_name: deal.sellerName,
      phone: deal.phone,
      market: deal.market,
      estimated_value: deal.estimatedValue,
      mortgage_balance: deal.mortgageBalance,
      deal_score: deal.dealScore,
      status: deal.status,
      notes: deal.notes,
      next_follow_up: deal.nextFollowUp || null,
      next_action: deal.nextAction || null,
      priority: deal.priority || "Medium",
      call_outcome: deal.callOutcome || null,
      task_notes: deal.taskNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseDeal(data as DatabaseDeal);
}

export async function deleteDeal(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase.from("deals").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchDealById(id: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseDeal(data as DatabaseDeal);
}