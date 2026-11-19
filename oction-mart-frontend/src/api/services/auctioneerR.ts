// src/api/services/products.ts
import api from "@/api";

export interface SellerAuctionItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image?: string;
  created_at?: Date;
  start_price: number;
  seller: string | number;
  approval_status?: string;
  assigned_auctioneer?: number | null; // 👈 to check assignment
}

// ✅ Fetch pending items
export const fetchPendingItems = async (): Promise<SellerAuctionItem[]> => {
  const token = localStorage.getItem("authToken") || "";
  const res = await api.get("/auctioneer/items/pending/", {
    headers: { Authorization: `Token ${token}` },
  });

  // normalize response (API might wrap in results)
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

// ✅ Approve item
export const approveAuctionItem = async (itemId: number): Promise<void> => {
  const token = localStorage.getItem("authToken") || "";
  await api.patch(`/auctioneer/items/<int:item_id>/approve/`, {}, {
    headers: { Authorization: `Token ${token}` },
  });
};

// ✅ Reject item
export const rejectAuctionItem = async (itemId: number): Promise<void> => {
  const token = localStorage.getItem("authToken") || "";
  await api.patch(`/auctioneer/items/<int:item_id>/reject/`, {}, {
    headers: { Authorization: `Token ${token}` },
  });
};

// ✅ (Optional) Schedule auction
export const scheduleAuctionItem = async (itemId: number, scheduleData: any): Promise<void> => {
  const token = localStorage.getItem("authToken") || "";
  await api.patch(`/auctioneer/items/<int:item_id>/schedule/`, scheduleData, {
    headers: { Authorization: `Token ${token}` },
  });
};
