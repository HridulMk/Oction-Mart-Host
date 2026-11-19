// src/api/services/products.ts
import api from "@/api";
import { backendAssetUrl } from "@/config/environment";

// --- Types ---
export interface Auctioneer {
  id: number;
  username: string;
  business_category?: string;
}

export interface AuctionItem {
  id: number;
  title: string;
  description: string;
  category: string;
  start_price: number;
  image?: string;
  approval_status?: string;
  seller: string;
  created_at?: Date; // parsed as Date
  assigned_auctioneer?: Auctioneer | null; // normalized full object
}

export interface CreateAuctionItemRequest {
  title: string;
  description: string;
  category: string;
  start_price: number;
  image?: File;
  assigned_auctioneer?: number; // only ID needed when creating
}

export interface UpdateAuctionItemRequest extends Partial<CreateAuctionItemRequest> {}

// --- Helpers ---
const normalizeAuctionItem = (item: any): AuctionItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  category: item.category,
  start_price: item.start_price,
  image: item.image
    ? backendAssetUrl(item.image)
    : undefined,
  approval_status: item.approval_status,
  seller: item.seller,
  created_at: item.created_at ? new Date(item.created_at) : undefined,
  assigned_auctioneer: item.assigned_auctioneer
    ? { id: item.assigned_auctioneer.id, username: item.assigned_auctioneer.username }
    : null,
});

// --- Services ---
export const fetchSellerProducts = async (): Promise<AuctionItem[]> => {
  try {
    const res = await api.get<{ results?: any[] } | any[]>("/seller/items/");
    const items = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.results)
      ? res.data.results
      : [];

    return items.map(normalizeAuctionItem);
  } catch (error) {
    console.error("❌ Failed to fetch seller products", error);
    return [];
  }
};

export const fetchAuctioneers = async (): Promise<Auctioneer[]> => {
  try {
    const res = await api.get<Auctioneer[]>("/auctioneers/approved/");
    return res.data;
  } catch (error) {
    console.error("❌ Failed to fetch auctioneers", error);
    return [];
  }
};

export const auctionItemService = {
  createAuctionItem: async (payload: CreateAuctionItemRequest, token: string) => {
    try {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("category", payload.category);
      formData.append("start_price", String(payload.start_price));

      if (payload.image) formData.append("image", payload.image);
      if (payload.assigned_auctioneer) {
        formData.append("assigned_auctioneer", String(payload.assigned_auctioneer));
      }

      const res = await api.post("/seller/items/add/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return normalizeAuctionItem(res.data);
    } catch (error) {
      console.error("❌ Failed to create auction item", error);
      throw error;
    }
  },

  updateAuctionItem: async (id: number, payload: UpdateAuctionItemRequest, token: string) => {
    try {
      const formData = new FormData();
      if (payload.title) formData.append("title", payload.title);
      if (payload.description) formData.append("description", payload.description);
      if (payload.category) formData.append("category", payload.category);
      if (payload.start_price !== undefined) {
        formData.append("start_price", String(payload.start_price));
      }
      if (payload.image) formData.append("image", payload.image);
      if (payload.assigned_auctioneer) {
        formData.append("assigned_auctioneer", String(payload.assigned_auctioneer));
      }

      const res = await api.patch(`/seller/items/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return normalizeAuctionItem(res.data);
    } catch (error) {
      console.error(`❌ Failed to update auction item ${id}`, error);
      throw error;
    }
  },


  getMyItems: async (token: string): Promise<AuctionItem[]> => {
    try {
      const res = await api.get<{ results?: any[] } | any[]>("/seller/items/", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
        
  
      return items.map(normalizeAuctionItem);
    } catch (error) {
      console.error("❌ Failed to fetch seller items", error);
      return [];
    }
  },

  getAuctionItemDetail: async (id: number, token: string): Promise<AuctionItem | null> => {
    try {
      const res = await api.get(`/seller/items/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return normalizeAuctionItem(res.data);
    } catch (error) {
      console.error(`❌ Failed to fetch auction item detail ${id}`, error);
      return null;
    }
  },

  

  deleteAuctionItem: async (id: number, token: string): Promise<boolean> => {
    try {
      await api.delete(`/seller/items/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete auction item ${id}`, error);
      return false;
    }
  },

   async updateSellerAuctionItem(id: number, data: any, token: string) {
    const response = await fetch(`/seller/items/${id}/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update auction item");
    }

    return response.json();
  },
};
