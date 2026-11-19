"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Badge from "@mui/material/Badge";
import Switch from "@mui/material/Switch";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GavelIcon from "@mui/icons-material/Gavel";
import PeopleIcon from "@mui/icons-material/People";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import CameraIcon from "@mui/icons-material/Camera";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BookIcon from "@mui/icons-material/Book";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { useAuth } from "@/context/AuthContext";
import {
  fetchPendingItems,
  approveAuctionItem,
  rejectAuctionItem,
  SellerAuctionItem,
} from "@/api/services/auctioneerR";

/* -------------------------
   Shared style / helpers
   ------------------------- */

const cardContentSx = { p: 3 }; // p:3 -> ~24px
const auctionCardContentSx = { p: 2 }; // inner auction card content
const cardBaseSx = (theme: any) => ({
  borderRadius: 2,
  background:
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.95)",
  backdropFilter: "blur(6px)",
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`
});

const getStatusChipColor = (status: string) => {
  switch (status) {
    case "Live":
      return "success";
    case "Upcoming":
      return "primary";
    case "Completed":
      return "default";
    default:
      return "default";
  }
};

const getItemStatusColor = (status: string) => {
    switch (status) {
        case "Pending Review":
            return "#9c27b0";
        case "Approved":
            return "#2e7d32";
        case "Rejected":
            return "#d32f2f";
        default:
            return "text.secondary";
    }
};

/* -------------------------
   Mock data (replace with real)
   ------------------------- */
const mockStats = [
  { label: "Total Auctions", value: 128, color: "#1976d2", trend: "+8%", icon: <GavelIcon /> },
  { label: "Active Bids", value: 43, color: "#2e7d32", trend: "+4.2%", icon: <MonetizationOnIcon /> },
  { label: "Participants", value: 769, color: "#9c27b0", trend: "+2.1%", icon: <PeopleIcon /> },
  { label: "Revenue", value: "$24.5k", color: "#ed6c02", trend: "+12%", icon: <TrendingUpIcon /> }
];

const mockLicense = {
  status: "Active",
  type: "Auctioneer Pro",
  licenseNumber: "AU-2024-0012",
  issuedDate: "2024-03-04",
  expiry: "2026-03-04",
  renewalFee: "$120"
};

const mockNotifications = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  type: i % 3 === 0 ? "bid" : i % 3 === 1 ? "reminder" : "license",
  message: i % 3 === 0 ? `New bid #${i + 1} placed` : i % 3 === 1 ? `Reminder: Auction #${i + 1}` : `License update #${i + 1}`,
  time: `${i + 1}h ago`
}));

const mockAuctions = [
  { id: 1, title: "Antique Vase", image: "/images/vase.jpg", status: "Live", category: "Antiques", currentBid: "$320", bids: 12, participants: 8, endTime: "in 2h" },
  { id: 2, title: "Vintage Watch", image: "/images/watch.jpg", status: "Upcoming", category: "Watches", currentBid: "$0", bids: 0, participants: 0, endTime: "Aug 10" },
  { id: 3, title: "Signed Jersey", image: "/images/jersey.jpg", status: "Completed", category: "Sports Memorabilia", currentBid: "$1,200", bids: 18, participants: 14, endTime: "Closed" },
  { id: 4, title: "Retro Radio", image: "/images/radio.jpg", status: "Live", category: "Electronics", currentBid: "$85", bids: 5, participants: 4, endTime: "in 3h" },
  { id: 5, title: "Oil Painting", image: "/images/painting.jpg", status: "Upcoming", category: "Art", currentBid: "$0", bids: 0, participants: 0, endTime: "Aug 20" },
  { id: 6, title: "Vintage Camera", image: "/images/camera.jpg", status: "Completed", category: "Photography", currentBid: "$520", bids: 22, participants: 16, endTime: "Closed" },
  { id: 7, title: "Rare Book", image: "/images/book.jpg", status: "Live", category: "Books", currentBid: "$75", bids: 3, participants: 2, endTime: "in 1h" },
  { id: 8, title: "Porcelain Bowl", image: "/images/bowl.jpg", status: "Upcoming", category: "Antiques", currentBid: "$0", bids: 0, participants: 0, endTime: "Aug 25" },
];


/* -------------------------
   Dashboard component
   ------------------------- */

