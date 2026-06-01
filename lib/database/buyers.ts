import type { Buyer, BuyerType } from "@/types/leadflow";
import type { DatabaseBuyer } from "@/types/database";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapDatabaseBuyer } from "@/lib/database/mappers";

function getSupabase() {
  return createSupabaseBrowserClient();
}

export async function fetchBuyers() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("buyers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DatabaseBuyer[]).map(mapDatabaseBuyer);
}

export async function createBuyer(input: {
  name: string;
  phone: string;
  email: string;
  markets: string;
  minPrice: string;
  maxPrice: string;
  buyerType: BuyerType;
  notes: string;
}) {
  const supabase = getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to create a buyer.");
  }

  const { data, error } = await supabase
    .from("buyers")
    .insert({
      user_id: user.id,
      name: input.name,
      phone: input.phone,
      email: input.email,
      markets: input.markets,
      min_price: input.minPrice,
      max_price: input.maxPrice,
      buyer_type: input.buyerType,
      notes: input.notes,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseBuyer(data as DatabaseBuyer);
}

export async function deleteBuyer(id: string) {
  const supabase = getSupabase();

  const { error } = await supabase.from("buyers").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateBuyer(id: string, buyer: Buyer) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("buyers")
    .update({
      name: buyer.name,
      phone: buyer.phone,
      email: buyer.email,
      markets: buyer.markets,
      min_price: buyer.minPrice,
      max_price: buyer.maxPrice,
      buyer_type: buyer.buyerType,
      notes: buyer.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDatabaseBuyer(data as DatabaseBuyer);
}