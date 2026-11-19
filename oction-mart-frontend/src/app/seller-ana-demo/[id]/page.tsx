"use client";
import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  styled,
  alpha,
  createTheme,
  ThemeProvider,
} from "@mui/material/styles";
import {
  Home,
  Analytics,
  ShoppingCart,
  People,
  Settings,
  Search,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
    dashboardService,
    DashboardResponse,
  } from "@/api/services/dashboard";

  
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];


// Dummy data
const salesData = [
  { month: "Jan", sales: 4000, orders: 3000 },
  { month: "Feb", sales: 3000, orders: 2500 },
  { month: "Mar", sales: 5000, orders: 4000 },
  { month: "Apr", sales: 4780, orders: 4000 },
  { month: "May", sales: 5890, orders: 5000 },
  { month: "Jun", sales: 4390, orders: 4000 },
  { month: "Jul", sales: 4490, orders: 4000 },
];

const productData = [
  { name: "Shoes", value: 400 },
  { name: "Bags", value: 300 },
  { name: "Watches", value: 200 },
  { name: "Clothes", value: 100 },
];

const buyersData = [
  { name: "John", sale: 400 },
  { name: "Alice", sale: 300 },
  { name: "David", sale: 200 },
  { name: "Sara", sale: 100 },
];

const regionData = [
  { region: "Ernakulam", sales: 2000 },
  { region: "Kozhikode", sales: 3500 },
  { region: "Kottayam", sales: 1500 },
  { region: "Trivandrum", sales: 3000 },
];

const funnelData = [
  { stage: "Visits", value: 8000 },
  { stage: "Bids", value: 5000 },
  { stage: "Purchases", value: 3000 },
  { stage: "Successful Sales", value: 2000 },
];

const salesDataDaily = [
  { day: "Mon", sales: 400 },
  { day: "Tue", sales: 300 },
  { day: "Wed", sales: 500 },
  { day: "Thu", sales: 700 },
  { day: "Fri", sales: 600 },
  { day: "Sat", sales: 800 },
  { day: "Sun", sales: 900 },
];

const salesDataWeekly = [
  { week: "Week 1", sales: 1500 },
  { week: "Week 2", sales: 2000 },
  { week: "Week 3", sales: 1800 },
  { week: "Week 4", sales: 2200 },
];

const salesDataHours = [
  { hour: "00-03", sales: 50 },
  { hour: "03-06", sales: 30 },
  { hour: "06-09", sales: 150 },
  { hour: "09-12", sales: 300 },
  { hour: "12-15", sales: 400 },
  { hour: "15-18", sales: 500 },
  { hour: "18-21", sales: 600 },
  { hour: "21-24", sales: 200 },
];
const getColor = (value: number) => {
  if (value < 100) return "#d6eaf8";
  if (value < 300) return "#5dade2";
  if (value < 500) return "#2e86c1";
  return "#1b4f72";
};

const drawerWidth = 80;

// Search Box
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

