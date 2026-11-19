// src/api/services/user.ts
import api from "../index";

const authHeaders = (token?: string) => (token ? { Authorization: `Token ${token}` } : {});

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: "admin" | "buyer" | "seller" | "auctioneer";
  approval_status: "pending" | "approved" | "rejected";
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  street_address?: string;
  company_name?: string;
  business_name?: string;
  business_type?: string;
  tax_id?: string;
  license_number?: string;
  license_issue_date?: string;
  license_document?: string;
  created_at?: string;
  profile_pic?: string;
}

export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export const userService = {
  // Fetch all users (paginated)
  async getAllUsers(page = 1, token?: string): Promise<PaginatedUsers> {
    const res = await api.get(`/admin/users/all/`, {
      headers: authHeaders(token),
      params: { page },
    });
    return res.data;
  },

  // Fetch pending users (paginated)
  async getPendingUsers(page = 1, token?: string): Promise<PaginatedUsers> {
    const res = await api.get(`/admin/users/pending/`, {
      headers: authHeaders(token),
      params: { page },
    });
    return res.data;
  },

  // Approve user
  async approveUser(userId: number, token: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/approve/`, {}, {
      headers: authHeaders(token),
    });
  },

  // Reject user with reason
  async rejectUser(userId: number, reason: string, token: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/reject/`, { rejection_reason: reason }, {
      headers: authHeaders(token),
    });
  },
};
