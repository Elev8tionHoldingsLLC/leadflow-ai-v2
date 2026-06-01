export type DatabaseDeal = {
    id: string;
    user_id: string;
    address: string;
    seller_name: string | null;
    phone: string | null;
    market: string | null;
    estimated_value: string | null;
    mortgage_balance: string | null;
    deal_score: string | null;
    status: string | null;
    notes: string | null;
    next_follow_up: string | null;
    next_action: string | null;
    priority: string | null;
    call_outcome: string | null;
    task_notes: string | null;
    created_at: string;
    updated_at: string | null;
  };
  
  export type DatabaseBuyer = {
    id: string;
    user_id: string;
    name: string;
    phone: string | null;
    email: string | null;
    markets: string | null;
    min_price: string | null;
    max_price: string | null;
    buyer_type: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string | null;
  };
  
  export type DatabaseMarket = {
    id: string;
    user_id: string;
    name: string;
    zip: string | null;
    average_price: string | null;
    average_dom: string | null;
    investor_activity: string | null;
    competition_score: string | null;
    personal_rating: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string | null;
  };
  
  export type DatabaseProfile = {
    id: string;
    display_name: string | null;
    role: string | null;
    profile_image: string | null;
    tagline: string | null;
    created_at: string;
    updated_at: string | null;
  };