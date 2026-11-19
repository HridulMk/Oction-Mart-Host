"use client";
import React, { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { saveAs } from 'file-saver'; // Optional: for cleaner download handling
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  Button,
  Select,
  MenuItem,
  ListItemButton,
} from "@mui/material";
import { styled, alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { Home, Analytics, ShoppingCart, People, Settings, Search, Brightness4, Brightness7 } from "@mui/icons-material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { dashboardService, DashboardResponse } from "@/api/services/dashboard";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const drawerWidth = 80;
const lowStockThreshold = 150;

const SearchBox = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  flex: 1,
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
}));

const formatMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("default", { month: "short", year: "numeric" });
};

export default function SellerAnalyticsDashboard() {
   const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');

  const theme = createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } });

  const exportCSV = (dataset: any[], filename = 'export.csv') => {
    if (!dataset || dataset.length === 0) return;
    const keys = Object.keys(dataset[0]);
    const csv = [
      keys.join(','),
      ...dataset.map(row => keys.map(k => `"${String(row[k]).replace(/"/g,'""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken') || '';
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('No logged in user found');
        const user = JSON.parse(userStr);
        const sellerId = user.id || user.seller_id;
        if (!sellerId) throw new Error('Seller ID not found');
        const data = await dashboardService.getSellerDashboard(sellerId, token);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Loading dashboard...</Typography>;
  if (!dashboardData) return <Typography>No data available</Typography>;

  const { stats, charts, top_products } = dashboardData;

  const filteredProducts = [...(top_products || [])].filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

 

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {/* Sidebar */}
        <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: darkMode ? '#1e1e2f' : '#DCF5E7' } }}>
          <Toolbar />
          <List>
            {[{ key: 'home', icon: Home }, { key: 'analytics', icon: Analytics }, { key: 'sales', icon: ShoppingCart }, { key: 'buyers', icon: People }, { key: 'settings', icon: Settings }]
              .map(({ key, icon: Icon }) => (
                <ListItem
  component="div" // or "button" if you want native semantics
  
  key={key}
  onClick={() => setActiveTab(key)}
  sx={{ justifyContent: 'center' }}
>
  <ListItemIcon sx={{ minWidth: 0 }}>
    <Icon sx={{ color: darkMode ? '#fff' : '#000' }} />
  </ListItemIcon>
</ListItem>
              ))}
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3, maxWidth: '1600px', margin: '0 auto' }}>
          {/* Header */}
          <AppBar position="static" sx={{ bgcolor: darkMode ? '#2c2c3e' : '#DCF5E7', color: darkMode ? '#fff' : '#000', borderRadius: 2, mb: 3 }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <SearchBox>
                <SearchIconWrapper><Search /></SearchIconWrapper>
                <StyledInputBase placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </SearchBox>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)} size="small" sx={{ mr: 1, bgcolor: darkMode ? '#2a2a3a' : '#E9F5EE' }}>
                  <MenuItem value="7">Last 7</MenuItem>
                  <MenuItem value="30">Last 30</MenuItem>
                  <MenuItem value="90">Last 90</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                </Select>
<Button
  variant="contained"
  size="small"
  onClick={() => {
    if (!user?.id) return;
    window.location.href = `http://127.0.0.1:8000/api/seller/${user.id}/dashboard/csv/`;
  }}
>
  Export CSV
</Button>


                <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">{darkMode ? <Brightness7 /> : <Brightness4 />}</IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Home Dashboard */}
          {activeTab === 'home' && (
            <>
              {/* KPI Cards */}
              <Grid
  container
  spacing={9}
  sx={{
    maxWidth: "1200px",
     // centers the container if needed
    paddingLeft: "100px",
    paddingRight: "4px", // adds space from the left side
  }}
>
  {/* Grid items go here */}

                {[
                  { label: 'Total Sales', value: `₹${stats.total_sales}` },
                  { label: 'Orders', value: stats.orders },
                  { label: 'Active Auctions', value: stats.active_bids },
                  { label: 'Total Buyers', value: stats.total_buyers },
                  { label: 'Avg Order Value', value: `₹${stats.avg_order_value}` },
                  { label: 'Profit Margin', value: `${stats.profit_margin}%` },
                ].map((kpi, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}   >
                    <Card sx={{ borderRadius: 2, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary">{kpi.label}</Typography>
                        <Typography variant="h5" color="textSecondary">{kpi.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

             {/* Charts Section */}
<Grid
  container
  spacing={4}
  mt={20}
  sx={{ paddingTop: 3, 
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
  }}
>
  {/* Revenue Trend */}
  <Grid item xs={12} md={6}>
    <Card>
      <CardContent>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Revenue Trend
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={charts.revenue_trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={formatMonth} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </Grid>

  {/* Orders vs Sales */}
  <Grid item xs={12} md={6}>
    <Card>
      <CardContent>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Orders vs Sales
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={charts.orders_vs_sales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={formatMonth} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#82ca9d" />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </Grid>

  {/* Sales by Category */}
  <Grid item xs={12} md={6}>
    <Card>
      <CardContent>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Sales by Category
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={charts.category_share}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              dataKey="sales"
              label
            >
              {charts.category_share.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <Box mt={2} display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
          {charts.category_share.map((entry, index) => (
            <Box key={`label-${index}`} display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: COLORS[index % COLORS.length],
                }}
              />
              <Typography variant="body2">{entry.category} (₹{entry.sales})</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  </Grid>

  {/* Top Buyers */}
  <Grid item xs={12} sm={12} md={8} lg={6}>
  <Card sx={{ borderRadius: 2, width: "300px" }}>
      <CardContent>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Top Buyers
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[...charts.top_buyers].sort((a, b) => b.total_spent - a.total_spent)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="auction_winner__username"
              tick={{ fontSize: 12 }}
              angle={-20}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip formatter={(value: number) => `₹${value}`} />
            <Legend />
            <Bar dataKey="total_spent" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </Grid>
</Grid>

            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
