export type DealStatus =
  | "New Lead"
  | "Contacted"
  | "Negotiating"
  | "Contract Sent"
  | "Buyer Search"
  | "Closed"
  | "Dead Lead";

export type Priority = "Low" | "Medium" | "High";

export type BuyerType = "Cash" | "Financing" | "Both";

export type Motivation = "Low" | "Medium" | "High";

export type Deal = {
  id: string;
  address: string;
  sellerName: string;
  phone: string;
  market: string;
  estimatedValue: string;
  mortgageBalance: string;
  dealScore: string;
  status: DealStatus;
  notes: string;
  createdAt: string;
  nextFollowUp?: string;
  nextAction?: string;
  priority?: Priority;
  callOutcome?: string;
  taskNotes?: string;
};

export type Buyer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  markets: string;
  minPrice: string;
  maxPrice: string;
  buyerType: BuyerType;
  notes: string;
  createdAt: string;
};

export type BuyerMatch = Buyer & {
  matchScore: number;
  matchLabel: "Strong Match" | "Possible Match" | "Weak Match";
  matchReasons: string[];
};

export type Market = {
  id: string;
  name: string;
  zip: string;
  averagePrice: string;
  averageDom: string;
  investorActivity: string;
  competitionScore: string;
  personalRating: string;
  notes: string;
  createdAt: string;
};

export type ProfileSettings = {
  displayName: string;
  role: string;
  profileImage: string;
  tagline: string;
};

export type BackupFile = {
  exportedAt?: string;
  deals?: Deal[];
  buyers?: Buyer[];
  markets?: Market[];
  profile?: ProfileSettings;
};

export const DEAL_STAGES: DealStatus[] = [
  "New Lead",
  "Contacted",
  "Negotiating",
  "Contract Sent",
  "Buyer Search",
  "Closed",
  "Dead Lead",
];

export const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export const BUYER_TYPES: BuyerType[] = ["Cash", "Financing", "Both"];

export const MOTIVATIONS: Motivation[] = ["Low", "Medium", "High"];

export const DEFAULT_PROFILE: ProfileSettings = {
  displayName: "Noah Pichardo",
  role: "Founder / Lead Operator",
  profileImage: "/profile.jpeg",
  tagline: "LeadFlow AI",
};