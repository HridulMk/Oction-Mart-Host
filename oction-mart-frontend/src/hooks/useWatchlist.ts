// src/hooks/useWatchlist.ts
import { useState } from "react";
import { watchlistService } from "@/api/services/watchlist";
import { useAuth } from "@/context/AuthContext";

export const useWatchlist = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const addToWatchlist = async (auctionId: number) => {
    if (!user) {
      setError("You must be logged in to add to watchlist.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await watchlistService.addToWatchlist(user.id, auctionId);
      setSuccessMessage(response.data.message);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to add to watchlist."
      );
    } finally {
      setLoading(false);
    }
  };

  return { addToWatchlist, loading, error, successMessage };
};
