"use client";

import { Box, Paper, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AnalyticsIcon from "@mui/icons-material/Analytics";

// Node positions (increased spacing)
const nodes = [
  { id: "home", label: "Home", icon: <HomeIcon />, x: 0, y: 0 },
  { id: "about", label: "About", icon: <InfoIcon />, x: -250, y: 150 },
  { id: "login", label: "Login", icon: <LoginIcon />, x: 250, y: 150 },
  { id: "adminDash", label: "Admin Dashboard", icon: <DashboardIcon />, x: -250, y: 300 },
  { id: "auctioneerDash", label: "Auctioneer Dashboard", icon: <DashboardIcon />, x: -80, y: 300 },
  { id: "sellerDash", label: "Seller Dashboard", icon: <DashboardIcon />, x: 80, y: 300 },
  { id: "buyerDash", label: "Buyer Dashboard", icon: <DashboardIcon />, x: 250, y: 300 },
  { id: "adminAnalytics", label: "Admin Analytics", icon: <AnalyticsIcon />, x: -250, y: 500 },
  { id: "auctioneerAnalytics", label: "Auctioneer Analytics", icon: <AnalyticsIcon />, x: -80, y: 500 },
  { id: "sellerAnalytics", label: "Seller Analytics", icon: <AnalyticsIcon />, x: 80, y: 500 },
  { id: "buyerAnalytics", label: "Buyer Analytics", icon: <AnalyticsIcon />, x: 250, y: 500 },
];

// Edges
const edges: [string, string][] = [
  ["home", "about"],
  ["home", "login"],
  ["login", "adminDash"],
  ["login", "auctioneerDash"],
  ["login", "sellerDash"],
  ["login", "buyerDash"],
  ["adminDash", "adminAnalytics"],
  ["auctioneerDash", "auctioneerAnalytics"],
  ["sellerDash", "sellerAnalytics"],
  ["buyerDash", "buyerAnalytics"],
];

const VisualSitemap: React.FC = () => {
  const containerWidth = 900; // wider container
  const containerHeight = 600; // taller container for more spacing

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: containerHeight,
        backgroundColor: "#222",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 4,
      }}
    >
      <Box sx={{ position: "relative", width: containerWidth, height: containerHeight }}>
        {/* Draw edges */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          {edges.map(([fromId, toId], index) => {
            const from = nodes.find((n) => n.id === fromId)!;
            const to = nodes.find((n) => n.id === toId)!;
            const offsetX = containerWidth / 2;
            return (
              <line
                key={index}
                x1={from.x + offsetX + 70}
                y1={from.y + 40}
                x2={to.x + offsetX + 70}
                y2={to.y + 40}
                stroke="#fff"
                strokeWidth={2}
              />
            );
          })}
        </svg>

        {/* Render nodes */}
        {nodes.map((node) => (
          <Paper
            key={node.id}
            sx={{
              position: "absolute",
              left: node.x + containerWidth / 2,
              top: node.y,
              width: 140,
              padding: 2,
              textAlign: "center",
              backgroundColor: "#1976d2",
              color: "#fff",
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": { boxShadow: 6 },
            }}
          >
            {node.icon}
            <Typography mt={1}>{node.label}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default VisualSitemap;