export default function SellerAnalyticsDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );  
  const [dateRange, setDateRange] = useState<"7" | "30" | "90" | "all">("30");
  const [productSort, setProductSort] = useState<"value_desc" | "value_asc">(
    "value_desc"
    
  );
  const lowStockThreshold = 150;

  // Filter helpers - example uses simple rules for demo datasets
  const filterSalesByRange = (range: string) => {
    if (range === "all") return salesData;
    // range '7','30','90' - for demo map to last N months from salesData
    const n = Number(range) === 7 ? 2 : Number(range) === 30 ? 4 : 6; // rough mapping to months
    return salesData.slice(Math.max(0, salesData.length - n));
  };

  const filteredBuyers = buyersData.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = [...productData]
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) =>
      productSort === "value_desc" ? b.value - a.value : a.value - b.value
    );

  const lowStockProducts = productData.filter(
    (p) => p.value <= lowStockThreshold
  );

  // Simple linear forecast using last two months of salesData
  const computeSalesForecast = (monthsToProject = 3) => {
    if (salesData.length < 2) return [];
    const last = salesData[salesData.length - 1].sales;
    const prev = salesData[salesData.length - 2].sales;
    const slope = last - prev; // change per month (very naive)
    const forecast = [];
    let current = last;
    for (let i = 1; i <= monthsToProject; i++) {
      current = current + slope; // naive projection
      forecast.push({
        month: `P+${i}`,
        sales: Math.max(Math.round(current), 0),
      });
    }
    return forecast;
  };

  // Export visible data to CSV
  const exportCSV = (dataset: any[], filename = "export.csv") => {
    if (!dataset || dataset.length === 0) return;
    const keys = Object.keys(dataset[0]);
    const csv = [
      keys.join(","),
      ...dataset.map((row) =>
        keys.map((k) => `"${String(row[k]).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const theme = createTheme({
    palette: { mode: darkMode ? "dark" : "light" },
  });



  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const userStr = localStorage.getItem("user"); // ✅ fetch logged-in user
        if (!userStr) throw new Error("No logged in user found");

        const user = JSON.parse(userStr);
        const sellerId = user.id || user.seller_id; // ✅ adjust based on your API response
        if (!sellerId) throw new Error("Seller ID not found in user data");

        const data = await dashboardService.getSellerDashboard(sellerId, token);
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Loading dashboard...</Typography>;
  if (!dashboardData) return <Typography>No data available</Typography>;

  const { stats, charts } = dashboardData;




  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: darkMode ? "#1e1e2f" : "#fff",
            },
          }}
        >
          <Toolbar />
          <List>
            {[
              { key: "home", icon: Home },
              { key: "analytics", icon: Analytics },
              { key: "sales", icon: ShoppingCart },
              { key: "buyers", icon: People },
              { key: "settings", icon: Settings },
            ].map(({ key, icon: Icon }) => (
              <ListItem
                button
                key={key}
                onClick={() => setActiveTab(key)}
                sx={{ justifyContent: "center" }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <Icon sx={{ color: darkMode ? "#fff" : "#000" }} />
                </ListItemIcon>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            maxWidth: "1600px",
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <AppBar
            position="static"
            sx={{
              bgcolor: darkMode ? "#2c2c3e" : "#f5f5f5",
              color: darkMode ? "#fff" : "#000",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
              <SearchBox>
                <SearchIconWrapper>
                  <Search />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchBox>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  size="small"
                  sx={{ mr: 1, bgcolor: darkMode ? "#2a2a3a" : "#fff" }}
                >
                  <MenuItem value="7">Last 7</MenuItem>
                  <MenuItem value="30">Last 30</MenuItem>
                  <MenuItem value="90">Last 90</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                </Select>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    // export dataset depending on activeTab
                    if (activeTab === "buyers")
                      exportCSV(filteredBuyers, "buyers.csv");
                    else if (activeTab === "sales")
                      exportCSV(salesDataDaily, "sales_daily.csv");
                    else if (activeTab === "analytics")
                      exportCSV(salesData, "sales_monthly.csv");
                    else exportCSV(productData, "products.csv");
                  }}
                >
                  Export CSV
                </Button>
                <IconButton
                  onClick={() => setDarkMode(!darkMode)}
                  color="inherit"
                >
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Home Dashboard */}
          {activeTab === "home" && (
            <>
              <Grid container spacing={2}>
                {[
                   { label: "Total Sales", value: `₹${stats.total_sales}` },
                   { label: "Orders", value: stats.orders },
                   { label: "Active Bids", value: stats.active_bids },
                   { label: "Total Buyers", value: stats.total_buyers },
                   { label: "Avg Order Value", value: `₹${stats.avg_order_value}` },
                   { label: "Profit Margin", value: `${stats.profit_margin}%` },
                ].map((kpi, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">{kpi.label}</Typography>
                        <Typography variant="h5">{kpi.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Revenue Trend */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Revenue Trend</Typography>
                      <ResponsiveContainer width={250} height={250}>
                        <LineChart data={charts.revenue_trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#8884d8"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Orders vs Sales */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Orders vs Sales</Typography>
                      <ResponsiveContainer width={250} height={250}>
                        <BarChart data={charts.orders_vs_sales}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
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

        
               {/* Product Category Share */}
<Grid item xs={12} md={6}>
  <Card>
    <CardContent>
      <Typography variant="h6">Product Category Share</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={charts.category_share}
            cx="50%"
            cy="45%"   // move chart a little up to make space
            outerRadius={80}
            innerRadius={40}
            dataKey="sales"
            label
          >
            {charts.category_share.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Category names below */}
      <Box mt={2} display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
        {charts.category_share.map((entry, index) => (
          <Box key={index} display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: COLORS[index % COLORS.length],
              }}
            />
            <Typography variant="body2">{entry.category}</Typography>
          </Box>
        ))}
      </Box>
    </CardContent>
  </Card>
</Grid>


                {/* Top Buyers */}
                <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Top Buyers</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={charts.top_buyers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="auction_winner__username" />
                      <YAxis />
                      <Tooltip />
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

          {/* Analytics Dashboard */}
          {activeTab === "analytics" && (
            <Grid container spacing={2}>
              {/* Revenue Over Time */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Revenue Over Time</Typography>
                    <ResponsiveContainer width={250} height={250}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#8884d8"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sales by Category */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Sales by Category</Typography>
                    <ResponsiveContainer width={250} height={250}>
                      <PieChart>
                        <Pie
                          data={productData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                          label
                        >
                          {productData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sales by Region */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Sales by Region</Typography>
                    <ResponsiveContainer width={250} height={250}>
                      <BarChart data={regionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sales Funnel */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Sales Funnel</Typography>
                    <ResponsiveContainer width={300} height={250}>
                      <BarChart data={funnelData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="stage" type="category" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              {/* --- New: Top Products, Inventory Alerts, Forecast --- */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {/* Top Products Table */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6">Top Products</Typography>
                          <Select
                            value={productSort}
                            onChange={(e) =>
                              setProductSort(e.target.value as any)
                            }
                            size="small"
                          >
                            <MenuItem value="value_desc">Value ↓</MenuItem>
                            <MenuItem value="value_asc">Value ↑</MenuItem>
                          </Select>
                        </Box>

                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell align="right">Value / Stock</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredProducts.map((p, i) => (
                              <TableRow key={i}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell align="right">{p.value}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Inventory Alerts */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Inventory Alerts</Typography>
                        {lowStockProducts.length === 0 ? (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            All good — no low-stock items.
                          </Typography>
                        ) : (
                          <List>
                            {lowStockProducts.map((p, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <ShoppingCart />
                                </ListItemIcon>
                                <Box>
                                  <Typography variant="subtitle2">
                                    {p.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    Stock: {p.value} (below {lowStockThreshold})
                                  </Typography>
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Sales Forecast */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          Sales Forecast (next 3 months)
                        </Typography>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart
                            data={[...salesData, ...computeSalesForecast(3)]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="sales"
                              stroke="#8884d8"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          (Naive linear forecast based on the most recent
                          monthly change — replace with a proper model for
                          production.)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
          {/* Home Dashboard */}
          {activeTab === "sales" && (
            <Box p={3}>
              <Typography variant="h4" mb={3}>
                Sales Analytics
              </Typography>

              <Grid container spacing={3}>
                {/* Daily Sales Trend */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Daily Sales Trend
                      </Typography>
                      <ResponsiveContainer width={300} height={300}>
                        <LineChart data={salesDataDaily}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Weekly/Monthly Sales */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Weekly Sales
                      </Typography>
                      <ResponsiveContainer width={300} height={300}>
                        <BarChart data={salesDataWeekly}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="sales" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Peak Sales Hours */}
                {/* Peak Sales Hours */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Peak Sales Hours
                      </Typography>
                      <ResponsiveContainer width={300} height={300}>
                        <BarChart data={salesDataHours}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="sales"
                            label={{ position: "top" }}
                            shape={(props: any) => {
                              const { x, y, width, height, payload } = props;
                              return (
                                <rect
                                  x={x}
                                  y={y}
                                  width={width}
                                  height={height}
                                  fill={getColor(Number(payload.sales))}
                                />
                              );
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          {/* Buyers Dashboard */}
          {activeTab === "buyers" && (
            <Box p={3}>
              <Typography variant="h4" mb={3}>
                Buyers Analytics
              </Typography>

              {/* KPI Cards */}
              <Grid container spacing={2} mb={3}>
                {[
                  { label: "Total Buyers", value: "1,250" },
                  { label: "Repeat Buyers", value: "430" },
                  { label: "New Buyers", value: "820" },
                  { label: "Avg Spend / Buyer", value: "Rs.12,000" },
                ].map((kpi, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2">{kpi.label}</Typography>
                        <Typography variant="h5">{kpi.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Charts */}
              <Grid container spacing={3}>
                {/* Top Buyers Leaderboard */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Top Buyers</Typography>
                      <ResponsiveContainer width={250} height={250}>
                        <BarChart data={buyersData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="sale" fill="#0088FE" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* New vs Repeat Buyers */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">New vs Repeat Buyers</Typography>
                      <ResponsiveContainer width={250} height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "New Buyers", value: 820 },
                              { name: "Repeat Buyers", value: 430 },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={40}
                            label
                            dataKey="value"
                          >
                            <Cell fill="#82ca9d" />
                            <Cell fill="#8884d8" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Buyers by Region */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Buyers by Region</Typography>
                      <ResponsiveContainer width={250} height={250}>
                        <BarChart data={regionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="region" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sales" fill="#FF8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Buyer Retention Trend */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        Buyer Retention Trend
                      </Typography>
                      <ResponsiveContainer width={250} height={250}>
                        <LineChart
                          data={[
                            { month: "Jan", repeat: 100 },
                            { month: "Feb", repeat: 120 },
                            { month: "Mar", repeat: 150 },
                            { month: "Apr", repeat: 170 },
                            { month: "May", repeat: 180 },
                            { month: "Jun", repeat: 200 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="repeat"
                            stroke="#2e86c1"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

