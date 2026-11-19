// src/api/services/auctions.ts
// Auction service function
import api from '../index';
import axios from 'axios';
import { config } from '@/config/environment';



// Updated AuctionItem Interface
export interface AuctionItem {
  id: number;
  title: string;
  description: string;
  start_price: string;
  currentBid?: string;
  bid_count?: number;
  timeLeft?: string;
  image?: File | string; 
  status?: 'live' | 'upcoming' | 'ended';
  category?: string;
  auction_status?: 'live' | 'upcoming' | 'ended' | string ; // New field for auction status
  
  // New fields for auction details
  auction_start?: string; // Corresponds to Django's auction_start
  auction_end?: string; // Corresponds to Django's auction_end
  
  // Approval and assignment fields
  approval_status?: string;
  rejection_reason?: string;
  
  // User relationships
  seller: string | number;
  assigned_auctioneer: string | number;
  seller_username?: string; // added for convenience
  assigned_auctioneer_username?: string; // added for convenience
  seller_email?: string; // added for convenience
  assigned_auctioneer_email?: string; // added for convenience

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface CreateAuctionItemRequest {
  title: string;
  description: string;
  auction_start?: string;       // optional
  start_price: number;          // ✅ backend expects this
  auction_end?: string;             // optional
  category?: string;
  assigned_auctioneer: string;  // ✅ must send auctioneer id
  image?: File;                 // single image upload
}

export interface Bid {
  id: number;
  amount: number;
  bidder?: { username: string };
  bidder_username?: string; // added for convenience
  auction: number;
  is_winner: boolean;
  timestamp: string;
  auction_status?: "live" | "upcoming" | "ended"; // added field
}


// Auction Report interface
export interface AuctionReport {
  id: number;
  auction_item_title: string;
  image: string; // Added image field
  description: string;
  created_at: string;
  duration: string;
  start_price: string;
  winner_name: string;
  highest_bid: string;
  total_bids: number;
  total_participants: number;
  seller_name:string;
  auctioneer_name: string;
  commission_percentage: string;
  commission_amount: string;
  seller_earnings: string;
  auctioneer_earnings: string;
  generated_at: string;
}


export const calculateBidLimits = (item: AuctionItem | null | undefined, bidHistory: Bid[] = []) => {
  if (!item || !item.start_price) return { minimumBid: 0, maximumBid: 0 };

  const startPrice = parseFloat(item.start_price);

  // Get highest bid from bid history if available
  const highestBid = bidHistory.length > 0
    ? Math.max(...bidHistory.map(b => b.amount))
    : 0;

  const minimumBid = Math.max(startPrice, highestBid);
  const maximumBid = minimumBid + 100000; // can adjust increment if needed

  return { minimumBid, maximumBid };
};
function authHeaders(token?: string) {
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}


export const auctionService = {



  // ----------------------
  // Bid Methods
  // ----------------------
  async getBidHistory(auctionId: number, token?: string): Promise<Bid[]> {
    const res = await api.get(`/buyer/bids/history/${auctionId}/`, { headers: authHeaders(token) });
    return res.data.results || res.data || [];
  },

  async placeBid(auctionId: number, amount: number, token?: string): Promise<Bid> {
    if (!token) throw new Error('Auth token required');
    const res = await api.post(
      `/buyer/bids/place/${auctionId}/`,
      { amount },
      { headers: authHeaders(token) }
    );
    return res.data;
  },
  // Get all auctions
   async getAuctionItemById(id: number, token: string) {
    const res = await api.get(`/auctions/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  
  // async getAuctions(params?: {
  //   status?: 'live' | 'upcoming' | 'ended';
  //   category?: string;
  //   search?: string;
  //   page?: number;
  //   limit?: number;
  // }): Promise<{ auctions: AuctionItem[]; total: number; page: number; limit: number }> {
  //   const response = await api.get('/auctions/', { params });
  //   return response.data;
  // },
   async getAuctions(): Promise<AuctionItem[]> {
    const response = await api.get('/auctions/');
    return response.data;
  },


  // Get auction by ID
  async getAuction(id: string): Promise<AuctionItem> {
    const response = await api.get(`/auctions/${id}/`);
    return response.data;
  },

  // Create new auction item
  async createAuctionItem(auctionData: CreateAuctionItemRequest, token: string): Promise<AuctionItem> {
  const formData = new FormData();
  formData.append("title", auctionData.title);
  formData.append("description", auctionData.description);
  formData.append("start_price", auctionData.start_price.toString());
  formData.append("category", auctionData.category || "");

  if (auctionData.auction_start) {
    formData.append("auction_start", auctionData.auction_start);
  }
  if (auctionData.auction_end) {
    formData.append("auction_end", auctionData.auction_end);
  }
  if (auctionData.assigned_auctioneer) {
    formData.append("assigned_auctioneer", auctionData.assigned_auctioneer.toString());
  }
  if (auctionData.image) {
    formData.append("image", auctionData.image);
  }

  const response = await api.post("/seller/items/add/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`,  // or Bearer if your backend uses JWT
    },
  });

