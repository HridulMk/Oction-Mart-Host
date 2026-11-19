"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Grid,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Switch,
  AppBar,
  Toolbar,
  Avatar,
  Box,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { buyerDashboardService, BuyerDashboardResponse } from "@/api/services/dashboard";
import { useAuth } from "@/context/AuthContext";

const lightTheme = createTheme({ palette: { mode: "light", background: { default: "#70CFE0" } } });
const darkTheme = createTheme({ palette: { mode: "dark", background: { default: "#121212" } } });
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#22C55E"];

export default function BuyerAnalytics() {
  const { user, token } = useAuth(); // get logged-in buyer info and token
  const [darkMode, setDarkMode] = useState(false);
  const [dashboard, setDashboard] = useState<BuyerDashboardResponse | null>(null);

  useEffect(() => {
    if (!user?.id) return; // wait until user is loaded

    const fetchDashboard = async () => {
      try {
        const data = await buyerDashboardService.getBuyerDashboard(user.id, token);
        setDashboard(data);
      } catch (err) {
        console.error("Failed to fetch buyer dashboard", err);
      }
    };

    fetchDashboard();
  }, [user, token]);

  if (!user?.id) return <Typography>Loading user info...</Typography>;
  if (!dashboard) return <Typography>Loading dashboard...</Typography>;

  // Map metrics from backend
  const metrics = [
    { label: "Total Bids Placed", value: dashboard.stats.total_bids.toString(), subtext: "All time", gradient: "linear-gradient(to right, #3B82F6, #2563EB)" },
    { label: "Number of Auctions Won", value: dashboard.stats.auctions_won.toString(), subtext: "All time", gradient: "linear-gradient(to right, #22C12B, #16A349)" },
    { label: "Total Spend", value: `₹${dashboard.stats.total_spend}`, subtext: "All time", gradient: "linear-gradient(to right, #22C12B, #16A349)" },
    { label: "Average Bid Value", value: `₹${dashboard.stats.avg_bid_value}`, subtext: "All time", gradient: "linear-gradient(to right, #22C12B, #16A349)" },
    { label: "Active Bids", value: dashboard.stats.active_bids.toString(), subtext: "Ongoing auctions", gradient: "linear-gradient(to right, #22C12B, #16A349)" },
  ];

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      {/* Dashboard Header */}
      <AppBar position="static" sx={{ backgroundColor: "#fff" }}  elevation={2}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold">
            Welcome, {user.username} 👋 to {user.user_type} Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>{user.username}</Typography>
            <Avatar>{user.username.charAt(0)}</Avatar>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} color="default" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Metrics Section */}
<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4, // space between cards
    mt: 4,
    mb: 6,
  }}
>
  {metrics.map((metric, index) => (
    <Box
      key={index}
      sx={{
        flex: "1 1 220px",
        maxWidth: 250,

        height: 150,
        background: metric.gradient,
        borderRadius: 4,
        boxShadow: 4,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-10px)",
          boxShadow: 6,
        },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {metric.label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
        {metric.value}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>
        {metric.subtext}
      </Typography>
    </Box>
  ))}
</Box>


      {/* Charts Section */}
<Box sx={{ display: "flex", justifyContent: "center", mt: 8, mb: 5 }}>
  <Grid container spacing={12} sx={{ maxWidth: 1200 }}>
    {/* Line Chart - Spend Over Time */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Amount Spent Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard.spend_over_time}>
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Grid>

    {/* Bar Chart - Auctions per Month */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Auctions Per Month
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboard.auctions_per_month}>
              <Bar dataKey="auctions" fill="#22C55E" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Grid>

    {/* Pie Chart - Top Buyers */}
    <Grid item xs={12} md={6} sx={{ mx: "auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Top Buyers
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                <Pie
                  data={dashboard.top_buyers}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="buyer"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboard.top_buyers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Box>

    </ThemeProvider>
  );
}
