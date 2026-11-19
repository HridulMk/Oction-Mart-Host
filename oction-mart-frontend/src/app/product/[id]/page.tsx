"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auctionService, AuctionItem, Bid, calculateBidLimits,watchlistService } from "@/api/services/auctions";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext"; // adjust path as needed

const IMAGE_SIZE = 470;
const CARD_RADIUS = 18;
const CARD_SHADOW = "0 0 32px 0 #8A2BE233";
const AUCTION_CARD_WIDTH = 600;
const AUCTION_CARD_HEIGHT = 500;

const ProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth(); 

  const [item, setItem] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("--:--:--");

  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [autoBidBudget, setAutoBidBudget] = useState<number | null>(null);
  const [lastUserBid, setLastUserBid] = useState<number | null>(null);

  const { minimumBid, maximumBid } = calculateBidLimits(item, bidHistory);

  // Load token
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("authToken"));
    }
  }, []);

  // Restore Auto-Bid state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      const savedAutoBid = localStorage.getItem(`autoBidEnabled_${id}`);
      const savedBudget = localStorage.getItem(`autoBidBudget_${id}`);
      if (savedAutoBid === "true") setAutoBidEnabled(true);
      if (savedBudget) setAutoBidBudget(Number(savedBudget));
    }
  }, [id]);

  // Fetch auction item
  useEffect(() => {
    if (!id || !token) return;

    const fetchItem = async () => {
      try {
        const fetchedItem = await auctionService.getAuctionItemById(Number(id), token);
        setItem(fetchedItem);
      } catch (err) {
        console.error(err);
        setError("Failed to load item. Log in to view details.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, token]);

  // Poll bid history & Auto-Bid logic
  useEffect(() => {
    if (!id || !token) return;

    const fetchBidHistory = async () => {
      try {
        const bids = await auctionService.getBidHistory(Number(id), token);
        const sortedBids = bids.sort((a, b) => b.amount - a.amount);
        setBidHistory(sortedBids);

        if (
          autoBidEnabled &&
          user?.user_type === "buyer" &&
          autoBidBudget !== null &&
          item
        ) {
          const currentHighest = sortedBids[0];
          const userLastBidValue = lastUserBid ?? 0;

          if (currentHighest && Number(currentHighest.amount) > userLastBidValue) {
            let newAutoBid = Number(currentHighest.amount) + 1000;

            // Respect user's budget
            if (newAutoBid > autoBidBudget) newAutoBid = autoBidBudget;

            // Ensure within maximumBid limits
            const { maximumBid } = calculateBidLimits(item, sortedBids);
            if (newAutoBid > maximumBid) newAutoBid = maximumBid;

            // Only place bid if it is higher than user's last bid
            if (newAutoBid > userLastBidValue) {
              try {
                const newBid = await auctionService.placeBid(item.id, newAutoBid, token);
                toast.success(`🔔 Auto-bid placed: ${newAutoBid}`);
                setBidHistory(prev => [newBid, ...prev]);
                setItem(prev => prev ? { ...prev, currentBid: String(newBid.amount) } : prev);
                setLastUserBid(newAutoBid);
              } catch (err) {
                console.error("Auto-bid failed:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch bid history:", err);
      }
    };

    fetchBidHistory();
    const interval = setInterval(fetchBidHistory, 1000);
    return () => clearInterval(interval);
  }, [id, token, autoBidEnabled, lastUserBid, item, user, autoBidBudget]);

  // Countdown timer
  useEffect(() => {
    if (!item?.auction_end) return;
    const interval = setInterval(() => {
      const diff = new Date(item.auction_end).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [item?.auction_end]);

  if (loading) return <p style={{ color: "white" }}>Loading...  Please Log In to View Page...</p>; 
  if (error || !item) return <p style={{ color: "red" }}>{error || "Item not found"}</p>;

  // Place bid
  const handlePlaceBid = async () => {
    if (!item || !token) {
      router.push("/buyer-login-app?role=buyer");
      return;
    }

    if (user?.user_type !== "buyer") {
      toast.error("❌ Only buyers can place bids");
      return;
    }

    const bidValue = Number(bidAmount);
    if (isNaN(bidValue)) {
      toast.error("❌ Enter a valid number");
      return;
    }

    if (bidValue <= minimumBid || bidValue > maximumBid) {
      toast.error(`❌ Bid must be between ${minimumBid + 1} and ${maximumBid}`);
      return;
    }

    try {
      const newBid = await auctionService.placeBid(item.id, bidValue, token);
      toast.success("✅ Bid placed successfully!");
      setBidAmount("");
      setBidHistory(prev => [newBid, ...prev]);
      setItem(prev => prev ? { ...prev, currentBid: String(newBid.amount) } : prev);
      setLastUserBid(bidValue);
    } catch (err: any) {
      console.error("❌ Bid failed:", err);
      toast.error("❌ Failed to place bid");
    }
  };

  const auctionEnded = new Date() >= new Date(item.auction_end);
  const highestBid = bidHistory.reduce((max, bid) => {
    const bidAmount = Number(bid.amount);
    const maxAmount = Number(max.amount);
    return bidAmount > maxAmount ? bid : max;
  }, bidHistory[0] || { amount: 0, bidder_username: "None", timestamp: "" });

 

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #181a2a 0%, #23243a 100%)", fontFamily: "Inter, Arial, sans-serif" }}>
      <Toaster position="top-right" reverseOrder={false} />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2.7rem", fontWeight: 900, color: "#fff" }}>{item.title}</h1>
          <p style={{ color: "#e0e0e0" }}>{item.description}</p>
        </div>

        {/* Image + Auction Details */}
        <div style={{ display: "flex", gap: "2.5rem" }}>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <img src={item.image} alt={item.title} style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: CARD_RADIUS, objectFit: "cover" }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ width: AUCTION_CARD_WIDTH, minHeight: AUCTION_CARD_HEIGHT, background: "#7A8D7E", borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, padding: "1.5rem", color: "#fff" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Auction Details</h2>
              <div style={{ display: "flex", justifyContent: "space-between" }}> 
                <div style={{ color: "#FFD700", fontWeight: 700 }}> Start Price: {item.start_price} </div> 
                <div style={{ color: "#FF6B6B", fontWeight: 700 }}> Time Remaining: {timeLeft} </div> 
              </div>

              {/* Place Bid */}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter your bid"
                  disabled={auctionEnded}
                  style={{
                    flex: 1,
                    padding: "0.7rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #ccc",
                    color: "black",
                    fontSize: "1rem",
                    backgroundColor: auctionEnded ? "#f0f0f0" : "white",
                    cursor: auctionEnded ? "not-allowed" : "text"
                  }}
                />
                <button
                  onClick={handlePlaceBid}
                  disabled={auctionEnded}
                  style={{
                    background: "#23243a",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    padding: "0.7rem 1.2rem",
                    borderRadius: "0.5rem",
                    cursor: auctionEnded ? "not-allowed" : "pointer",
                    boxShadow: "2px 2px 6px rgba(20, 0, 0, 0.25), 1px 1px 3px rgba(20, 0, 0, 0.15)",
                    opacity: auctionEnded ? 0.6 : 1
                  }}
                >
                  Place Bid
                </button>
              </div>

              {/* Auto-Bid Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
                <input
                  type="checkbox"
                  id="autobid"
                  checked={autoBidEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      const budgetStr = prompt("Enter your maximum Auto-Bid budget:");
                      const budgetNum = budgetStr ? Number(budgetStr) : null;

                      if (!budgetNum || isNaN(budgetNum) || budgetNum <= 0) {
                        toast.error("❌ Invalid budget. Auto-Bid disabled.");
                        setAutoBidEnabled(false);
                        return;
                      }

                      setAutoBidBudget(budgetNum);
                      if (id) localStorage.setItem(`autoBidBudget_${id}`, budgetNum.toString());
                    } else {
                      setAutoBidBudget(null);
                      if (id) localStorage.removeItem(`autoBidBudget_${id}`);
                    }
                    setAutoBidEnabled(checked);
                    if (id) localStorage.setItem(`autoBidEnabled_${id}`, checked.toString());
                  }}
                />
                <label htmlFor="autobid">Enable Auto-Bid</label>
              </div>

              <div style={{ color: '#23243a', fontSize: '0.97rem', marginBottom: '0.7rem' }}>
                <span>Minimum Next Bid: <b>${minimumBid}</b></span> &nbsp; | &nbsp; <span>Maximum Bid: <b>${maximumBid}</b></span>
              </div>

              {/* Bid History */}
              <div style={{ marginTop: "1rem" }}>
                <h4>Bid History</h4>
                <div style={{ background: "#2a3a2a", borderRadius: "0.5rem", maxHeight: "150px", overflowY: "auto", padding: "1.5rem", color: "#fff" }}>
                  {bidHistory.length === 0 ? <p>No bids yet</p> : bidHistory.map((b, i) => (
                    <p key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", margin: 0, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <span>💰 {b.amount}</span>
                      <span>{b.bidder_username || "Anonymous"}</span>
                      <span>{new Date(b.timestamp).toLocaleTimeString()}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Current Highest Bidder */}
              {!auctionEnded && bidHistory.length > 0 && (
                <div style={{ marginTop: "1.5rem", background: "#1f2f1f", padding: "1rem", borderRadius: "0.5rem", color: "#fff", textAlign: "center" }}>
                  <div style={{ color: "#00FFAA", fontWeight: "bold", fontSize: "1.1rem", textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                    <p>🔝 Current Highest Bidder</p>
                  </div>
                  <p>{highestBid.bidder_username || "Anonymous"} with <strong>${highestBid.amount}</strong></p>
                </div>
              )}

            </div>
            <button
  onClick={async () => {
    if (!item || !token) {
      router.push("/buyer-login-app?role=buyer");
      return;
    }

    try {
      await watchlistService.addToWatchlist(item.id, token);
      toast.success("✅ Auction added to your watchlist!");
    } catch (err) {
      console.error("❌ Failed to add to watchlist:", err);
      toast.error("❌ Failed to add to watchlist");
    }
  }}
  style={{
    marginTop: "1rem",
    background: "#23243a",
    color: "white",
    fontWeight: "700",
    padding: "0.7rem 1.2rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    boxShadow: "2px 2px 6px rgba(20,0,0,0.25), 1px 1px 3px rgba(20,0,0,0.15)",
  }}
>
  Add to Watchlist
</button>

          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductPage;
