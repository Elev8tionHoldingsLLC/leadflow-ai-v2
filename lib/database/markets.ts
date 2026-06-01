import type { Market } from "@/types/leadflow";
import type { DatabaseMarket } from "@/types/database";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapDatabaseMarket } from "@/lib/database/mappers";

function getSupabase() {
  return createSupabaseBrowserClient();
}

export async function fetchMarkets() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("markets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DatabaseMarket[]).map(mapDatabaseMarket);
}

export async function createMarket(input: {
  name: string;
  zip: string;
  averagePrice: string;
  averageDom: string;
  investorActivity: string;
  competitionScore: string;
  personalRating: string;
  notes: string;
}) {
  const supabase = getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to create a market.");
  }

  const { data, error } = await supabase
    .from("markets")
    .insert({
      user_id: user.id,
      name: input.name,
      zip: input.zip,
      average_price: input.averagePrice,
      average_dom: input.averageDom,
      investor_activity: input.investorActivity,
      competition_score: input.competitionScore,
      personal_rating: input.personalRating,
      notes: input.notes,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseMarket(data as DatabaseMarket);
}

export async function deleteMarket(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase.from("markets").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateMarket(id: string, market: Market) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("markets")
    .update({
      name: market.name,
      zip: market.zip,
      average_price: market.averagePrice,
      average_dom: market.averageDom,
      investor_activity: market.investorActivity,
      competition_score: market.competitionScore,
      personal_rating: market.personalRating,
      notes: market.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseMarket(data as DatabaseMarket);
}