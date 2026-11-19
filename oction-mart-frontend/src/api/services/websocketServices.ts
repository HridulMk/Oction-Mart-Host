// src/api/services/websocketServices.ts

type MessageHandler = (data: AuctionWSMessage) => void;
type ErrorHandler = (error: Event) => void;
type CloseHandler = () => void;

export type AuctionWSMessage = {
  bid_amount: number;
  buyer: string;
  timestamp: string;
  error?: string;
};

interface WebSocketConnection {
  sendBid: (amount: number) => void;
  disconnect: () => void;
}

// src/api/services/web.ts

export function connectToAuctionWebSocket(
  auctionId: string,
  token: string,
  onMessage: (data: any) => void
) {
  // ✅ Make sure ws:// or wss:// matches your backend
  const wsUrl = `ws://localhost:8000/ws/bid/${auctionId}`;

  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("❌ Failed to parse WebSocket message", err);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
  };

  return {
    sendBid: (amount: number, buyerId: number) => {
      const payload = JSON.stringify({ bid_amount: amount, buyer_id: buyerId });
      socket.send(payload);
    },
    disconnect: () => {
      socket.close();
    },
  };
}
import { useEffect, useState } from "react";