  return response.data;
},



  // Get auction bids
  async getAuctionBids(auctionId: string): Promise<any[]> {
    const response = await api.get(`/auctions/${auctionId}/bids/`);
    return response.data;
  },

  // Update auction
  async updateAuction(id: string, auctionData: Partial<CreateAuctionItemRequest>): Promise<AuctionItem> {
    const formData = new FormData();
    if (auctionData.title) formData.append('title', auctionData.title);
    if (auctionData.description) formData.append('description', auctionData.description);
    if (auctionData.start_price) formData.append('start_price', auctionData.start_price.toString());
    if (auctionData.category) formData.append('category', auctionData.category);
    if (auctionData.auction_start) formData.append('auction_start', auctionData.auction_start);
    if (auctionData.auction_end) formData.append('auction_end', auctionData.auction_end);
    if (auctionData.assigned_auctioneer) formData.append('assigned_auctioneer', auctionData.assigned_auctioneer);
    if (auctionData.image) formData.append('image', auctionData.image);

    const response = await api.put(`/auctions/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete auction
  async deleteAuction(id: string): Promise<void> {
    await api.delete(`/auctions/${id}/`);
  },

  // Get featured auctions
  async getFeaturedAuctions(): Promise<AuctionItem[]> {
    const response = await api.get('/auctions/featured/');
    return response.data;
  },

  // Get auctions by category
  async getAuctionsByCategory(category: string): Promise<AuctionItem[]> {
    const response = await api.get(`auctions/category/<str:category>/`);
    return response.data;
  },

  // ✅ Get approved auctioneers (for dropdown)
  async getApprovedAuctioneers(): Promise<{ id: string; username: string }[]> {
    const response = await api.get('/api/auctioneers/approved/');
    return response.data;
  },
};




    
     


// export interface AuctionItem {
//   id: number;
//   title: string;
//   description: string;
//   category: string;
//   image?: string;
//   created_at?: Date;
//   start_price: number;
//   seller: string | number;
//   approval_status?: string;
//   assigned_auctioneer?: number | null; // 👈 to check assignment
// }

// ✅ Fetch Assigned items
export const fetchAssignedItems = async (): Promise<AuctionItem[]> => {
  const token = localStorage.getItem("accessToken") || "";
  const res = await api.get("/auctioneer/items/", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};
// ✅ Approve item
export const approveAuctionItem = async (itemId: number): Promise<void> => {
  const token = localStorage.getItem("accessToken") || "";
  await api.patch(`/auctioneer/items/${itemId}/approve/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
};

// ✅ Reject item
export const rejectAuctionItem = async (
  itemId: number,
  reason: string,
  
): Promise<void> => {
  const token = localStorage.getItem("accessToken") || "";
  await api.patch(
    `/auctioneer/items/${itemId}/reject/`,
    { rejection_reason: reason }, // 👈 send reason in body
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  
};


// ✅ (Optional) Schedule auction
export const scheduleAuctionItem = async (itemId: number, scheduleData: any): Promise<void> => {
  const token = localStorage.getItem("accessToken") || "";
  await api.patch(`/auctioneer/items/${itemId}/schedule/`, scheduleData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};




export const fetchNotifications = async (): Promise<any[]> => {
  const token = localStorage.getItem("accessToken") || "";
  const res = await api.get("/notifications/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


// ✅ Fetch single auction report
// src/api/services/auctions.ts

export const fetchAuctionReport = async (
  auctionId: number,
  token?: string
): Promise<AuctionReport> => {
  try {
    const res = await api.get(`/auction-report/${auctionId}/`, {
      headers: authHeaders(token),
    });
    console.log("Auction report response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch auction report:", error);
    throw error;
  }
};




const API_BASE_URL = config.API_BASE_URL;

interface WatchlistResponse {
  message: string;
}

export const watchlistService = {
  async addToWatchlist(auctionId: number): Promise<WatchlistResponse> {
    const token = localStorage.getItem("accessToken");

    if (!token) throw new Error("No JWT access token found. Please log in.");

    try {
      const response = await axios.post<WatchlistResponse>(
        `${API_BASE_URL}/watchlist/${auctionId}/add/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Correct for JWT
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message
        );
      }
      throw error;
    }
  },
};
