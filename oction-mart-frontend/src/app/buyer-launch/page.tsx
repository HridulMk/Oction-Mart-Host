"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auctionService, AuctionItem } from "@/api/services/auctions";

export default function BuyerLaunch() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        const data: unknown = await auctionService.getFeaturedAuctions();
        console.log("API response:", data);

        // normalize to array
        if (Array.isArray(data)) {
          setAuctions(data as AuctionItem[]);
        } else if (
          typeof data === "object" &&
          data !== null &&
          Array.isArray((data as { auctions?: unknown }).auctions)
        ) {
          setAuctions((data as { auctions: AuctionItem[] }).auctions);
        } else {
          setAuctions([]);
        }
      } catch (err) {
        console.error("Failed to load auctions:", err);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuctions();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
        fontFamily: "sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Header Area with BG image */}
      <header
        style={{
          width: "100%",
          minHeight: 580,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
          background: `url('/products/III.png') center/cover no-repeat`,
          boxSizing: "border-box",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.55)",
            zIndex: 0,
          }}
        />
        {/* Hero Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            minHeight: 260,
            marginTop: 18,
          }}
        >
          <img
            src="/logo2.jpg"
            alt="logo"
            style={{
              width: 120,
              height: 120,
              borderRadius: 16,
              marginBottom: 12,
              objectFit: "cover",
            }}
          />
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "black ",
              margin: 0,
              letterSpacing: 1,
              textShadow: "0 2px 8px #fff8",
            }}
          >
            Oction Mart
          </h1>
          <div
            style={{
              color: "black",
              fontSize: 22,
              margin: "10px 0 24px 0",
              fontWeight: 500,
              textShadow: "0 2px 8px #fff8",
            }}
          >
            Where Shopping Becomes a Winning Game
          </div>
          <a href="/explore-auctions" style={startBiddingBtnStyle}>
            Start Bidding
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          background: "#181818",
          color: "#fff",
          padding: 0,
          margin: 0,
          minHeight: 900,
        }}
      >
        {/* Recently Viewed (now shows featured auctions) */}
        <section
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "2rem 1rem 0 1rem",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: "#fff" }}>
            Recent Auctions
          </h2>

          {loading ? (
            <p>Loading auctions...</p>
          ) : auctions.length === 0 ? (
            <p>No Recent auctions available.</p>
          ) : (
            auctions.slice(0, 2).map((auction, idx) => (
              <div
                key={auction.id}
                style={{
                  display: "flex",
                  background: "#232323",
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 24,
                }}
              >
                {/* Alternate layout left/right */}
                {idx % 2 === 0 && (
                  <img
                    
  src={auction.image ? `http://127.0.0.1:8000${auction.image}` : "/placeholder.jpg"}
                    alt={auction.title}
                    style={{ width: 220, height: 140, objectFit: "cover" }}
                  />
                )}
                <div
                  style={{
                    flex: 1,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                      marginBottom: 4,
                    }}
                  >
                    {auction.title}
                  </div>
                  <div
                    style={{
                      color: "#bbb",
                      fontSize: 14,
                      marginBottom: 10,
                    }}
                  >
                    {auction.description}
                  </div>
                  <Link href={`/product2/${auction.id}`}>
                    <button style={bidNowBtnStyle}>Bid Now</button>
                  </Link>
                  <span
  style={{
    color: "#ffe066",
    fontWeight: 600,
    fontSize: 15,
    marginTop: 8,
  }}
>
  Ends: {
    (() => {
      if (!auctions.auction_end) return "Auction Ended";

      const endDate = new Date(auctions.auction_end.replace(" ", "T"));
      if (isNaN(endDate.getTime())) return "Auction Ended";

      return new Date() > endDate ? "Auction Ended" : endDate.toLocaleString();
    })()
  }
</span>

                </div>
                {idx % 2 === 1 && (
                  <img
                    
  src={auction.image ? `http://127.0.0.1:8000${auction.image}` : "/placeholder.jpg"}
                    alt={auction.title}
                    style={{ width: 220, height: 140, objectFit: "cover" }}
                  />
                )}
              </div>
            ))
          )}
        </section>

        {/* Keep your other sections unchanged */}
       <section
  style={{
    maxWidth: 900,
    margin: "0 auto",
    padding: "1rem 1rem 0 1rem",
  }}
>
  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
    Featured Auctions
  </h2>
  <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
    {/* Featured Auction (first auction) */}
    {auctions[0] ? (
      <div
        style={{
          flex: 2,
          background: "#232323",
          borderRadius: 16,
          overflow: "hidden",
          padding: 0,
        }}
      >
        <img
          src={
            auctions[3].image
              ? `http://127.0.0.1:8000${auctions[3].image}`
              : "/placeholder.jpg"
          }
          alt={auctions[3].title}
          style={{ width: "100%", height: 220, objectFit: "cover" }}
        />
        <div style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
            {auctions[3].title}
          </div>
          <div style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}>
            {auctions[3].description}
          </div>
          <div style={{ color: "#fff", fontWeight: 600 }}>
            Starting at ${auctions[3].start_price}
          </div>
        </div>
      </div>
    ) : (
      <p style={{ color: "#bbb" }}>No featured auction available</p>
    )}

    {/* Secondary Auction (second auction) */}
    {auctions[1] ? (
      <div
        style={{
          flex: 1,
          background: "#232323",
          borderRadius: 16,
          overflow: "hidden",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <img
          src={
            auctions[1].image
              ? `http://127.0.0.1:8000${auctions[4].image}`
              : "/placeholder.jpg"
          }
          alt={auctions[4].title}
          style={{ width: "100%", height: 100, objectFit: "cover" }}
        />
        <div style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            {auctions[4].title}
          </div>
          <div style={{ color: "#bbb", fontSize: 13, marginBottom: 10 }}>
            {auctions[4].description}
          </div>
          <div style={{ color: "#fff", fontWeight: 600 }}>
            Starting at ${auctions[4].start_price}
          </div>
        </div>
      </div>
    ) : (
      <p style={{ color: "#bbb" }}>No secondary auction available</p>
    )}
  </div>
</section>


        <section
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "1rem 1rem 2rem 1rem",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
            Section heading
          </h2>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}
              >
                Subheading
              </div>
              <div
                style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}
              >
                Add some text here...
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}
              >
                Subheading
              </div>
              <div
                style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}
              >
                Add some text here...
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}
              >
                Subheading
              </div>
              <div
                style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}
              >
                Add some text here...
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// ===== Styles =====
const startBiddingBtnStyle = {
  background: "#222",
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

const bidNowBtnStyle = {
  background: "#fff",
  color: "#222",
  border: "none",
  fontSize: 15,
  fontWeight: 600,
  borderRadius: 6,
  padding: "0.4rem 1.2rem",
  cursor: "pointer",
  marginTop: 4,
};
