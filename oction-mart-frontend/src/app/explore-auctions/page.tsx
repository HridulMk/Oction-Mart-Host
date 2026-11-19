"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api";

interface AuctionItem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  auction_status: "live" | "upcoming" | "ended" | string;
  price?: number;
  category?: string;
  auction_end?: string;
   // Assume end time is provided by the API
}

const ITEM_CATEGORY_CHOICES = [
  ['art', 'Art & Paintings'],
  ['antiques', 'Antiques & Collectibles'],
  ['jewelry', 'Jewelry & Watches'],
  ['furniture', 'Furniture & Home Décor'],
  ['electronics', 'Electronics & Gadgets'],
  ['vehicles', 'Vehicles (Cars, Bikes, etc.)'],
  ['real_estate', 'Real Estate'],
  ['fashion', 'Fashion & Accessories'],
  ['books', 'Books & Manuscripts'],
  ['sports', 'Sports & Memorabilia'],
  ['coins', 'Coins & Stamps'],
  ['industrial', 'Industrial & Machinery'],
  ['other', 'Other'],
];

const formatTime = (seconds: number) => {
  if (seconds < 0) return "Auction Ended";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ExplorePage: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAuctionType, setSelectedAuctionType] = useState<
    "live" | "upcoming" | "ended"
  >("live");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [category, setCategory] = useState("all");

  const router = useRouter();

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const response = await api.get("/auctions/", { params: { limit: 100 } });
        const fetchedAuctions: AuctionItem[] = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        let filtered = fetchedAuctions.filter(
          (auction) => auction.auction_status === selectedAuctionType
        );

        if (searchTerm.trim() !== "") {
          filtered = filtered.filter(
            (auction) =>
              auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (auction.description &&
                auction.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        if (category !== "all") {
          filtered = filtered.filter(
            (auction) => auction.category?.toLowerCase() === category.toLowerCase()
          );
        }

        if (sortBy === "latest") {
          filtered = filtered.sort((a, b) => b.id - a.id);
        } else if (sortBy === "low") {
          filtered = filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === "high") {
          filtered = filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        setAuctions(filtered);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Failed to load auctions. Please Log in and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [selectedAuctionType, searchTerm, sortBy, category]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(currentAuctions => 
        currentAuctions.map(auction => {
          if (auction.auction_status === 'live' && auction.auction_end) {
            const remaining = Math.max(0, Math.floor((new Date(auction.auction_end).getTime() - Date.now()) / 1000));
            return { ...auction, remainingTime: remaining };
          }
          return auction;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [auctions]);

  const commonCategories = ["electronics", "fashion", "vehicles", "art"];
  
  const endSoonStyle = {
    animation: 'blink 1s infinite',
    backgroundColor: '#dc2626',
    boxShadow: '0 0 10px #dc2626'
  };

  const timerTextEndSoon = {
    color: '#fff',
    fontWeight: 'bold',
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1c1c38",
        color: "#ffffff",
        fontFamily: "sans-serif",
        padding: "24px",
      }}
    >
      <style>
        {`
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            maxWidth: "800px",
            color: "#fff",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            lineHeight: "1.2",

          }}
        >
          Find Your Auctions
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            maxWidth: "600px",
            color: "#b0b0d0",
          }}
        >
          Bid on unique items, from vintage collectibles to modern electronics,
          all from the comfort of your home
        </p>

        <div style={{ margin: "2rem 0 1rem", display: "flex", gap: "0.75rem" }}>
          {(["live", "upcoming", "ended"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedAuctionType(type)}
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "50px",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  selectedAuctionType === type ? "#6a5acd" : "transparent",
                color: "#fff",
                fontWeight: "600",
                border: "1px solid #4a4a6e",
                transition: "background-color 0.2s",
              }}
            >
              {type.toUpperCase()} AUCTION
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            width: "100%",
            maxWidth: "800px",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: "1",
              minWidth: "200px",
              padding: "0.75rem 1.25rem",
              borderRadius: "50px",
              border: "1px solid #4a4a6e",
              backgroundColor: "#2c2c54",
              color: "#fff",
            }}
          />
          <button
            onClick={() => {}}
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "50px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontWeight: "600",
              transition: "background-color 0.2s",
            }}
          >
            SEARCH
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "10px 15px",
              borderRadius: "50px",
              border: "1px solid #4a4a6e",
              backgroundColor: "#2c2c54",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="latest">Sort by: Latest</option>
            <option value="low">Sort by: Price Low to High</option>
            <option value="high">Sort by: Price High to Low</option>
          </select>
          <button
            style={{
              padding: "10px 15px",
              borderRadius: "50px",
              border: "1px solid #4a4a6e",
              backgroundColor: "#2c2c54",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ADD FILTER
          </button>
        </div>
      </div>
      <hr style={{ border: "1px solid #4a4a6e", margin: "40px 0" }} />
      <div style={{ padding: "0 24px" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Browse Auctions
        </h2>
        {loading && <p style={{ textAlign: "center" }}>Loading auctions...</p>}
        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}
        {!loading && auctions.length === 0 && (
          <p style={{ textAlign: "center" }}>
            No {selectedAuctionType} auctions found matching your criteria.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {auctions.map((auction) => (
            <div
              key={auction.id}
              style={{
                backgroundColor: auction.auction_status === "live" && (auction.auction_end ?? Infinity) <= 1800 ? '#dc2626' : "#2c2c54",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                padding: "16px",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                animation: auction.auction_status === "live" && (auction.auction_end ?? Infinity) <= 1800 ? 'blink 1s infinite' : 'none'
              }}
            >
              {auction.image ? (
                <img
                  src={auction.image}
                  alt={auction.title}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "160px",
                    backgroundColor: "#4a4a6e",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#b0b0d0",
                  }}
                >
                  No Image
                </div>
              )}
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: "#fff",
                }}
              >
                {auction.title}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#b0b0d0",
                  marginBottom: "6px",
                }}
              >
                {auction.description}
              </p>
              {auction.price && (
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  ₹{auction.price}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    backgroundColor:
                      auction.auction_status === "live"
                        ? "#bbf7d0"
                        : auction.auction_status === "upcoming"
                        ? "#fef9c3"
                        : "#fecaca",
                    color:
                      auction.auction_status === "live"
                        ? "#166534"
                        : auction.auction_status === "upcoming"
                        ? "#854d0e"
                        : "#991b1b",
                    fontWeight: "500",
                  }}
                >
                  {auction.auction_status.toUpperCase()}
                </span>
                {auction.auction_status === 'live' && (
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: (auction.remainingTime ?? Infinity) <= 1800 ? '#fff' : '#2563eb',
                    }}
                  >
                    {formatTime(auction.remainingTime ?? 0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => router.push(`/product2/${auction.id}`)}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor:
                    auction.auction_status === "live" ? "#2563eb" : "#6b7280",
                  color: "#fff",
                  fontWeight: "600",
                  transition: "0.2s",
                }}
              >
                {auction.auction_status === "live"
                  ? "Participate in Auction"
                  : "View Details"}
              </button>
            </div>
          ))}
        </div>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginTop: "24px" }}>
          {commonCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "10px 20px",
                borderRadius: "50px",
                border: "1px solid #4a4a6e",
                backgroundColor: category === cat ? "#6a5acd" : "#2c2c54",
                color: "#fff",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {ITEM_CATEGORY_CHOICES.find(([value]) => value === cat)?.[1] || cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setCategory('all')}
            style={{
              padding: "10px 20px",
              borderRadius: "50px",
              border: "1px solid #4a4a6e",
              backgroundColor: category === 'all' ? "#6a5acd" : "#2c2c54",
              color: "#fff",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            All Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;