"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
import CircularProgress from "@mui/material/CircularProgress";

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
  fetchAssignedItems,
  approveAuctionItem,
  rejectAuctionItem,
  AuctionItem,
  scheduleAuctionItem,
} from "@/api/services/auctions";

// New API import for dashboard data
import { fetchAuctioneerDashboard } from "@/api/services/dashboard"; // Assuming this fetches from the backend URL

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
  switch (status.toLowerCase()) {
    case "live":
      return "success";
    case "upcoming":
      return "primary";
    case "completed":
      return "default";
    case "unknown":
    default:
      return "default";
  }
};

const formatApprovalStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pending Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Unknown Status";
  }
};


const getItemStatusColor = (status: string) => {
    switch (status) {
        case "pending":
            return "#9c27b0";
        case "approved":
            return "#2e7d32";
        case "rejected":
            return "#d32f2f";
        default:
            return "text.secondary";
    }
};

// Helper to format end time (e.g., "in 2h", "Aug 10", "Closed")
const formatEndTime = (auction_end: string | null) => {
  if (!auction_end) return "N/A";
  const endDate = new Date(auction_end);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  if (diffMs < 0) return "Closed";
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `in ${diffHours}h`;
  return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to format currency
const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

// Transform backend stats object to UI array format
const transformStats = (stats: any, revenue: number) => [
  { 
    label: "Total Auctions", 
    value: stats.total_auctions.toString(), 
    color: "#1976d2", 
    trend: "+8%", 
    icon: <GavelIcon /> 
  },
  { 
    label: "Active Bids", 
    value: stats.active_bids.toString(), 
    color: "#2e7d32", 
    trend: "+4.2%", 
    icon: <MonetizationOnIcon /> 
  },
  { 
    label: "Participants", 
    value: stats.participants.toString(), 
    color: "#9c27b0", 
    trend: "+2.1%", 
    icon: <PeopleIcon /> 
  },
  { 
    label: "Revenue", 
    value: formatCurrency(revenue), 
    color: "#ed6c02", 
    trend: "+12%", 
    icon: <TrendingUpIcon /> 
  }
];

// Transform backend auctions to UI format, including full image URL
const transformAuctions = (auctions: any[]) => auctions.map(a => ({
  ...a,
  currentBid: formatCurrency(a.current_bid),
  start_price: formatCurrency(a.start_price),
  endTime: formatEndTime(a.auction_end),
  image: a.image ? `http://localhost:8000${a.image}` : "/images/placeholder.jpg", // Full backend URL or local fallback
  status: a.status.charAt(0).toUpperCase() + a.status.slice(1), // Capitalize status
  category: a.category || "Uncategorized"
}));

/* -------------------------
   Dashboard component
   ------------------------- */

export default function Dashboard() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDark);
  const { user, token, loading: authLoading } = useAuth();

  // header view state: "dashboard" or "reviewSeller"
  const [view, setView] = useState<"dashboard" | "reviewSeller">("dashboard");

  // Auctions search + pagination
  const [auctionQuery, setAuctionQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 6;

  // Review Seller state
  const [reviewItems, setReviewItems] = useState<AuctionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // New states for Dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    license: null,
    notifications: [],
    auctions: [],
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

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
  const filteredAuctions = dashboardData.auctions.filter(a =>
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

    // === New State for Modal and Selected Item ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    





    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    
    const [selectedDateTime, setSelectedDateTime] = useState("");
const [selectedDuration, setSelectedDuration] = useState("");



  // Item Review interactions
  const handleViewItemDetails = (item) => {
    setSelectedItem(item); // store item in state
    setIsScheduleModalOpen(true); // open modal for scheduling
  };

  const handleScheduleSubmit = async () => {
    try {
      await scheduleAuctionItem(selectedItem.id, {
        start_time: selectedDateTime, // example field
        duration: selectedDuration,
      });
      alert("Auction scheduled successfully!");
      setIsScheduleModalOpen(false);
    } catch (error) {
      console.error("Scheduling failed:", error);
      alert("Failed to schedule auction.");
    }
  };

  {isScheduleModalOpen && (
    <div className="modal">
      <h3>Schedule Auction for {selectedItem.name}</h3>
      <input type="datetime-local" onChange={(e) => setSelectedDateTime(e.target.value)} />
      <input type="number" placeholder="Duration (minutes)" onChange={(e) => setSelectedDuration(e.target.value)} />
      <button onClick={handleScheduleSubmit}>Confirm Schedule</button>
    </div>
  )}












  /* -------------------------
     Fetch Pending Items
  ------------------------- */
  useEffect(() => {
    const fetchItems = async () => {
      if (!authLoading && user) {
        setLoading(true);
        try {
          const data = await fetchAssignedItems();
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
  const handleApproveItem = async (itemId: number) => {
    setActionLoading(itemId);
    try {
      await approveAuctionItem(itemId);
      setReviewItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, approval_status: "Approved" } : item
        )
      );
    } catch (err) {
      console.error("Failed to approve item:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // const handleRejectItem = async (id: number) => {
  //   setActionLoading(id);
  //   try {
  //     await rejectAuctionItem(id,reason);
  //     setReviewItems((prev) =>
  //       prev.map((item) =>
  //         item.id === id ? { ...item, approval_status: "Rejected" } : item
  //       )
  //     );
  //   } catch (err) {
  //     console.error("Failed to reject item:", err);
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };
  // Assume you have a state to manage the reason and the ID of the item being rejected.
const [rejectionDetails, setRejectionDetails] = useState({
  itemId: null,
  reason: "",
});

const handleRejectClick = (itemId) => {
  // Show a dialog or form to the user to get the rejection reason.
  // Set the item ID in state to be used later.
  setRejectionDetails({ itemId, reason: "" });
  // Open the dialog.
};

const handleConfirmReject = async () => {
  const { itemId, reason } = rejectionDetails;
  if (!reason.trim()) {
    // Show an error if the reason is empty.
    return;
  }
  // Now, call the function with both arguments.
  await handleRejectItem(itemId, reason);
  // Close the dialog and reset the state.
  setRejectionDetails({ itemId: null, reason: "" });
};

// ...

// The handleRejectItem function should now expect both arguments.
const handleRejectItem = async (itemId, reason) => {
  try {
    setLoading(itemId);
    await rejectAuctionItem(itemId, reason); // ✅ Now this will work.
    setReviewItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, approval_status: "Rejected" } : item
      )
    );
  } catch (err) {
    console.error("Failed to reject item:", err);
  } finally {
    setLoading(null);
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


  const router = useRouter();

  // New useEffect for fetching Dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!authLoading && user?.id) {
        setDashboardLoading(true);
        setDashboardError(null);
        try {
          // Fetch from backend URL: /auctioneer/{auctioneer_id}/dashboard/
          const rawData = await fetchAuctioneerDashboard.getauctioneerDashboard(user.id, token);
          // Transform raw data to match UI expectations
          const transformedStats = transformStats(rawData.stats, rawData.stats.revenue);
          const transformedAuctions = transformAuctions(rawData.auctions || []);
          setDashboardData({
            stats: transformedStats,
            license: {
              ...rawData.license,
              type: "Auctioneer Pro", // Hardcoded fallback
              licenseNumber: rawData.license.license_number || `AU-2025-${user.id}`, // Use actual if available, else fallback
              issuedDate: rawData.license.issue_date || "2025-01-01", // Use actual if available, else fallback
              expiry: rawData.license.expiry_date ? new Date(rawData.license.expiry_date).toISOString().split('T')[0] : "N/A",
              renewalFee: `$${rawData.license.renewal_fee}`
            },
            notifications: rawData.notifications || [], // Empty, so fallback message will show
            auctions: transformedAuctions,
          });
        } catch (err) {
          console.error("Failed to fetch dashboard data:", err);
          setDashboardError("Failed to load dashboard data. Please try again.");
        } finally {
          setDashboardLoading(false);
        }
      }
    };
    fetchDashboardData();
  }, [authLoading, user?.id, token]);

  // Fallback to empty arrays/objects if loading or error
  if (dashboardLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (dashboardError) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Typography color="error">{dashboardError}</Typography>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Box>
      </ThemeProvider>
    );
  }

  
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
  sx={{
    minWidth: 300,
    flex: 1,
    '& .MuiOutlinedInput-root': {
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
    backgroundColor: '#1a1a1a',
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
              <MenuItem value="pending">Pending Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
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
                    background: `ur[](http://127.0.0.1:8000${item.image})`,
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
  Status: {formatApprovalStatus(item.approval_status|| "Pending Review")}

</Typography>



                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => router.push(`/items/${item.id}`)}
                        style={{ 
                          textTransform: 'none',
                          borderColor: '#404040',
                          color: '#ffffff'
                        }}
                      >
                        Set Auction
                      </Button>
                      
                      {(item.approval_status) === "pending" ? (
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
              {view === "reviewSeller" ? "Review Seller Items" : "Auctioneer Dashboard"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {view === "reviewSeller" ? "Manage and approve seller submissions" : "Manage auctions, view stats and notifications"}
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
              <Badge badgeContent={dashboardData.notifications.length} color="error">
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
              {dashboardData.stats.map((stat, idx) => (
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

                    {dashboardData.license ? (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Chip label={dashboardData.license.status} color="success" sx={{ mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            <strong>License Type:</strong> {dashboardData.license.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>License Number:</strong> {dashboardData.license.licenseNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Issued Date:</strong> {dashboardData.license.issuedDate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Expiry Date:</strong> {dashboardData.license.expiry}
                          </Typography>

                          <Box sx={{ bgcolor: "info.light", p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "info.main" }}>
                            <Typography variant="body2" sx={{ color: "black", fontWeight: 600 }}>
                              Renewal Fee: {dashboardData.license.renewalFee}
                            </Typography>
                          </Box>
                        </Box>

                        <Button variant="outlined" fullWidth sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600 }}>
                          Renew License
                        </Button>
                      </>
                    ) : (
                      <Typography color="text.secondary">No license data available.</Typography>
                    )}
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
                      {dashboardData.notifications.map((n) => (
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
                      {dashboardData.notifications.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                          No notifications yet.
                        </Typography>
                      )}
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
                                  <Button size="small" variant="outlined" startIcon={<VisibilityIcon />}  onClick={() => router.push(`/product2/${auction.id}`)}  sx={{ flex: 1, textTransform: "none" }}>View</Button>

                                  {auction.status.toLowerCase() === "live" ? (
                                    <Button size="small" variant="contained" color="error" onClick={() => handleCloseAuction(auction.id)} sx={{ flex: 1, textTransform: "none" }}>
                                      Close
                                    </Button>
                                  ) : (
                                    <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => router.push(`/items/${auction.id}`)} sx={{ flex: 1, textTransform: "none" }}>
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