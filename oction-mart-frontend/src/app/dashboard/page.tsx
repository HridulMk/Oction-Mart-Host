"use client";
import { useEffect, useState } from "react";
import { backendAssetUrl, config } from "@/config/environment";

interface SellerProfile {
  id: number;
  username: string;
  email: string;
  user_type: string;
  approval_status: string;
}

interface AuctionItem {
  id: number;
  title: string;
  description: string;
  start_price: string;
  image: string | null;
  approval_status: string;
  created_at: string;
}

export default function SellerDashboard() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Fetch profile
        const token = localStorage.getItem("accessToken");
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const profileRes = await fetch(`${config.API_BASE_URL}/auth/profile/`, {
          headers,
        });
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // ✅ Fetch seller's items
        const itemsRes = await fetch(`${config.API_BASE_URL}/seller/items/`, {
          headers,
        });
        if (!itemsRes.ok) throw new Error("Items fetch failed");
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      } catch (err) {
        console.error(err);
        setError("Cannot fetch data from backend.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ✅ Loader UI
  if (loading) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "#333",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid #ddd",
            borderTop: "5px solid #0070f3",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: "15px", fontSize: "16px" }}>Loading...</p>

        {/* Inline CSS animation */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", fontWeight: "bold" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Seller Dashboard
      </h2>

      {/* ✅ Seller Profile Section */}
      {profile ? (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ fontSize: "20px" }}>{profile.username}</h3>
          <p>Email: {profile.email}</p>
          <p>User Type: {profile.user_type}</p>
          <p>Status: {profile.approval_status}</p>
        </div>
      ) : (
        <p>No profile data.</p>
      )}

      {/* ✅ Seller Auction Items Section */}
      <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
        My Auction Items
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              {item.image ? (
                <img
                  src={backendAssetUrl(item.image)}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "200px",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  No Image
                </div>
              )}

              <h4 style={{ fontSize: "18px", marginTop: "10px" }}>
                {item.title}
              </h4>
              <p style={{ fontSize: "14px", color: "#555" }}>
                {item.description}
              </p>
              <p style={{ fontWeight: "bold" }}>₹{item.start_price}</p>
              <p>Status: {item.approval_status}</p>
            </div>
          ))
        ) : (
          <p>No items found.</p>
        )}
      </div>
    </div>
  );
}
