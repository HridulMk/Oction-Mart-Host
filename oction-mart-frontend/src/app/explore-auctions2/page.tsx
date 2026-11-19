"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { auctionService, AuctionItem } from '@/api/services/auctions';

// Types
interface AuctionItem {
  id: number;
  title: string;
  description: string;
  image: string;
  start_price: number;
  auction_start: string | null;
  auction_end: string | null;
}

// ⏳ Countdown hook
function useCountdown(endTime: string | null) {
  const calculateTime = () => {
    if (!endTime) return { timeLeft: "No End Time", isExpired: false };

    const difference = new Date(endTime).getTime() - new Date().getTime();
    if (difference <= 0) return { timeLeft: "Expired", isExpired: true };

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    let formatted = "";
    if (days > 0) formatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    else if (hours > 0) formatted = `${hours}h ${minutes}m ${seconds}s`;
    else formatted = `${minutes}m ${seconds}s`;

    return { timeLeft: formatted, isExpired: false };
  };

  const [timeData, setTimeData] = useState(calculateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(calculateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return timeData;
}

// ⭐ Main Page
export default function ExploreAuctionsPage() {
  const [getAuctions, setAuctions] = useState<AuctionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

    const [auction, setItem] = useState<AuctionItem | null>(null);

    const [timeLeft, setTimeLeft] = useState<string>("--:--:--");

  // Fetch auctions
  
    useEffect(() => {
      fetchAuctions();
    }, []);
  
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingFallback(false);
        
        const auctions = await auctionService.getAuctions();
        setAuctions(auction);
      } catch (error: any) {
        console.error('Failed to fetch featured auctions:', error);
        
        // Check if it's a network error (backend not available)
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          setError('Backend server is not available. Showing demo data.');
          
        } else {
          setError(error.response?.data?.message || 'Failed to load featured auctions');
          setAuctions([]);
        }
      } finally {
        setLoading(false);
      }
    };

  // Separate active & past
  const activeAuctions = auctions.filter(
    (auction) => !useCountdown(auction.auction_end).isExpired
  );
  const pastAuctions = auctions.filter(
    (auction) => useCountdown(auction.auction_end).isExpired
  );

  const displayedAuctions =
    activeTab === "active" ? activeAuctions : pastAuctions;

  return (
    <div style={{ padding: "30px", backgroundColor: "#121212", minHeight: "100vh" }}>
      <h1 style={{ color: "white", fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
        Explore Auctions
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "active" ? "#2563eb" : "#333",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Active Auctions
        </button>
        <button
          onClick={() => setActiveTab("past")}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "past" ? "#2563eb" : "#333",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Past Auctions
        </button>
      </div>

      {/* Auction Cards */}
      {getAuctions.length === 0 ? (
        <p style={{ color: "#aaa" }}>No {activeTab} auctions available.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {getAuctions.map((auction) => {
            const { timeLeft, isExpired } = useCountdown(auction.auction_end);

            return (
              <div
                key={auction.id}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    height: "180px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={`http://127.0.0.1:8000${auction.image}`}
                    alt={auction.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Info */}
                <h3 style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>
                  {auction.title}
                </h3>
                <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "12px" }}>
                  {auction.description}
                </p>
                <p style={{ color: "#bbb", marginBottom: "8px" }}>
                  <strong>Starting Bid:</strong> ${auction.start_price}
                </p>

                {/* Timer */}
                <p
                  style={{
                    color: isExpired ? "#f56565" : "#48bb78",
                    fontWeight: "bold",
                  }}
                >
                  {timeLeft}
                </p>

                {/* View Button */}
                <button
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "bold",
                    marginTop: "10px",
                  }}
                  onClick={() => router.push(`/items/${auction.id}`)}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
