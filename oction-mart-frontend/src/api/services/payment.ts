import { authService } from "./auth"; // if needed for types
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const paymentService = {
  createPaymentRequest: async (auctionId: number, token: string) => {
    const response = await axios.post(
      `${API_BASE}/api/payments/${auctionId}/request/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data; // { redirect_url: "..." }
  },
};
