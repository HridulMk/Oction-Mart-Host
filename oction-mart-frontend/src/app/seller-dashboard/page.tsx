"use client";

import React, { useState } from "react";
import Link from 'next/link';

export default function SellerLaunch() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      {/* Header Area with BG image */}
      <header style={{
        width: "100%",
        minHeight: 580,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        background: `url('/products/III.png') center/cover no-repeat`,
        boxSizing: "border-box",
      }}>
        {/* Overlay for better text contrast */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(255,255,255,0.55)",
          zIndex: 0,
        }} />
        
        {/* Hero Content Centered */}
        <div style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          minHeight: 260,
          marginTop: 18,
        }}>
          <img src="/products/product1.jpg" alt="logo" style={{ width: 120, height: 120, borderRadius: 16, marginBottom: 12, background: "#fff", objectFit: "cover" }} />
          <h1 style={{ fontSize: 48, fontWeight: 700, color: "black ", margin: 0, letterSpacing: 1, textShadow: "0 2px 8px #fff8" }}>Seller Dashboard</h1>
          <div style={{ color: "black", fontSize: 22, margin: "10px 0 24px 0", fontWeight: 500, textShadow: "0 2px 8px #fff8" }}>Manage Your Auctions & Maximize Profits</div>
          <button style={startSellingBtnStyle}>Create New Listing</button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ background: "#181818", color: "#fff", padding: 0, margin: 0, minHeight: 900 }}>
        {/* Active Listings */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem 0 1rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Active Listings</h2>
          {/* Card 1 */}
          <div style={{ display: "flex", background: "#232323", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <img src="/products/product2.jpg" alt="car" style={{ width: 220, height: 140, objectFit: "cover" }} />
            <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Vintage Watch Collection</div>
              <div style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}>Rare collection of vintage timepieces from the 1960s. Excellent condition.</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button style={manageBtnStyle}>Manage</button>
                <button style={viewBtnStyle}>View Bids</button>
              </div>
              <span style={{ color: "#ffe066", fontWeight: 600, fontSize: 15, marginTop: 8 }}>Current Bid: $1,250</span>
            </div>
          </div>
          {/* Card 2 */}
          <div style={{ display: "flex", background: "#232323", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Antique Furniture Set</div>
              <div style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}>Complete Victorian era furniture set. Mahogany wood, hand-carved details.</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button style={manageBtnStyle}>Manage</button>
                <button style={viewBtnStyle}>View Bids</button>
              </div>
              <span style={{ color: "#ffe066", fontWeight: 600, fontSize: 15, marginTop: 8 }}>Current Bid: $3,400</span>
            </div>
            <img src="/products/product3.webp" alt="furniture" style={{ width: 220, height: 140, objectFit: "cover" }} />
          </div>
        </section>

        {/* Quick Stats */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1rem 0 1rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Quick Stats</h2>
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            <div style={{ flex: 1, background: "#232323", borderRadius: 16, overflow: "hidden", padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: "#8A2BE2" }}>Total Earnings</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>$12,450</div>
              <div style={{ color: "#bbb", fontSize: 14, marginTop: 8 }}>This month</div>
            </div>
            <div style={{ flex: 1, background: "#232323", borderRadius: 16, overflow: "hidden", padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: "#8A2BE2" }}>Active Listings</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>8</div>
              <div style={{ color: "#bbb", fontSize: 14, marginTop: 8 }}>Currently running</div>
            </div>
            <div style={{ flex: 1, background: "#232323", borderRadius: 16, overflow: "hidden", padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: "#8A2BE2" }}>Total Bids</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>156</div>
              <div style={{ color: "#bbb", fontSize: 14, marginTop: 8 }}>Across all listings</div>
            </div>
          </div>
        </section>

        {/* Recent Sales */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1rem 2rem 1rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Recent Sales</h2>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1, background: "#232323", borderRadius: 16, overflow: "hidden", padding: 0 }}>
              <img src="/products/III.png" alt="sold item" style={{ width: "100%", height: 120, objectFit: "cover" }} />
              <div style={{ padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Art Print Collection</div>
                <div style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}>Sold for $850</div>
                <div style={{ color: "#8A2BE2", fontWeight: 600 }}>Completed 2 days ago</div>
              </div>
            </div>
            <div style={{ flex: 1, background: "#232323", borderRadius: 16, overflow: "hidden", padding: 0 }}>
              <img src="/products/wallp.jpg" alt="sold item" style={{ width: "100%", height: 120, objectFit: "cover" }} />
              <div style={{ padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Vintage Camera</div>
                <div style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}>Sold for $1,200</div>
                <div style={{ color: "#8A2BE2", fontWeight: 600 }}>Completed 5 days ago</div>
              </div>
            </div>
            <div style={{ flex: 1, background: "#232323", borderRadius: 16, overflow: "hidden", padding: 0 }}>
              <img src="/products/product1.jpg" alt="sold item" style={{ width: "100%", height: 120, objectFit: "cover" }} />
              <div style={{ padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Electronics Bundle</div>
                <div style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}>Sold for $650</div>
                <div style={{ color: "#8A2BE2", fontWeight: 600 }}>Completed 1 week ago</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const navBtnStyle = {
  background: "none",
  border: "none",
  color: "white",
  fontSize: 16,
  cursor: "pointer",
  padding: "0.5rem 0.75rem",
  borderRadius: 6,
  transition: "background 0.2s",
  outline: "none",
};

const contactBtnStyle = {
  background: "#222",
  color: "#fff",
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 6,
  padding: "0.5rem 1.1rem",
  cursor: "pointer",
  marginLeft: 8,
};

const iconBtnStyle = {
  background: "none",
  border: "none",
  color: "inherit",
  fontSize: 22,
  cursor: "pointer",
  padding: 8,
  borderRadius: 6,
  transition: "background 0.2s",
  outline: "none",
};

const dropdownBtnStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  color: "#1976d2",
  fontSize: 16,
  transition: 'color 0.3s',
  padding: "0.75rem 1rem",
  textAlign: "center" as const,
  cursor: "pointer",
  outline: "none",
  textDecoration: "none",
  fontWeight: 500,
}; 

const startSellingBtnStyle = {
  background: "#8A2BE2",
  color: "#fff",
  border: "none",
  fontSize: 18,
  fontWeight: 600,
  borderRadius: 8,
  padding: "0.7rem 2.2rem",
  cursor: "pointer",
  marginTop: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const manageBtnStyle = {
  background: "#8A2BE2",
  color: "#fff",
  border: "none",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 6,
  padding: "0.4rem 1.2rem",
  cursor: "pointer",
  marginTop: 4,
};

const viewBtnStyle = {
  background: "#fff",
  color: "#222",
  border: "none",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 6,
  padding: "0.4rem 1.2rem",
  cursor: "pointer",
  marginTop: 4,
};

const dashboardBtnStyle = {
  background: "#8A2BE2",
  color: "#fff",
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 6,
  padding: "0.5rem 1.5rem",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
}; 