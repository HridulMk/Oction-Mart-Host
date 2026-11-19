"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AttachMoney, People, Gavel, EmojiEvents, AccessTime } from "@mui/icons-material";
import { fetchAuctionReport, AuctionReport, auctionService, Bid } from "@/api/services/auctions";

const IMAGE_SIZE = 500;
const CARD_RADIUS = 20;
const CARD_SHADOW = "0 0 32px 0 #8A2BE233";
const AUCTION_CARD_WIDTH = 600;
const AUCTION_CARD_HEIGHT = 800;

const KPICard = ({ title, value, icon: Icon }: { title: string; value: any; icon?: any }) => (
  <div style={{
      background: "#f3f4f6",
      borderRadius: "12px",
      padding: "1rem",
      textAlign: "center",
      flex: 1,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    }}>
    {Icon && <Icon style={{ fontSize: "1.5rem", color: "#7A8D7E" }} />}
    <div style={{ fontSize: "0.95rem", color: "#555", marginBottom: "0.3rem", fontWeight: 500 }}>
      {title}
    </div>
    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#23243a" }}>{value ?? "N/A"}</div>
  </div>
);

export default function AuctionReportPage() {
  const { id } = useParams();
  const auctionId = Number(id);

  const [report, setReport] = useState<AuctionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);

  // -----------------------------
  // Load JWT token from localStorage
  // -----------------------------
  useEffect(() => {
  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("accessToken"); // match your login storage key
    if (!storedToken) {
      setError("User not authenticated. Please log in.");
    } else {
      setToken(storedToken);
    }
  }
}, []);

  // -----------------------------
  // Fetch Auction Report using JWT
  // -----------------------------
  useEffect(() => {
    if (!auctionId || !token) return;

    const loadReport = async () => {
      try {
        setLoading(true);
        const data = await fetchAuctionReport(auctionId, token);
        setReport(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching auction report:", err.response ?? err);
        setError("Failed to load auction report. Your token may be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [auctionId, token]);

  // -----------------------------
  // Poll bid history every second
  // -----------------------------
  useEffect(() => {
    if (!auctionId || !token) return;

    const fetchBidHistory = async () => {
      try {
        const bids = await auctionService.getBidHistory(auctionId, token);
        setBidHistory(
          bids.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        );
      } catch (err) {
        console.error("Failed to fetch bid history:", err);
      }
    };

    fetchBidHistory();
    const interval = setInterval(fetchBidHistory, 1000);
    return () => clearInterval(interval);
  }, [auctionId, token]);

  // -----------------------------
  // Loading & Error states
  // -----------------------------
  if (!token) return <p style={{ color: "red", textAlign: "center" }}>Not authenticated. Please log in.</p>;
  if (loading) return <p style={{ color: "#fff", textAlign: "center" }}>Loading report...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!report) return <p style={{ color: "#fff", textAlign: "center" }}>No report found.</p>;

  const auctionItem = {
    title: report.auction_item_title ?? "N/A",
    description: report.description ?? "No description",
    image: report.image ?? "/placeholder.png",
  };

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #181a2a 0%, #23243a 100%)", fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem" }}>
        
        {/* Heading */}
        <div style={{ width: "100%", textAlign: "center", marginBottom: "0.5rem" }}>
          <h1 style={{ fontSize: "2.3rem", fontWeight: 900, color: "#fff", marginBottom: "0.3rem", letterSpacing: "0.01em", fontFamily: "Oswald, Arial, sans-serif", textShadow: "0 2px 8px #23243a55" }}>Auction Report</h1>
          <p style={{ color: "#e0e0e0", fontSize: "1.05rem", fontWeight: 500, marginTop: 0 }}>Summary of the completed auction</p>
        </div>

        {/* Main Content */}
        <div style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: "10rem" }}>
          {/* Left: Auction Item */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", minWidth: 0 }}>
            <div style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, background: "#e5e7eb", borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, overflow: "hidden" }}>
              <img
                src={report.image ? `http://127.0.0.1:8000${report.image}` : "/placeholder.png"}
                alt={auctionItem.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: CARD_RADIUS, boxShadow: "0 0 32px 0 #8A2BE255" }}
              />
            </div>

            <div style={{ width: "100%", background: "#f3f4f6", borderRadius: CARD_RADIUS, padding: "1.5rem 2rem", boxShadow: CARD_SHADOW, color: "#23243a", minHeight: "270px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>{auctionItem.title}</h3>
              <p style={{ margin: "0.3rem 0", color: "#555" }}>{auctionItem.description}</p>
              <p><b>Seller:</b> {report.seller_name}</p>
              <p><b>Auctioneer:</b> {report.auctioneer_name}</p>
              <p><b>Generated At:</b> {new Date(report.generated_at).toLocaleString()}</p>
              <p><b>Report ID:</b> {report.id}</p>
            </div>
          </div>

          {/* Right: Auction Summary */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ width: AUCTION_CARD_WIDTH, minHeight: AUCTION_CARD_HEIGHT, background: "rgba(255,255,255,0.13)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.17)", borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: "2rem", color: "purple", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <h2 style={{ fontSize: "1.18rem", fontWeight: 700, marginBottom: "0.7rem", fontFamily: "Oswald, Arial, sans-serif" }}>Auction Summary</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", minHeight: "300px" }}>
                <KPICard title="Total Bids" value={report.total_bids} icon={Gavel} />
                <KPICard title="Total Participants" value={report.total_participants} icon={People} />
                <KPICard title="Winning Bid" value={report.highest_bid} icon={AttachMoney} />
                <KPICard title="Winner" value={report.winner_name || "N/A"} icon={EmojiEvents} />
                <KPICard title="Auction Duration" value={report.duration} icon={AccessTime} />
                <KPICard title="Starting Price" value={report.start_price} icon={AttachMoney} />
              </div>
            </div>
          </div>
        </div>

        {/* Bid History */}
        <div style={{ marginTop: "1rem", width: "100%", flex: 1 }}>
          <h4 style={{ color: "#fff" }}>Bid History</h4>
          <div style={{ borderRadius: "0.5rem", maxHeight: "150px", overflowY: "auto", padding: "1.5rem", color: "#fff", flex: 1 }}>
            {bidHistory.length === 0 ? (
              <p>No bids yet</p>
            ) : (
              bidHistory.map((b, i) => (
                <p key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", margin: 0, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <span>💰 {b.amount}</span>
                  <span>{b.bidder_username || "Anonymous"}</span>
                  <span>{new Date(b.timestamp).toLocaleTimeString()}</span>
                </p>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
