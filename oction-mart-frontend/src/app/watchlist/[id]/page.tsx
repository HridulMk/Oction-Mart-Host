"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { AuctionItem } from "@/api/services/auctions";
import { config } from "@/config/environment";

const API_BASE_URL = config.API_BASE_URL;

const WatchlistPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string;

  const [watchlist, setWatchlist] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    const buyerId = id || user?.id;

    if (!buyerId) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get<AuctionItem[]>(
        `${API_BASE_URL}/buyer/${buyerId}/watchlist/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWatchlist(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch watchlist:", err);
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      const token = localStorage.getItem("accessToken");

      setLoading(true);

      await axios.delete(
        `${API_BASE_URL}/buyer/${id || user?.id}/watchlist/${itemId}/remove/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Item removed from watchlist! 👍");

      await fetchWatchlist();
    } catch (err: any) {
      console.error("Failed to remove item:", err);

      toast.error(
        err.response?.data?.detail ||
          "Failed to remove item from watchlist."
      );

      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/buyer-login-app?role=buyer");
      return;
    }

    fetchWatchlist();
  }, [user, isAuthenticated, id]);

  if (loading) {
    return (
      <p style={{ padding: "20px", fontSize: "18px" }}>
        Loading your watchlist...
      </p>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <p style={{ padding: "20px", fontSize: "18px" }}>
        You have no items in your watchlist.
      </p>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "100%",
        margin: "0 auto",
        backgroundColor: "#281233",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "20px",
          color: "#3f51b5",
        }}
      >
        Your Watchlist
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {watchlist.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "15px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.3s ease",
              backgroundColor: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow =
                "0 3px 6px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow =
                "0 1px 3px rgba(0,0,0,0.05)";
            }}
          >
            <div style={{ flex: "2", minWidth: "0" }}>
              <h2
                style={{
                  fontWeight: "600",
                  fontSize: "18px",
                  marginBottom: "4px",
                  color: "#333",
                }}
              >
                {item.title}
              </h2>

              <p
                style={{
                  color: "#757575",
                  fontSize: "13px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {item.description}
              </p>
            </div>

            <div
              style={{
                flex: "1",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "20px",
                minWidth: "380px",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9e9e9e",
                    marginBottom: "2px",
                  }}
                >
                  Start Price
                </p>

                <p
                  style={{
                    fontWeight: "700",
                    color: "#00796b",
                    fontSize: "16px",
                  }}
                >
                  ${item.start_price.toLocaleString()}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9e9e9e",
                    marginBottom: "2px",
                  }}
                >
                  Status
                </p>

                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "15px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    color: "#ffffff",
                    backgroundColor:
                      item.status === "ended" ? "#d32f2f" : "#388e3c",
                  }}
                >
                  {item.status || item.auction_status}
                </span>
              </div>

              <button
                onClick={() => router.push(`/product2/${item.id}`)}
                style={{
                  backgroundColor: "#3f51b5",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#303f9f";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#3f51b5";
                }}
              >
                View
              </button>

              <button
                onClick={() => handleRemove(item.id)}
                disabled={loading}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#d32f2f";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f44336";
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPage;