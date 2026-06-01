import type { Buyer, Deal, Market, ProfileSettings } from "@/types/leadflow";
import type {
  DatabaseBuyer,
  DatabaseDeal,
  DatabaseMarket,
  DatabaseProfile,
} from "@/types/database";
import { DEFAULT_PROFILE } from "@/types/leadflow";

export function mapDatabaseDeal(row: DatabaseDeal): Deal {
  return {
    id: row.id,
    address: row.address,
    sellerName: row.seller_name || "Unknown Seller",
    phone: row.phone || "No phone added",
    market: row.market || "Unknown Market",
    estimatedValue: row.estimated_value || "$0",
    mortgageBalance: row.mortgage_balance || "$0",
    dealScore: row.deal_score || "0",
    status: (row.status || "New Lead") as Deal["status"],
    notes: row.notes || "No notes yet.",
    nextFollowUp: row.next_follow_up || undefined,
    nextAction: row.next_action || undefined,
    priority: (row.priority || "Medium") as Deal["priority"],
    callOutcome: row.call_outcome || undefined,
    taskNotes: row.task_notes || undefined,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };
}

export function mapDatabaseBuyer(row: DatabaseBuyer): Buyer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || "No phone added",
    email: row.email || "No email added",
    markets: row.markets || "No markets added",
    minPrice: row.min_price || "$0",
    maxPrice: row.max_price || "$0",
    buyerType: (row.buyer_type || "Cash") as Buyer["buyerType"],
    notes: row.notes || "No notes yet.",
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };
}

export function mapDatabaseMarket(row: DatabaseMarket): Market {
  return {
    id: row.id,
    name: row.name,
    zip: row.zip || "No ZIP added",
    averagePrice: row.average_price || "$0",
    averageDom: row.average_dom || "0",
    investorActivity: row.investor_activity || "0",
    competitionScore: row.competition_score || "0",
    personalRating: row.personal_rating || "0",
    notes: row.notes || "No notes yet.",
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };
}

export function mapDatabaseProfile(row: DatabaseProfile | null): ProfileSettings {
  if (!row) return DEFAULT_PROFILE;

  return {
    displayName: row.display_name || DEFAULT_PROFILE.displayName,
    role: row.role || DEFAULT_PROFILE.role,
    profileImage: row.profile_image || DEFAULT_PROFILE.profileImage,
    tagline: row.tagline || DEFAULT_PROFILE.tagline,
  };
}