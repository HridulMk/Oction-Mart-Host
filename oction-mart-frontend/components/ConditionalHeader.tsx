"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import BuyerHeader from "./BuyerHeader";
import SellerHeader from "./SellerHeader";
import AuctioneerHeader from "./AuctioneerHeader";
import AdminHeader from "./AdminHeader";
import { useAuth } from "@/context/AuthContext"; // adjust path if needed

export default function ConditionalHeader() {
  const pathname = usePathname();
  const { user } = useAuth(); // user = { user_type: "buyer" | "seller" | "auctioneer" }

  // Paths where NO header should show at all
  const hiddenPaths = ["/explore-auctions2"];

  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  // Check logged-in user type
  if (user?.user_type === "buyer") {
    return <BuyerHeader />;
  }

  if (user?.user_type === "seller") {
    return <SellerHeader />;
  }

  if (user?.user_type === "auctioneer") {
    return <AuctioneerHeader />;
  }

  if (user?.user_type === "admin") {
    return <AdminHeader />;
  }

  // Fallback: default header
  return <Header />;
}
