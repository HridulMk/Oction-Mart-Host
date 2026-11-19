"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Alert,
} from "@mui/material";

// ---------------------- Types ----------------------
type Bid = {
  id: number;
  amount: number;
  timestamp: string;
  is_winner: boolean;
  bidder_username: string;
  bidder: {
    username: string;
    first_name: string;
    last_name: string;
  } | null;
};

type AuctionItem = {
  id: number;
  title: string;
  auction_end: string;
  auction_status: "upcoming" | "live" | "ended" | "unknown";
};

// ---------------------- Styles ----------------------
const blinkingStyle = {
  animation: "blinker 1s linear infinite",
  backgroundColor: "rgba(255, 215, 0, 0.3)", // gold
};

const globalStyles = `
@keyframes blinker {
  50% { background-color: rgba(255, 215, 0, 0.1); }
}
`;

// ---------------------- Component ----------------------
export default function LiveBiddingPage() {
  const { id } = useParams();
  const [bids, setBids] = useState<Bid[]>([]);
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [wsStatus, setWsStatus] = useState<"Connecting" | "Connected" | "Disconnected">(
    "Connecting"
  );
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<{ username: string | null; winning_bid: number | null } | null>(null);

  const ws = useRef<WebSocket | null>(null);

  // ---------------------- Helpers ----------------------
  const calculateTimeLeft = (end: string): string => {
    const endTime = new Date(end).getTime();
    const now = new Date().getTime();
    const diff = endTime - now;

    if (diff <= 0) return "00:00:00";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const updateHighestBid = (bidsList: Bid[]) => {
    if (bidsList.length > 0) {
      setHighestBid(Math.max(...bidsList.map((b) => b.amount)));
    } else {
      setHighestBid(0);
    }
  };

  const getStatus = (bid: Bid): "Winner" | "Highest" | "-" => {
    if (winner?.username === bid.bidder_username) return "Winner";
    if (bid.amount === highestBid) return "Highest";
    return "-";
  };

  // ---------------------- WebSocket ----------------------
  useEffect(() => {
    if (!id) return;

    const authToken = localStorage.getItem("authToken");
    const wsUrl = authToken
      ? `ws://${window.location.host}/ws/auction/${id}/?token=${authToken}`
      : `ws://${window.location.host}/ws/auction/${id}/`;

    setWsStatus("Connecting");
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setWsStatus("Connected");
      setLoading(true);
      setError(null);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "bid_update" || data.type === "auction_state") {
          setBids(data.bidders || []);
          updateHighestBid(data.bidders || []);
          setAuction((prev) => ({ ...prev, ...data }));
          setLoading(false);

          if (data.auction_ended) setTimeLeft("00:00:00");
        }

        if (data.type === "auction_winner") {
          setWinner({
            username: data.winner,
            winning_bid: data.winning_bid,
          });
          setAuction((prev) =>
            prev
              ? { ...prev, auction_status: "ended" }
              : null
          );
          setTimeLeft("00:00:00");
        }
      } catch (e) {
        console.error("Error processing WebSocket message:", e);
        setError("Error processing live data stream.");
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setWsStatus("Disconnected");
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e);
      setError("Connection error. Real-time updates may be delayed.");
      setWsStatus("Disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [id]);

  // ---------------------- Countdown Timer ----------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (auction?.auction_end && auction.auction_status !== "ended") {
        setTimeLeft(calculateTimeLeft(auction.auction_end));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction?.auction_end, auction?.auction_status]);

  // ---------------------- Render ----------------------
  return (
    <Box sx={{ p: 3 }}>
      <style>{globalStyles}</style>

      {auction && (
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          {auction.title}
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <Chip
          label={`WebSocket: ${wsStatus}`}
          color={
            wsStatus === "Connected"
              ? "success"
              : wsStatus === "Disconnected"
              ? "error"
              : "warning"
          }
          sx={{ fontWeight: "bold" }}
        />
        {error && <Alert severity="warning" sx={{ py: 0.5 }}>{error}</Alert>}
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: "flex", justifyContent: "space-between", bgcolor: "#f5f5f5" }}>
        <Typography variant="h6" fontWeight="bold">
          Current Highest Bid: ₹{highestBid.toFixed(2)}
        </Typography>
        {auction && auction.auction_status !== "ended" && (
          <Typography variant="h6" fontWeight="bold" color="secondary">
            Time Remaining: {timeLeft}
          </Typography>
        )}
        {auction && auction.auction_status === "ended" && (
          <Typography variant="h6" fontWeight="bold" color="text.secondary">
            Auction Status: ENDED
          </Typography>
        )}
      </Paper>

      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 2, mb: 2 }} color="text.secondary">
        Live Bidding History
      </Typography>

      {loading && wsStatus === "Connecting" ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f4f4f4" }}>
                <TableCell>Username</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Bid Amount</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bids.length > 0 ? (
                bids.map((bid) => {
                  const status = getStatus(bid);
                  return (
                    <TableRow
                      key={bid.id}
                      sx={{
                        backgroundColor: status === "Highest" ? "rgba(0, 255, 0, 0.1)" : "inherit",
                        ...(status === "Winner" ? blinkingStyle : {}),
                      }}
                    >
                      <TableCell>{bid.bidder_username || bid.bidder?.username || "-"}</TableCell>
                      <TableCell>{bid.bidder?.first_name || "-"}</TableCell>
                      <TableCell>{bid.bidder?.last_name || "-"}</TableCell>
                      <TableCell>₹{bid.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(bid.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography
                          color={status === "Winner" ? "primary" : status === "Highest" ? "success.main" : "inherit"}
                          fontWeight="bold"
                        >
                          {status}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ p: 3 }}>
                    No bids recorded yet. Be the first!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
