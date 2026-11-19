// src/api/services/dashboard.ts
import api from "../index";

const authHeaders = (token?: string) =>
  token ? { Authorization: `Token ${token}` } : {};

export interface DashboardStats {
  total_sales: number;
  orders: number;
  active_bids: number;
  total_buyers: number;
  avg_order_value: number;
  profit_margin: number;
}

export interface RevenueTrend {
  month: string;
  total: number;
}

export interface OrdersVsSales {
  month: string;
  orders: number;
  sales: number;
}

export interface CategoryShare {
  category: string;
  sales: number;
}

export interface TopBuyer {
  auction_winner__username: string;
  total_spent: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  charts: {
    revenue_trend: RevenueTrend[];
    orders_vs_sales: OrdersVsSales[];
    category_share: CategoryShare[];
    top_buyers: TopBuyer[];
  };
}

// Interfaces for buyer dashboard response
export interface BuyerDashboardStats {
  total_bids: number;
  auctions_won: number;
  total_spend: number;
  avg_bid_value: number;
  active_bids: number;
}

export interface SpendOverTime {
  month: string;
  amount: number;
}

export interface AuctionsPerMonth {
  month: string;
  auctions: number;
}

export interface TopBuyerEntry {
  buyer: string;
  total: number;
}

export interface BuyerDashboardResponse {
  stats: BuyerDashboardStats;
  spend_over_time: SpendOverTime[];
  auctions_per_month: AuctionsPerMonth[];
  top_buyers: TopBuyerEntry[];
}


// ---------------- Admin Dashboard ----------------
export interface UserTypes {
  buyers: number;
  sellers: number;
  auctioneers: number;
}

export interface RecentRegistration {
  id: number;
  username: string;
  user_type: string;
  created_at: string;
}

export interface AdminDashboardResponse {
  total_users: number;
  pending_users: number;
  approved_users: number;
  rejected_users: number;
  user_types: UserTypes;
  recent_registrations: {
    id: number;
    username: string;
    user_type: string;
    created_at: string;
  }[];
}


export interface User {
  id: number;
  username: string;
  user_type: string;
  is_approved: boolean;
  created_at: string;
  approval_status: string;
}

export interface Auction {
  id: number;
  item_name: string;
  seller: string;
  status: string;
  auctioneer?: string;
  start_time?: string;
  end_time?: string;
}

// Auctioneer Dashboard

export interface AuctioneerStats {
  total_auctions: number;
  active_bids: number;
  participants: number;
  revenue: number;
}

export interface LicenseInfo {
  status: string;
  license_number?: string;   // optional since your JSON example didn’t return it
  issue_date?: string;       // optional since your JSON example didn’t return it
  expiry_date: string | null;
  renewal_fee: number;
}

export interface AuctioneerNotification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface AuctioneerAuction {
  id: number;
  title: string;
  category: string;
  current_bid: number;
  bids: number;
  status: string;
  auction_end: string | null;
  image: string | null;
  start_price: string;
  description: string;
  assigned_auctioneer: number;
}

export interface AuctioneerDashboardResponse {
  stats: AuctioneerStats;
  license: LicenseInfo;
  notifications: AuctioneerNotification[];
  auctions: AuctioneerAuction[];
}



export const dashboardService = {
  async getSellerDashboard(
    sellerId: number,
    token?: string
  ): Promise<DashboardResponse> {
    const res = await api.get(`/seller/${sellerId}/dashboard/`, {
      headers: authHeaders(token),
    });
    return res.data;
  },
  
};

export const buyerDashboardService = {
  async getBuyerDashboard(
    buyerId: number,
    token?: string
  ): Promise<BuyerDashboardResponse> {
    const res = await api.get(`/buyer/${buyerId}/dashboard/`, {
      headers: authHeaders(token),
    });
    
    // Map raw response to typed structure
    return {
      stats: {
        total_bids: res.data.total_bids,
        auctions_won: res.data.auctions_won,
        total_spend: res.data.total_spend,
        avg_bid_value: res.data.avg_bid_value,
        active_bids: res.data.active_bids,
      },
      spend_over_time: res.data.spend_over_time,
      auctions_per_month: res.data.auctions_per_month,
      top_buyers: res.data.top_buyers,
    };
  },
};

export const adminDashboardService = {
  async getAdminDashboard(token?: string): Promise<AdminDashboardResponse> {
    const res = await api.get(`/admin/dashboard/`, {
      headers: authHeaders(token),
    });
    return res.data;
  },

  // Fetch pending users - maps to /admin/users/pending/
  getPendingUsers: async (token: string): Promise<User[]> => {
    const response = await api.get(`/admin/users/pending/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Expecting array of User objects
  },

    getAllUsers: async (token: string) => {
    const res = await api.get("/admin/users/all/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data; // returns { count, next, previous, results }
  },

  approveUser: async (userId: number, token: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/approve/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  rejectUser: async (userId: number, token: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/reject/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },


  async getAuctions(token?: string): Promise<Auction[]> {
    const res = await api.get("/admin/auctions/", {
      headers: authHeaders(token),
    });
    return res.data;
  },
};



export const fetchAuctioneerDashboard  = {
  async getauctioneerDashboard(
    auctioneerId: number,
    token?: string
  ): Promise<DashboardResponse> {
    const res = await api.get(`/auctioneer/${auctioneerId}/dashboard/`, {
      headers: authHeaders(token),
    });
    return res.data;
  },
  
};