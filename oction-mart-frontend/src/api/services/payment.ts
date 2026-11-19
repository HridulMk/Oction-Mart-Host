import axios from "axios";
import { config } from "@/config/environment";

const API_BASE = config.API_BASE_URL;

export const paymentService = {
  createPaymentRequest: async (auctionId: number, token: string) => {
    const response = await axios.post(
      `${API_BASE}/payments/${auctionId}/request/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data; // { redirect_url: "..." }
  },
};
