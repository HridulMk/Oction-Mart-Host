"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auctionService } from "@/api/services/auctions"; // adjust path

export default function SellerLaunchPage() {
  const router = useRouter();
  const [featuredAuctions, setFeaturedAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await auctionService.getFeaturedAuctions();
        setFeaturedAuctions(data);
      } catch (error) {
        console.error("Error fetching featured auctions:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const formatAuctionEnd = (dateStr: string) => {
    if (!dateStr) return "Auction Ended";
    const endDate = new Date(dateStr.replace(" ", "T"));
    if (isNaN(endDate.getTime())) return "Auction Ended";
    return new Date() > endDate ? "Auction Ended" : endDate.toLocaleString();
  };

  // Testimonials data
  const testimonials = [
    { id: '1', quote: 'Oction Mart made selling my antique collection incredibly easy and profitable. Highly recommend!', name: 'Jane Doe', role: 'Antique Dealer' },
    { id: '2', quote: 'The platform is intuitive, and I love the reach it gives my small business. Excellent support too!', name: 'John Smith', role: 'Local Artisan' },
    { id: '3', quote: 'Listing was a breeze, and my items sold faster than I expected. A great experience overall!', name: 'Emily White', role: 'Collector' }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ padding: '6rem 1rem 4rem', backgroundColor: '#1a1a2e', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Sell Your Items with Ease
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#d1d5db', marginBottom: '3rem', lineHeight: '1.6' }}>
            Reach a global audience of eager buyers and maximize your profits through our dynamic auction platform.
          </p>
          <div style={{
            width: '100%',
            height: '300px',
            backgroundColor: '#374151',
            borderRadius: '0.75rem',
            marginBottom: '4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: '1.125rem'
          }}>
            <img src="/wallpaper/sellerhome.jpg" alt="hero" style={{ width: 800, height: 300, objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section style={{ padding: '4rem 1rem', backgroundColor: '#2c2c4a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
            Why Choose Oction Mart to Sell?
          </h2>
          <p style={{ color: '#d1d5db', fontSize: '1.125rem', textAlign: 'center', marginBottom: '3rem', lineHeight: '1.6' }}>
            Our platform is designed to make selling simple, secure, and profitable. Benefit from our extensive buyer network and intuitive tools.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {[
              { id: '1', title: 'Global Audience', description: 'Connect with thousands of buyers worldwide, expanding your market reach.' },
              { id: '2', title: 'Simple Listing Process', description: 'Our user-friendly interface makes listing your items quick and effortless.' },
              { id: '3', title: 'Secure & Transparent', description: 'Enjoy peace of mind with our secure payment processing and clear auction rules.' },
              { id: '4', title: 'Maximize Your Profit', description: 'Competitive bidding ensures you get the best possible price for your items.' }
            ].map(feature => (
              <div key={feature.id} style={{
                backgroundColor: '#374151',
                borderRadius: '0.75rem',
                padding: '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.backgroundColor = '#4b5563'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = '#374151'; }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>{feature.title}</h3>
                <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5' }}>{feature.description}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link 
              href="/seller-listing"
              style={{
                backgroundColor: '#8A2BE2',
                color: 'white',
                fontWeight: 'bold',
                padding: '1.25rem 3rem',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6A1EB2'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#8A2BE2'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Start Selling Now
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ background: "#1a1a2e", color: "#fff", padding: 0, margin: 0, minHeight: 900 }}>
        {/* Featured Auctions */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem 0 1rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Recent Auctions</h2>
          {loading ? (
            <div style={{ color: "#fff" }}>Loading...</div>
          ) : featuredAuctions.length === 0 ? (
            <div style={{ color: "#fff" }}>No featured auctions available.</div>
          ) : (
            featuredAuctions.slice(0, 3).map((auction) => ( 

              <div key={auction.id} style={{ display: "flex", background: "#2c2c4a", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
                <img
                  src={`http://127.0.0.1:8000${auction.image || "/placeholder.jpg"}`}
                  alt={auction.title}
                  style={{ width: 220, height: 140, objectFit: "cover" }}
                />
                <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{auction.title}</div>
                  <div style={{ color: "#bbb", fontSize: 14, marginBottom: 10 }}>{auction.description}</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button style={manageBtnStyle}>Manage</button>
                    <button
  style={viewBtnStyle}
  onClick={() => (window.location.href = `/BiddingLive/${auction.id} `)}
>
  View Bids
</button>

                  </div>
                  <span style={{ color: "#ffe066", fontWeight: 600, fontSize: 15, marginTop: 8 }}>Current Bid: ${auction.final_price}</span>
                  <span style={{ color: "#ffe066", fontWeight: 600, fontSize: 15, marginTop: 4 }}>
                    Ends: {formatAuctionEnd(auction.auction_end)}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Quick Stats */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1rem 0 1rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color:"#2c2c4a" }}>Quick Stats</h2>
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            <div style={{ flex: 1, background: "#2c2c4a", borderRadius: 16, overflow: "hidden", padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: "#8A2BE2" }}>Total Earnings</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>$12,450</div>
              <div style={{ color: "#bbb", fontSize: 14, marginTop: 8 }}>This month</div>
            </div>
            <div style={{ flex: 1, background: "#2c2c4a", borderRadius: 16, overflow: "hidden", padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: "#8A2BE2" }}>Active Listings</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>8</div>
              <div style={{ color: "#bbb", fontSize: 14, marginTop: 8 }}>Currently running auctions</div>
            </div>
          </div>
        </section>

        {/* Recent Sales */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1rem 2rem 1rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color:"#2c2c4a" }}>Recent Sales</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[1,2,3,4].map((id) => (
              <div key={id} style={{ flex: "1 1 calc(50% - 12px)", background: "#2c2c4a", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Item {id}</div>
                <div style={{ color: "#bbb", fontSize: 14 }}>Sold for ${100 + id * 20}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ padding: "4rem 1rem", backgroundColor: "#2c2c4a" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff", marginBottom: "1rem" }}>What Our Sellers Say</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
              {testimonials.map(t => (
                <div key={t.id} style={{ backgroundColor: "#374151", borderRadius: 12, padding: 20, color: "#d1d5db" }}>
                  <p style={{ fontStyle: "italic", marginBottom: 8 }}>"{t.quote}"</p>
                  <strong style={{ display: "block", marginBottom: 2 }}>{t.name}</strong>
                  <span style={{ fontSize: 14, color: "#bbb" }}>{t.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: "4rem 1rem", backgroundColor: "#1a1a2e", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff", marginBottom: "1rem" }}>Ready to Sell?</h2>
          <p style={{ color: "#d1d5db", fontSize: "1.125rem", marginBottom: "2rem" }}>
            Join thousands of sellers already maximizing their profits with Oction Mart.
          </p>
          <Link 
            href="/seller-listing"
            style={{
              backgroundColor: '#8A2BE2',
              color: 'white',
              fontWeight: 'bold',
              padding: '1.25rem 3rem',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'inline-block',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6A1EB2'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#8A2BE2'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Start Selling Now
          </Link>
        </section>
      </main>
    </div>
  );
}

// Button Styles
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