export default function Dashboard() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDark);
  const { user, loading: authLoading } = useAuth();

  // header view state: "dashboard" or "reviewSeller"
  const [view, setView] = useState<"dashboard" | "reviewSeller">("dashboard");

  // Auctions search + pagination
  const [auctionQuery, setAuctionQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 6;

  // Review Seller state
  const [reviewItems, setReviewItems] = useState<SellerAuctionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);


  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#1976d2" },
          secondary: { main: "#9c27b0" }
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: "none"
              }
            }
          }
        }
      }),
    [darkMode]
  );

  // Auctions interactions
  const handleViewAuction = (auction: any) => console.log("View", auction);
  const handleCloseAuction = (id: number | string) => console.log("Close", id);

  // Filter auctions by search query (title or category)
  const filteredAuctions = mockAuctions.filter(a =>
    (a.title + " " + a.category).toLowerCase().includes(auctionQuery.toLowerCase())
  );

  const pagedAuctions = filteredAuctions.slice(page * pageSize, (page + 1) * pageSize);

  const canPrev = page > 0;
  const canNext = (page + 1) * pageSize < filteredAuctions.length;

  // Reset page when query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuctionQuery(e.target.value);
    setPage(0);
  };
    
  // Item Review interactions
  const handleViewItemDetails = (item: any) => {
    console.log("Viewing item details:", item);
  };


  /* -------------------------
     Fetch Pending Items
  ------------------------- */
  useEffect(() => {
    const fetchItems = async () => {
      if (!authLoading && user) {
        setLoading(true);
        try {
          const data = await fetchPendingItems();
          // ✅ only show items assigned to this auctioneer
          const filtered = user?.id
            ? data.filter(
                (item) => item.assigned_auctioneer === Number(user.id)
              )
            : data;
          setReviewItems(filtered);
        } catch (err) {
          console.error("Failed to fetch items for review:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchItems();
  }, [authLoading, user]);



    /* -------------------------
     Approve & Reject Actions
  ------------------------- */
  const handleApproveItem = async (id: number) => {
    setActionLoading(id);
    try {
      await approveAuctionItem(id);
      setReviewItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, approval_status: "Approved" } : item
        )
      );
    } catch (err) {
      console.error("Failed to approve item:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectItem = async (id: number) => {
    setActionLoading(id);
    try {
      await rejectAuctionItem(id);
      setReviewItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, approval_status: "Rejected" } : item
        )
      );
    } catch (err) {
      console.error("Failed to reject item:", err);
    } finally {
      setActionLoading(null);
    }
  };

 
  // Filter items (search + status)
  const filteredItems = useMemo(() => {
    let items = reviewItems;
    if (searchTerm) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(item.seller).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "All Statuses") {
      items = items.filter(
        (item) =>
          (item.approval_status || "Pending Review") === statusFilter
      );
    }
    return items;
  }, [reviewItems, searchTerm, statusFilter]);
  
  const renderReviewSellerItems = () => (
    <Card style={{
      borderRadius: '8px',
      background: '#2a2a2a',
      border: '1px solid #404040'
    }}>
      <CardContent style={{ padding: '24px' }}>
        {/* Search and Filter Section */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <TextField
            placeholder="Search by Item Title or Seller ID..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              minWidth: '300px',
              flex: 1,
              '& .MuiOutlinedInputRoot': {
                '& fieldset': {
                  borderColor: '#404040',
                },
                '&:hover fieldset': {
                  borderColor: '#9c27b0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#9c27b0',
                },
              },
              '& .MuiInputBase-input': {
                color: '#ffffff',
              },
              '& .MuiInputLabel-root': {
                color: '#b0b0b0',
              },
            }}
            InputProps={{
              style: {
                color: '#ffffff',
                backgroundColor: '#1a1a1a',
                borderColor: '#404040'
              }
            }}
          />
          <FormControl size="small" style={{ minWidth: '200px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              style={{
                color: '#ffffff',
                backgroundColor: '#1a1a1a',
                borderColor: '#404040'
              }}
            >
              <MenuItem value="All Statuses">All Statuses</MenuItem>
              <MenuItem value="Pending Review">Pending Review</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            style={{
              background: '#9c27b0',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Apply Filters
          </Button>
        </div>

        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredItems.map((item) => (
            <Card key={item.id} style={{
              borderRadius: '8px',
              border: '1px solid #404040',
              background: '#1a1a1a',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <CardContent style={{ padding: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  {/* Item Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    background: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0
                  }} />
                  
                  {/* Item Details */}
                  <div style={{ flex: 1 }}>
                    <Typography variant="h6" style={{ 
                      fontWeight: 600, 
                      marginBottom: '8px',
                      fontSize: '18px',
                      color: '#ffffff'
                    }}>
                      {item.title}
                    </Typography>
                    
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
                      <Typography variant="body2" style={{ color: '#b0b0b0' }}>
                        <strong>Submitted by:</strong> Seller ID: {item.seller}
                      </Typography>
                      <Typography variant="body2" style={{ color: '#b0b0b0' }}>
                      Created At: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                      </Typography>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                      
                      <Typography variant="body2" style={{ color: '#b0b0b0' }}>
                        <strong>Starting Bid:</strong> {item.start_price}
                      </Typography>
                    </div>
                    
                    <Typography variant="body2" style={{ color: '#b0b0b0', marginBottom: '12px' }}>
                      {item.description}
                    </Typography>
                  </div>
                  
                  {/* Status and Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '12px',
                    minWidth: '200px'
                  }}>
                    <Typography
  variant="body2"
  style={{
    color: getItemStatusColor(item.approval_status || "Pending Review"),
    fontWeight: 600
  }}
>
  Status: {item.approval_status || "Pending Review"}
</Typography>

                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewItemDetails(item)}
                        style={{ 
                          textTransform: 'none',
                          borderColor: '#404040',
                          color: '#ffffff'
                        }}
                      >
                        View Details
                      </Button>
                      
                      {(item.approval_status || "Pending Review") === "Pending Review" ? (
  <>
    <Button
      size="small"
      variant="contained"
      color="success"
      onClick={() => handleApproveItem(item.id)}
      style={{ textTransform: "none" }}
    >
      Approve
    </Button>
    <Button
      size="small"
      variant="contained"
      color="error"
      onClick={() => handleRejectItem(item.id)}
      style={{ textTransform: "none" }}
    >
      Reject
    </Button>
  </>
) : (
  <Button
    size="small"
    variant="outlined"
    disabled
    style={{
      textTransform: "none",
      borderColor: "#404040",
      color: "#666666"
    }}
  >
    {item.approval_status}
  </Button>
)}

                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        {/* Top header: title + toggle + view switcher */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Auctioneer Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage auctions, view stats and notifications
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* View switcher: Dashboard / Review Seller */}
            <Box>
              <Button
                variant={view === "dashboard" ? "contained" : "outlined"}
                onClick={() => setView("dashboard")}
                sx={{ mr: 1, textTransform: "none" }}
              >
                Dashboard
              </Button>
              <Button
                variant={view === "reviewSeller" ? "contained" : "outlined"}
                onClick={() => setView("reviewSeller")}
                sx={{ textTransform: "none" }}
              >
                Review Seller
              </Button>
            </Box>

            <IconButton>
              <Badge badgeContent={mockNotifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption">{darkMode ? "Dark" : "Light"}</Typography>
              <Switch checked={darkMode} onChange={() => setDarkMode((s) => !s)} />
            </Box>
          </Box>
        </Box>

        {/* Conditional rendering based on view state */}
        {view === "reviewSeller" ? (
          renderReviewSellerItems()
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 3 }}>
              {mockStats.map((stat, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card sx={(t) => ({ ...cardBaseSx(t), transition: "transform 0.18s ease", cursor: "pointer" })}>
                    <CardContent sx={cardContentSx}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {stat.label}
                          </Typography>
                          <Chip label={stat.trend} size="small" sx={{ bgcolor: `${stat.color}22`, color: stat.color, fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ bgcolor: `${stat.color}15`, borderRadius: 2, p: 1.5 }}>
                          {stat.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Main content area: left (stacked) + right (auction stretched to match left height) */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                alignItems: "stretch", // children stretch to same height
              }}
            >
              {/* LEFT: stacked License + Notifications */}
              <Box
                sx={{
                  width: { xs: "100%", md: "33.333%" }, // md = 4/12
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                {/* License Card */}
                <Card sx={(t) => ({ ...cardBaseSx(t) })}>
                  <CardContent sx={cardContentSx}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <AccountCircleIcon color="primary" /> License Status
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip label={mockLicense.status} color="success" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>License Type:</strong> {mockLicense.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>License Number:</strong> {mockLicense.licenseNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Issued Date:</strong> {mockLicense.issuedDate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Expiry Date:</strong> {mockLicense.expiry}
                      </Typography>

                      <Box sx={{ bgcolor: "info.light", p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "info.main" }}>
                        <Typography variant="body2" sx={{ color: "black", fontWeight: 600 }}>
                          Renewal Fee: {mockLicense.renewalFee}
                        </Typography>
                      </Box>
                    </Box>

                    <Button variant="outlined" fullWidth sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}>
                      Renew License
                    </Button>
                  </CardContent>
                </Card>

                {/* Notifications Card (scrollable) */}
                <Card sx={(t) => ({ ...cardBaseSx(t) })}>
                  <CardContent sx={cardContentSx}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <NotificationsIcon sx={{ color: "warning.main" }} /> Recent Notifications
                    </Typography>

                    {/* Scrollable notifications */}
                    <List sx={{ p: 0, maxHeight: 385, overflow: "auto" }}>
                      {mockNotifications.map((n) => (
                        <React.Fragment key={n.id}>
                          <ListItem sx={{ py: 1 }}>
                            <ListItemAvatar>
                              <Avatar sx={{
                                width: 32, height: 32,
                                bgcolor:
                                  n.type === "bid" ? "success.main" :
                                    n.type === "reminder" ? "warning.main" : "primary.main"
                              }}>
                                {n.type === "bid" ? <AttachMoneyIcon sx={{ fontSize: 16 }} /> :
                                  n.type === "reminder" ? <AccessTimeIcon sx={{ fontSize: 16 }} /> :
                                    <AccountCircleIcon sx={{ fontSize: 16 }} />}
                              </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                              primary={n.message}
                              secondary={n.time}
                              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* RIGHT: Auction Management (stretched to equal height of left combined stack) */}
              <Box
                sx={{
                  width: { xs: "100%", md: "66.666%" }, // md = 8/12
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Card
                  sx={(t) => ({
                    ...cardBaseSx(t),
                    // Make this card fill the full height of the row (which equals left's combined height)
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  })}
                >
                  {/* CardContent header */}
                  <CardContent sx={{ ...cardContentSx, flex: "0 0 auto" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                        <GavelIcon color="primary" /> Auction Management
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <TextField
                          size="small"
                          placeholder="Search auctions..."
                          value={auctionQuery}
                          onChange={handleSearchChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ minWidth: 220 }}
                        />

                        <Chip label="All" color="primary" />
                        <Chip label="Live" variant="outlined" />
                        <Chip label="Upcoming" variant="outlined" />
                        <Chip label="Completed" variant="outlined" />
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Auctions list area: flexible and scrollable to fit the available space */}
                  <Box sx={{ flex: "1 1 auto", overflow: "auto", p: 2 }}>
                    <Grid container spacing={2} justifyContent="center">
                      {pagedAuctions.length === 0 ? (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">No auctions found.</Typography>
                        </Grid>
                      ) : (
                        pagedAuctions.map((auction) => (
                          <Grid item xs={12} sm={6} md={4} key={auction.id}>
                            <Card
                              sx={{
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                transition: "transform 0.18s ease",
                                cursor: "pointer",
                                "&:hover": { transform: "translateY(-6px)" }
                              }}
                            >
                              <Box sx={{
                                height: 120,
                                backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05)), url(${auction.image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "12px 12px 0 0",
                                position: "relative"
                              }}>
                                <Chip
                                  label={auction.status}
                                  color={getStatusChipColor(auction.status)}
                                  size="small"
                                  sx={{ position: "absolute", top: 1, right: 1, fontWeight: 600 }}
                                />
                                <Box sx={{
                                  position: "absolute",
                                  bottom: 1,
                                  left: 1,
                                  bgcolor: "rgba(0,0,0,0.7)",
                                  color: "#fff",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 0.5,
                                  fontSize: 12
                                }}>
                                  {auction.category}
                                </Box>
                              </Box>

                              <CardContent sx={auctionCardContentSx}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                  {auction.title}
                                </Typography>

                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">Current Bid:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>{auction.currentBid}</Typography>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">Bids:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{auction.bids}</Typography>
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, color: "text.secondary", fontSize: 12 }}>
                                  <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="caption" color="text.secondary">Ends: {auction.endTime}</Typography>
                                </Box>

                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => handleViewAuction(auction)} sx={{ flex: 1, textTransform: "none" }}>View</Button>

                                  {auction.status === "Live" ? (
                                    <Button size="small" variant="contained" color="error" onClick={() => handleCloseAuction(auction.id)} sx={{ flex: 1, textTransform: "none" }}>
                                      Close
                                    </Button>
                                  ) : (
                                    <Button size="small" variant="outlined" startIcon={<EditIcon />} sx={{ flex: 1, textTransform: "none" }}>
                                      Edit
                                    </Button>
                                  )}
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))
                      )}
                    </Grid>
                  </Box>

                  {/* Footer area inside the auction card for pagination controls */}
                  <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Button
                        startIcon={<ArrowBackIosNewIcon />}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={!canPrev}
                        sx={{ textTransform: "none" }}
                      >
                        Previous
                      </Button>
                      <Button
                        endIcon={<ArrowForwardIosIcon />}
                        onClick={() => setPage(p => p + 1)}
                        disabled={!canNext}
                        sx={{ textTransform: "none", ml: 1 }}
                      >
                        Next
                      </Button>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, filteredAuctions.length)} of {filteredAuctions.length}
                    </Typography>
                  </Box>
                </Card>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}