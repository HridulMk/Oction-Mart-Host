// src/api/services/notifications.ts
import axios from "axios";
import { config } from "@/config/environment";

const API_BASE_URL = config.API_BASE_URL;

export const notificationService = {
  async getNotifications(buyerId: number) {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(
      `${API_BASE_URL}/buyer/${buyerId}/notifications/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async markAsRead(buyerId: number) {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.patch(
      `${API_BASE_URL}/buyer/${buyerId}/notifications/mark-as-read/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },


 /* ------------------------
     Seller Notifications
  ------------------------ */
  async getSellerNotifications(sellerId: number) {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(
      `${API_BASE_URL}/seller/${sellerId}/notifications/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async markSellerNotificationsAsRead(sellerId: number) {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.patch(
      `${API_BASE_URL}/seller/${sellerId}/notifications/mark-as-read/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /* ------------------------
     Global Notifications
  ------------------------ */
  async getAllNotifications() {
   const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(`${API_BASE_URL}/notifications/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async markAllAsRead() {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.patch(
      `${API_BASE_URL}/notifications/mark-all-as-read/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  // api/services/notifications.ts
async  getUnreadCount() {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No authentication token found");

  const response = await axios.get(`${API_BASE_URL}/notifications/unread-count/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.unread_count;
}

};
